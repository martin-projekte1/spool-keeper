import { and, count, eq, inArray } from 'drizzle-orm'
import { colors, featuresTable, filamentFeatures, filaments, manufacturers, materials } from '#server/db/schema'

function normalizeId(input: unknown, fieldName: string): number {
  const id = Number(input)
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: `${fieldName} must be a positive integer` })
  }
  return id
}

export function normalizeRouteId(input: string | undefined, fieldName = 'id'): number {
  return normalizeId(input, fieldName)
}

async function assertOwnedId(
  id: number,
  userId: string,
  kind: 'filament' | 'material' | 'manufacturer' | 'color'
) {
  const table =
    kind === 'filament' ? filaments
      : kind === 'material' ? materials
        : kind === 'manufacturer' ? manufacturers
          : colors

  const [row] = await db
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.id, id), eq(table.userId, userId)))
    .limit(1)

  if (!row) {
    throw createError({
      statusCode: 403,
      statusMessage: `${kind} does not belong to current user`,
    })
  }
}

export async function assertOwnedFilamentId(userId: string, filamentIdInput: unknown): Promise<number> {
  const filamentId = normalizeId(filamentIdInput, 'filamentId')
  await assertOwnedId(filamentId, userId, 'filament')
  return filamentId
}

export async function validateOwnedFilamentReferences(
  userId: string,
  refs: {
    materialId?: unknown
    manufacturerId?: unknown
    colorId?: unknown
    featureIds?: unknown
  },
) {
  const materialId = refs.materialId == null ? null : normalizeId(refs.materialId, 'materialId')
  const manufacturerId = refs.manufacturerId == null ? null : normalizeId(refs.manufacturerId, 'manufacturerId')
  const colorId = refs.colorId == null ? null : normalizeId(refs.colorId, 'colorId')

  if (materialId !== null) await assertOwnedId(materialId, userId, 'material')
  if (manufacturerId !== null) await assertOwnedId(manufacturerId, userId, 'manufacturer')
  if (colorId !== null) await assertOwnedId(colorId, userId, 'color')

  const rawFeatureIds = Array.isArray(refs.featureIds) ? refs.featureIds : []
  const normalizedFeatureIds = Array.from(
    new Set(rawFeatureIds.map(featureId => normalizeId(featureId, 'featureId'))),
  )

  if (normalizedFeatureIds.length !== rawFeatureIds.length) {
    throw createError({ statusCode: 400, statusMessage: 'featureIds must not contain duplicates' })
  }

  if (normalizedFeatureIds.length > 0) {
    const featureCountRows = await db
      .select({ value: count() })
      .from(featuresTable)
      .where(and(eq(featuresTable.userId, userId), inArray(featuresTable.id, normalizedFeatureIds)))
    const ownedFeatureCount = featureCountRows[0]?.value ?? 0

    if (ownedFeatureCount !== normalizedFeatureIds.length) {
      throw createError({ statusCode: 403, statusMessage: 'One or more features do not belong to current user' })
    }
  }

  return {
    materialId,
    manufacturerId,
    colorId,
    featureIds: normalizedFeatureIds,
  }
}

export async function assertNoFilamentUsage(
  userId: string,
  id: number,
  kind: 'material' | 'manufacturer' | 'color' | 'feature',
) {
  let usedBy: { name: string }[] = []

  if (kind === 'feature') {
    usedBy = await db
      .select({ name: filaments.name })
      .from(filaments)
      .innerJoin(filamentFeatures, eq(filaments.id, filamentFeatures.filamentId))
      .where(and(eq(filamentFeatures.featureId, id), eq(filaments.userId, userId)))
  } else {
    const column =
      kind === 'material' ? filaments.materialId
        : kind === 'manufacturer' ? filaments.manufacturerId
          : filaments.colorId

    usedBy = await db
      .select({ name: filaments.name })
      .from(filaments)
      .where(and(eq(column, id), eq(filaments.userId, userId)))
  }

  if (usedBy.length > 0) {
    const names = usedBy.map(f => f.name).join(', ')
    throw createError({
      statusCode: 409,
      statusMessage: `Cannot delete ${kind} because it is used by these filaments: ${names}. Please edit them first.`,
    })
  }
}

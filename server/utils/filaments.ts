import { and, eq, inArray } from 'drizzle-orm'
import { colors, featuresTable, filamentFeatures, filaments, manufacturers, materials, spools } from '#server/db/schema'

async function selectFilamentLookupRows(userId: string, id?: number) {
  return db
    .select()
    .from(filaments)
    .leftJoin(manufacturers, and(eq(filaments.manufacturerId, manufacturers.id), eq(manufacturers.userId, userId)))
    .leftJoin(materials, and(eq(filaments.materialId, materials.id), eq(materials.userId, userId)))
    .leftJoin(colors, and(eq(filaments.colorId, colors.id), eq(colors.userId, userId)))
    .where(id == null ? eq(filaments.userId, userId) : and(eq(filaments.id, id), eq(filaments.userId, userId)))
}

type FilamentLookupRow = Awaited<ReturnType<typeof selectFilamentLookupRows>>[number]

async function hydrateFilamentRows(userId: string, rows: FilamentLookupRow[]) {
  if (rows.length === 0) return []

  const filamentIds = rows.map(row => row.filaments.id)

  const [allSpools, featRows] = await Promise.all([
    db.select().from(spools)
      .where(and(inArray(spools.filamentId, filamentIds), eq(spools.userId, userId))),
    db.select({ filamentId: filamentFeatures.filamentId, feature: featuresTable })
      .from(filamentFeatures)
      .innerJoin(featuresTable, eq(filamentFeatures.featureId, featuresTable.id))
      .where(and(inArray(filamentFeatures.filamentId, filamentIds), eq(featuresTable.userId, userId))),
  ])

  const spoolsByFilament = Map.groupBy(allSpools, spool => spool.filamentId!)
  const featuresByFilament = Map.groupBy(featRows, row => row.filamentId)

  return rows.map(row => ({
    ...row.filaments,
    manufacturer: row.manufacturers,
    material: row.materials,
    color: row.colors,
    features: (featuresByFilament.get(row.filaments.id) ?? []).map(row => row.feature),
    spools: spoolsByFilament.get(row.filaments.id) ?? [],
  }))
}

export async function listFilamentsForUser(userId: string) {
  return hydrateFilamentRows(userId, await selectFilamentLookupRows(userId))
}

export async function getFilamentForUser(userId: string, id: number) {
  const [filament] = await hydrateFilamentRows(userId, await selectFilamentLookupRows(userId, id))
  return filament ?? null
}

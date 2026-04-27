import { filaments, manufacturers, materials, colors, spools, filamentFeatures, featuresTable } from '#server/db/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = Number(getRouterParam(event, 'id'))

  const [row] = await db
    .select()
    .from(filaments)
    .leftJoin(manufacturers, eq(filaments.manufacturerId, manufacturers.id))
    .leftJoin(materials, eq(filaments.materialId, materials.id))
    .leftJoin(colors, eq(filaments.colorId, colors.id))
    .where(and(eq(filaments.id, id), eq(filaments.userId, userId)))
    .limit(1)

  if (!row) throw createError({ statusCode: 404, message: 'Filament not found' })

  const [spoolList, featRows] = await Promise.all([
    db.select().from(spools).where(and(eq(spools.filamentId, id), eq(spools.userId, userId))),
    db.select({ feature: featuresTable })
      .from(filamentFeatures)
      .innerJoin(featuresTable, eq(filamentFeatures.featureId, featuresTable.id))
      .where(eq(filamentFeatures.filamentId, id)),
  ])

  return {
    ...row.filaments,
    manufacturer: row.manufacturers,
    material: row.materials,
    color: row.colors,
    features: featRows.map(r => r.feature),
    spools: spoolList,
  }
})

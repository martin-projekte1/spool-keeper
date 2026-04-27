import { filaments, manufacturers, materials, colors, spools, filamentFeatures, featuresTable } from '#server/db/schema'
import { and, eq, inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  const rows = await db
    .select()
    .from(filaments)
    .leftJoin(manufacturers, eq(filaments.manufacturerId, manufacturers.id))
    .leftJoin(materials, eq(filaments.materialId, materials.id))
    .leftJoin(colors, eq(filaments.colorId, colors.id))
    .where(eq(filaments.userId, userId))

  if (rows.length === 0) return []

  const filamentIds = rows.map(r => r.filaments.id)

  const [allSpools, featRows] = await Promise.all([
    db.select().from(spools)
      .where(and(inArray(spools.filamentId, filamentIds), eq(spools.userId, userId))),
    db.select({ filamentId: filamentFeatures.filamentId, feature: featuresTable })
      .from(filamentFeatures)
      .innerJoin(featuresTable, eq(filamentFeatures.featureId, featuresTable.id))
      .where(inArray(filamentFeatures.filamentId, filamentIds)),
  ])

  const spoolsByFilament = Map.groupBy(allSpools, s => s.filamentId!)
  const featuresByFilament = Map.groupBy(featRows, r => r.filamentId)

  return rows.map(row => ({
    ...row.filaments,
    manufacturer: row.manufacturers,
    material: row.materials,
    color: row.colors,
    features: (featuresByFilament.get(row.filaments.id) ?? []).map(r => r.feature),
    spools: spoolsByFilament.get(row.filaments.id) ?? [],
  }))
})

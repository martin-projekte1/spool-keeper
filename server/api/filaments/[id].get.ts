import { filaments, manufacturers, materials, colors, spools, filamentFeatures, featuresTable } from '#server/db/schema'
import { and, eq } from 'drizzle-orm'

import { s } from '#server/utils/openapi-schemas'

defineRouteMeta({
  openAPI: {
    tags: ['Filaments'],
    summary: 'Get filament',
    description: 'Returns a single filament by ID with all relations. Returns 404 if not found or not owned by the user.',
    security: [{ sessionCookie: [] }],
    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
    responses: {
      200: { description: 'Filament with relations', content: { 'application/json': { schema: s.filament } } },
      401: { description: 'Not authenticated' },
      404: { description: 'Filament not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = normalizeRouteId(getRouterParam(event, 'id'))

  const [row] = await db
    .select()
    .from(filaments)
    .leftJoin(manufacturers, and(eq(filaments.manufacturerId, manufacturers.id), eq(manufacturers.userId, userId)))
    .leftJoin(materials, and(eq(filaments.materialId, materials.id), eq(materials.userId, userId)))
    .leftJoin(colors, and(eq(filaments.colorId, colors.id), eq(colors.userId, userId)))
    .where(and(eq(filaments.id, id), eq(filaments.userId, userId)))
    .limit(1)

  if (!row) throw createError({ statusCode: 404, message: 'Filament not found' })

  const [spoolList, featRows] = await Promise.all([
    db.select().from(spools).where(and(eq(spools.filamentId, id), eq(spools.userId, userId))),
    db.select({ feature: featuresTable })
      .from(filamentFeatures)
      .innerJoin(featuresTable, eq(filamentFeatures.featureId, featuresTable.id))
      .where(and(eq(filamentFeatures.filamentId, id), eq(featuresTable.userId, userId))),
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

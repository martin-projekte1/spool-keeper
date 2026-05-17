import { filaments, filamentFeatures } from '#server/db/schema'
import { and, eq } from 'drizzle-orm'

import { s } from '#server/utils/openapi-schemas'

defineRouteMeta({
  openAPI: {
    tags: ['Filaments'],
    summary: 'Update filament',
    description: 'Replaces all fields and the full feature set of an existing filament. Features not listed in featureIds are removed.',
    security: [{ sessionCookie: [] }],
    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
    requestBody: { required: true, content: { 'application/json': { schema: s.filamentInsert } } },
    responses: {
      200: { description: 'Updated filament', content: { 'application/json': { schema: s.filament } } },
      400: { description: 'Name is required' },
      401: { description: 'Not authenticated' },
      404: { description: 'Filament not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = normalizeRouteId(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (!body?.name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Name is required' })

  const refs = await validateOwnedFilamentReferences(userId, {
    materialId: body.materialId,
    manufacturerId: body.manufacturerId,
    colorId: body.colorId,
    featureIds: body.featureIds,
  })

  const updated = db.transaction((tx) => {
    const updatedFilament = tx.update(filaments)
      .set({
        name: body.name.trim(),
        materialId: refs.materialId,
        manufacturerId: refs.manufacturerId,
        colorId: refs.colorId,
        diameter: body.diameter,
        printTempMin: body.printTempMin,
        printTempMax: body.printTempMax,
        imageUrl: body.imageUrl ?? null,
        ean: body.ean ?? null,
      })
      .where(and(eq(filaments.id, id), eq(filaments.userId, userId)))
      .returning()
      .get()

    if (!updatedFilament) throw createError({ statusCode: 404, message: 'Filament not found' })

    tx.delete(filamentFeatures).where(eq(filamentFeatures.filamentId, id)).run()
    if (refs.featureIds.length) {
      tx.insert(filamentFeatures).values(
        refs.featureIds.map(featureId => ({ filamentId: id, featureId })),
      ).run()
    }

    return updatedFilament
  })

  notifyUser(userId, 'data:changed')
  return updated
})

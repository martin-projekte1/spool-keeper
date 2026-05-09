import { filaments, filamentFeatures } from '#server/db/schema'
import { and, eq } from 'drizzle-orm'

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

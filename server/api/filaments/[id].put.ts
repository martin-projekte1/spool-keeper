import { filaments, filamentFeatures } from '#server/db/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const [updated] = await db.update(filaments)
    .set({
      name: body.name,
      materialId: body.materialId ?? null,
      manufacturerId: body.manufacturerId ?? null,
      colorId: body.colorId ?? null,
      diameter: body.diameter,
      printTempMin: body.printTempMin,
      printTempMax: body.printTempMax,
      imageUrl: body.imageUrl ?? null,
      ean: body.ean ?? null,
    })
    .where(and(eq(filaments.id, id), eq(filaments.userId, userId)))
    .returning()

  if (!updated) throw createError({ statusCode: 404, message: 'Filament not found' })

  // Replace feature associations
  await db.delete(filamentFeatures).where(eq(filamentFeatures.filamentId, id))
  const featureIds: number[] = Array.isArray(body.featureIds) ? body.featureIds : []
  if (featureIds.length) {
    await db.insert(filamentFeatures).values(
      featureIds.map(fid => ({ filamentId: id, featureId: fid }))
    )
  }

  return updated
})

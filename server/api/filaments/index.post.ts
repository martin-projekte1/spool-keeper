import { filaments, spools, filamentFeatures } from '#server/db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readBody(event)

  const [newFilament] = await db.insert(filaments).values({
    userId,
    name: body.name,
    materialId: body.materialId ?? null,
    manufacturerId: body.manufacturerId ?? null,
    colorId: body.colorId ?? null,
    diameter: body.diameter ?? 1.75,
    printTempMin: body.printTempMin,
    printTempMax: body.printTempMax,
    imageUrl: body.imageUrl ?? null,
    ean: body.ean ?? null,
  }).returning()

  if (!newFilament) throw createError({ statusCode: 500, message: 'Insert failed' })

  const featureIds: number[] = Array.isArray(body.featureIds) ? body.featureIds : []
  if (featureIds.length) {
    await db.insert(filamentFeatures).values(
      featureIds.map(fid => ({ filamentId: newFilament.id, featureId: fid }))
    )
  }

  await db.insert(spools).values({
    userId,
    filamentId: newFilament.id,
    purchasedAt: body.purchasedAt ?? null,
    initialWeightG: body.initialWeightG ?? 1000,
    remainingWeightG: body.remainingWeightG ?? body.initialWeightG ?? 1000,
    status: 'sealed',
    notes: body.notes ?? null,
  })

  return newFilament
})

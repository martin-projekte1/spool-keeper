import { filaments, spools } from '#server/db/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = normalizeRouteId(getRouterParam(event, 'id'))

  const [filament] = await db.select({ imageUrl: filaments.imageUrl })
    .from(filaments)
    .where(and(eq(filaments.id, id), eq(filaments.userId, userId)))
    .limit(1)

  if (!filament) throw createError({ statusCode: 404, message: 'Filament not found' })

  await db.transaction(async (tx) => {
    await tx.delete(spools).where(eq(spools.filamentId, id))
    await tx.delete(filaments).where(and(eq(filaments.id, id), eq(filaments.userId, userId)))
  })

  await deleteUploadedImage(filament.imageUrl)

  notifyUser(userId, 'data:changed')
  return { ok: true }
})

import { filaments, spools } from '#server/db/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = Number(getRouterParam(event, 'id'))

  const [filament] = await db.select({ imageUrl: filaments.imageUrl })
    .from(filaments)
    .where(and(eq(filaments.id, id), eq(filaments.userId, userId)))
    .limit(1)

  if (!filament) throw createError({ statusCode: 404, message: 'Filament not found' })

  await db.delete(spools).where(eq(spools.filamentId, id))
  await db.delete(filaments).where(and(eq(filaments.id, id), eq(filaments.userId, userId)))

  await deleteUploadedImage(filament.imageUrl)

  notifyUser(userId, 'data:changed')
  return { ok: true }
})
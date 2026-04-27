import { manufacturers, filaments, spools } from '#server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  await db.delete(spools).where(eq(spools.userId, userId))
  await db.delete(filaments).where(eq(filaments.userId, userId))
  await db.delete(manufacturers).where(eq(manufacturers.userId, userId))

  await clearUserSession(event)

  return { ok: true }
})
import { colors } from '#server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  return db.select().from(colors).where(eq(colors.userId, userId))
})

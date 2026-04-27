import { materials } from '#server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  return db.select().from(materials).where(eq(materials.userId, userId))
})

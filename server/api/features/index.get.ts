import { featuresTable } from '#server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  return db.select().from(featuresTable).where(eq(featuresTable.userId, userId))
})

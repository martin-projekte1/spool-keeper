import { featuresTable } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = Number(getRouterParam(event, 'id'))

  const [result] = await db
    .delete(featuresTable)
    .where(and(eq(featuresTable.id, id), eq(featuresTable.userId, userId)))
    .returning()

  if (!result) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return { ok: true }
})

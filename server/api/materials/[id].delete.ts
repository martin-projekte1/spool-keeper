import { materials } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = Number(getRouterParam(event, 'id'))

  await assertNoFilamentUsage(userId, id, 'material')

  const [result] = await db
    .delete(materials)
    .where(and(eq(materials.id, id), eq(materials.userId, userId)))
    .returning()

  if (!result) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return { ok: true }
})

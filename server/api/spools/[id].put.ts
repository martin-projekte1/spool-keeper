import { spools } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{
    status?: 'sealed' | 'open' | 'active'
    remainingWeightG?: number
    purchasedAt?: string | null
  }>(event)

  const [result] = await db
    .update(spools)
    .set({
      ...(body.status !== undefined && { status: body.status }),
      ...(body.remainingWeightG !== undefined && { remainingWeightG: body.remainingWeightG }),
      ...(body.purchasedAt !== undefined && { purchasedAt: body.purchasedAt }),
    })
    .where(and(eq(spools.id, id), eq(spools.userId, userId)))
    .returning()

  if (!result) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  notifyUser(userId, 'data:changed')
  return result
})

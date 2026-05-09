import { spools } from '#server/db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readBody<{
    filamentId: number
    initialWeightG?: number
    remainingWeightG?: number
    status?: 'sealed' | 'open' | 'active'
    purchasedAt?: string | null
  }>(event)

  const filamentId = await assertOwnedFilamentId(userId, body?.filamentId)

  const [result] = await db.insert(spools).values({
    userId,
    filamentId,
    initialWeightG: body.initialWeightG ?? 1000,
    remainingWeightG: body.remainingWeightG ?? body.initialWeightG ?? 1000,
    status: body.status ?? 'sealed',
    purchasedAt: body.purchasedAt ?? null
  }).returning()

  return result
})

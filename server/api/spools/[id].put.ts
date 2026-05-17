import { spools } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'
import { s } from '#server/utils/openapi-schemas'

defineRouteMeta({
  openAPI: {
    tags: ['Spools'],
    summary: 'Update spool',
    description: 'Updates status, remaining weight, or purchase date of a spool. Only provided fields are changed.',
    security: [{ sessionCookie: [] }],
    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
    requestBody: { required: true, content: { 'application/json': { schema: s.spoolUpdate } } },
    responses: {
      200: { description: 'Updated spool', content: { 'application/json': { schema: s.spool } } },
      401: { description: 'Not authenticated' },
      404: { description: 'Spool not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = normalizeRouteId(getRouterParam(event, 'id'))
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

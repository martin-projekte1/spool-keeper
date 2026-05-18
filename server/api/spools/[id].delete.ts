import { spools } from '#server/db/schema'
import { eq, and, count } from 'drizzle-orm'
import { s } from '#server/utils/openapi-schemas'

defineRouteMeta({
  openAPI: {
    tags: ['Spools'],
    summary: 'Delete spool',
    description: 'Deletes a spool. Fails with 409 if it is the last spool on the filament.',
    security: [{ sessionCookie: [] }],
    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
    responses: {
      200: { description: 'Deleted spool', content: { 'application/json': { schema: s.spool } } },
      401: { description: 'Not authenticated' },
      404: { description: 'Spool not found' },
      409: { description: 'Cannot delete the last spool on a filament' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = normalizeRouteId(getRouterParam(event, 'id'))

  const [target] = await db
    .select()
    .from(spools)
    .where(and(eq(spools.id, id), eq(spools.userId, userId)))

  if (!target) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const [countRow] = await db
    .select({ total: count() })
    .from(spools)
    .where(and(eq(spools.filamentId, target.filamentId!), eq(spools.userId, userId)))

  if ((countRow?.total ?? 0) <= 1) {
    throw createError({ statusCode: 409, statusMessage: 'Cannot delete the last spool on a filament' })
  }

  await db.delete(spools).where(eq(spools.id, id))
  notifyUser(userId, 'data:changed')
  return target
})
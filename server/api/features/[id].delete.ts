import { featuresTable } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'
import { s } from '#server/utils/openapi-schemas'

defineRouteMeta({
  openAPI: {
    tags: ['Features'],
    summary: 'Delete feature',
    description: 'Deletes a feature. Blocked with 409 if any filament still references it.',
    security: [{ sessionCookie: [] }],
    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
    responses: {
      200: { description: 'OK', content: { 'application/json': { schema: s.ok } } },
      401: { description: 'Not authenticated' },
      404: { description: 'Feature not found' },
      409: { description: 'Feature is still referenced by one or more filaments' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = Number(getRouterParam(event, 'id'))

  await assertNoFilamentUsage(userId, id, 'feature')

  const [result] = await db
    .delete(featuresTable)
    .where(and(eq(featuresTable.id, id), eq(featuresTable.userId, userId)))
    .returning()

  if (!result) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return { ok: true }
})

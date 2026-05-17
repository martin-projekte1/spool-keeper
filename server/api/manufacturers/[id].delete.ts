import { manufacturers } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'
import { s } from '#server/utils/openapi-schemas'

defineRouteMeta({
  openAPI: {
    tags: ['Manufacturers'],
    summary: 'Delete manufacturer',
    description: 'Deletes the manufacturer. Blocked with 409 if any filament still references it.',
    security: [{ sessionCookie: [] }],
    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
    responses: {
      200: { description: 'OK', content: { 'application/json': { schema: s.ok } } },
      401: { description: 'Not authenticated' },
      404: { description: 'Manufacturer not found' },
      409: { description: 'Manufacturer is still referenced by one or more filaments' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = Number(getRouterParam(event, 'id'))

  await assertNoFilamentUsage(userId, id, 'manufacturer')

  const [result] = await db
    .delete(manufacturers)
    .where(and(eq(manufacturers.id, id), eq(manufacturers.userId, userId)))
    .returning()

  if (!result) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return { ok: true }
})

import { featuresTable } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'
import { s } from '#server/utils/openapi-schemas'

defineRouteMeta({
  openAPI: {
    tags: ['Features'],
    summary: 'Update feature',
    description: 'Renames a feature.',
    security: [{ sessionCookie: [] }],
    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
    requestBody: { required: true, content: { 'application/json': { schema: s.featureInsert } } },
    responses: {
      200: { description: 'Updated feature', content: { 'application/json': { schema: s.feature } } },
      400: { description: 'Name is required' },
      401: { description: 'Not authenticated' },
      404: { description: 'Feature not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ name?: string }>(event)

  if (!body?.name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Name is required' })

  const [result] = await db
    .update(featuresTable).set({ name: body.name.trim() })
    .where(and(eq(featuresTable.id, id), eq(featuresTable.userId, userId)))
    .returning()

  if (!result) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return result
})

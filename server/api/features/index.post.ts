import { featuresTable } from '#server/db/schema'
import { s } from '#server/utils/openapi-schemas'

defineRouteMeta({
  openAPI: {
    tags: ['Features'],
    summary: 'Create feature',
    description: 'Creates a new feature tag that can be attached to filaments.',
    security: [{ sessionCookie: [] }],
    requestBody: { required: true, content: { 'application/json': { schema: s.featureInsert } } },
    responses: {
      200: { description: 'Created feature', content: { 'application/json': { schema: s.feature } } },
      400: { description: 'Name is required' },
      401: { description: 'Not authenticated' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readBody<{ name?: string }>(event)

  if (!body?.name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Name is required' })

  const [result] = await db.insert(featuresTable).values({ name: body.name.trim(), userId }).returning()
  return result
})

import { materials } from '#server/db/schema'
import { s } from '#server/utils/openapi-schemas'

defineRouteMeta({
  openAPI: {
    tags: ['Materials'],
    summary: 'Create material',
    description: 'Creates a new material (e.g. PLA, PETG, ABS) for the authenticated user.',
    security: [{ sessionCookie: [] }],
    requestBody: { required: true, content: { 'application/json': { schema: s.materialInsert } } },
    responses: {
      200: { description: 'Created material', content: { 'application/json': { schema: s.material } } },
      400: { description: 'Name is required' },
      401: { description: 'Not authenticated' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readBody<{ name?: string }>(event)

  if (!body?.name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Name is required' })

  const [result] = await db.insert(materials).values({ name: body.name.trim(), userId }).returning()
  return result
})

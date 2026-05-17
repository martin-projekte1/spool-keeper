import { manufacturers } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'
import { s } from '#server/utils/openapi-schemas'

defineRouteMeta({
  openAPI: {
    tags: ['Manufacturers'],
    summary: 'Update manufacturer',
    description: 'Updates the manufacturer name.',
    security: [{ sessionCookie: [] }],
    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
    requestBody: { required: true, content: { 'application/json': { schema: s.manufacturerInsert } } },
    responses: {
      200: { description: 'Updated manufacturer', content: { 'application/json': { schema: s.manufacturer } } },
      400: { description: 'Name is required' },
      401: { description: 'Not authenticated' },
      404: { description: 'Manufacturer not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ name?: string }>(event)

  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }

  const [result] = await db
    .update(manufacturers)
    .set({ name: body.name.trim() })
    .where(and(eq(manufacturers.id, id), eq(manufacturers.userId, userId)))
    .returning()

  if (!result) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return result
})

import { materials } from '#server/db/schema'
import { eq } from 'drizzle-orm'
import { s } from '#server/utils/openapi-schemas'

defineRouteMeta({
  openAPI: {
    tags: ['Materials'],
    summary: 'List materials',
    description: 'Returns all materials for the authenticated user.',
    security: [{ sessionCookie: [] }],
    responses: {
      200: { description: 'Array of materials', content: { 'application/json': { schema: s.materialList } } },
      401: { description: 'Not authenticated' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  return db.select().from(materials).where(eq(materials.userId, userId))
})

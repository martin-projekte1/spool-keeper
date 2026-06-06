import { s } from '#server/utils/openapi-schemas'
import { listFilamentsForUser } from '#server/utils/filaments'

defineRouteMeta({
  openAPI: {
    tags: ['Filaments'],
    summary: 'List filaments',
    description: 'Returns all filaments for the authenticated user, joined with manufacturer, material, color, features, and spools.',
    security: [{ sessionCookie: [] }],
    responses: {
      200: { description: 'Array of filament objects with relations', content: { 'application/json': { schema: s.filamentList } } },
      401: { description: 'Not authenticated' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  return listFilamentsForUser(userId)
})

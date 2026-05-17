defineRouteMeta({
  openAPI: {
    tags: ['Internal'],
    summary: 'Get WebSocket auth token',
    description: 'Issues a short-lived token used to authenticate the WebSocket connection. Called automatically by the frontend.',
    security: [{ sessionCookie: [] }],
    responses: {
      200: { description: '{ token: string }' },
      401: { description: 'Not authenticated' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const token = issueWsAuthToken(userId)
  return { token }
})

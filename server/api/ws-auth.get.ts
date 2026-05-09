export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const token = issueWsAuthToken(userId)
  return { token }
})

import { seedForUser } from '#server/utils/seed'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  await seedForUser(session.user.email)

  return { ok: true, message: 'Seed successful' }
})
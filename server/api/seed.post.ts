import { seedForUser } from '#server/utils/seed'

export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 403, statusMessage: 'Seeding is disabled in production' })
  }

  const userId = await requireUserId(event)
  await seedForUser(userId)

  return { ok: true, message: 'Seed successful' }
})

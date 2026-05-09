import { seedForUser } from '#server/utils/seed'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  await seedForUser(userId)

  return { ok: true, message: 'Seed successful' }
})

import { seedForUser } from '#server/utils/seed'
import { manufacturers } from '#server/db/schema'
import { eq } from 'drizzle-orm'

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    await setUserSession(event, {
      user: {
        name: user.name,
        email: user.email,
        avatar: user.picture,
      },
    })

    // Seed demo data only on first login (check if user already has data)
    const existing = await db.select().from(manufacturers)
      .where(eq(manufacturers.userId, user.email))
      .limit(1)

    if (existing.length === 0) {
      await seedForUser(user.email)
    }

    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('OAuth error:', error)
    // TEMPORARY: Show error message in browser for debugging production 500
    throw createError({
      statusCode: 500,
      statusMessage: `OAuth Error: ${error.message || 'Unknown error'}`,
      data: error
    })
  },
})

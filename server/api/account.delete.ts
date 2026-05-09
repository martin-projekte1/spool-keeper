import { clearUserData } from '#server/utils/ownership'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  db.transaction((tx) => {
    clearUserData(tx, userId)
  })

  await clearUserSession(event)

  return { ok: true }
})

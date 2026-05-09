import { manufacturers, filaments, spools, materials, featuresTable, colors } from '#server/db/schema'
import { eq } from 'drizzle-orm'
import { clearUserData } from '#server/utils/ownership'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  db.transaction((tx) => {
    clearUserData(tx, userId)
  })

  await clearUserSession(event)

  return { ok: true }
})

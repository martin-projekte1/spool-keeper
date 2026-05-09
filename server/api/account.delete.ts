import { manufacturers, filaments, spools, materials, featuresTable, colors } from '#server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  db.transaction((tx) => {
    tx.delete(spools).where(eq(spools.userId, userId)).run()
    tx.delete(filaments).where(eq(filaments.userId, userId)).run()
    tx.delete(manufacturers).where(eq(manufacturers.userId, userId)).run()
    tx.delete(materials).where(eq(materials.userId, userId)).run()
    tx.delete(featuresTable).where(eq(featuresTable.userId, userId)).run()
    tx.delete(colors).where(eq(colors.userId, userId)).run()
  })

  await clearUserSession(event)

  return { ok: true }
})

import { manufacturers, filaments, spools, materials, featuresTable, colors } from '#server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  await db.transaction(async (tx) => {
    await tx.delete(spools).where(eq(spools.userId, userId))
    await tx.delete(filaments).where(eq(filaments.userId, userId))
    await tx.delete(manufacturers).where(eq(manufacturers.userId, userId))
    await tx.delete(materials).where(eq(materials.userId, userId))
    await tx.delete(featuresTable).where(eq(featuresTable.userId, userId))
    await tx.delete(colors).where(eq(colors.userId, userId))
  })

  await clearUserSession(event)

  return { ok: true }
})

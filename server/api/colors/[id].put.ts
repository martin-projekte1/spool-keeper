import { colors } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ name?: string; hex?: string }>(event)

  if (!body?.name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  if (!body?.hex?.trim()) throw createError({ statusCode: 400, statusMessage: 'Hex is required' })

  const [result] = await db
    .update(colors).set({ name: body.name.trim(), hex: body.hex.trim() })
    .where(and(eq(colors.id, id), eq(colors.userId, userId)))
    .returning()

  if (!result) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return result
})

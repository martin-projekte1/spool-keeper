import { colors } from '#server/db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readBody<{ name?: string; hex?: string }>(event)

  if (!body?.name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  if (!body?.hex?.trim()) throw createError({ statusCode: 400, statusMessage: 'Hex is required' })

  const [result] = await db.insert(colors).values({ name: body.name.trim(), hex: body.hex.trim(), userId }).returning()
  return result
})

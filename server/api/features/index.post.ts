import { featuresTable } from '#server/db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readBody<{ name?: string }>(event)

  if (!body?.name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Name is required' })

  const [result] = await db.insert(featuresTable).values({ name: body.name.trim(), userId }).returning()
  return result
})

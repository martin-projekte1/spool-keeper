import { join, dirname } from 'node:path'
import { readFile } from 'node:fs/promises'

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path') as string
  if (!path || path.includes('..')) throw createError({ statusCode: 400 })

  const dbPath = process.env.DATABASE_URL ?? join(process.cwd(), 'data', 'spool-keeper.db')
  const filePath = join(dirname(dbPath), 'images', path)

  try {
    const file = await readFile(filePath)
    setResponseHeader(event, 'content-type', 'image/webp')
    setResponseHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
    return file
  } catch {
    throw createError({ statusCode: 404 })
  }
})
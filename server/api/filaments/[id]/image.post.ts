import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { filaments } from '#server/db/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = Number(getRouterParam(event, 'id'))

  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400, message: 'No file uploaded' })

  const file = form.find(f => f.name === 'image')
  if (!file?.data) throw createError({ statusCode: 400, message: 'No image field' })

  const webpBuffer = await sharp(file.data)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()

  const filename = `filament-${id}-${Date.now()}.webp`
  const dir = join(process.cwd(), 'public', 'images', 'filaments')

  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, filename), webpBuffer)

  const imageUrl = `/images/filaments/${filename}`

  const [updated] = await db.update(filaments)
    .set({ imageUrl })
    .where(and(eq(filaments.id, id), eq(filaments.userId, userId)))
    .returning()

  if (!updated) throw createError({ statusCode: 404, message: 'Filament not found' })

  return { imageUrl }
})

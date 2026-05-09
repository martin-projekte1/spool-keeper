import { mkdir, writeFile } from 'node:fs/promises'
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

  const [current] = await db.select({ imageUrl: filaments.imageUrl })
    .from(filaments)
    .where(and(eq(filaments.id, id), eq(filaments.userId, userId)))
    .limit(1)

  await deleteUploadedImage(current?.imageUrl)

  const webpBuffer = await sharp(file.data)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()

  const dir = getUploadDir()
  await mkdir(dir, { recursive: true })

  const filename = `filament-${id}-${Date.now()}.webp`
  await writeFile(`${dir}/${filename}`, webpBuffer)

  const imageUrl = `/images/uploads/${filename}`

  const [updated] = await db.update(filaments)
    .set({ imageUrl })
    .where(and(eq(filaments.id, id), eq(filaments.userId, userId)))
    .returning()

  if (!updated) throw createError({ statusCode: 404, message: 'Filament not found' })

  return { imageUrl }
})
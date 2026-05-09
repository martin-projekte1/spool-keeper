import { join, dirname } from 'node:path'
import { unlink } from 'node:fs/promises'

export function getUploadDir(): string {
  const dbPath = process.env.DATABASE_URL ?? join(process.cwd(), 'data', 'spool-keeper.db')
  return join(dirname(dbPath), 'images', 'filaments')
}

export async function deleteUploadedImage(imageUrl: string | null | undefined) {
  if (!imageUrl?.startsWith('/uploads/')) return
  const filename = imageUrl.split('/').pop()
  if (!filename) return
  try { await unlink(join(getUploadDir(), filename)) } catch { /* already gone */ }
}
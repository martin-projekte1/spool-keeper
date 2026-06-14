import { join } from "node:path";
import { unlink } from "node:fs/promises";

export function getUploadDir(): string {
  const publicDir =
    process.env.NODE_ENV === "production"
      ? join(process.cwd(), ".output", "public")
      : join(process.cwd(), "public");
  return join(publicDir, "images", "uploads");
}

export async function deleteUploadedImage(imageUrl: string | null | undefined) {
  if (!imageUrl?.startsWith("/images/uploads/")) return;
  const filename = imageUrl.split("/").pop();
  if (!filename) return;
  try {
    await unlink(join(getUploadDir(), filename));
  } catch {
    /* already gone */
  }
}

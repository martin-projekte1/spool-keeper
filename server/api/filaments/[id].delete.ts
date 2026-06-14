import { filaments, spools } from "#server/db/schema";
import { and, eq } from "drizzle-orm";

import { s } from "#server/utils/openapi-schemas";

defineRouteMeta({
  openAPI: {
    tags: ["Filaments"],
    summary: "Delete filament",
    description:
      "Deletes the filament, all its spools, and the associated image file from disk.",
    security: [{ sessionCookie: [] }],
    parameters: [
      { in: "path", name: "id", required: true, schema: { type: "integer" } },
    ],
    responses: {
      200: {
        description: "OK",
        content: { "application/json": { schema: s.ok } },
      },
      401: { description: "Not authenticated" },
      404: { description: "Filament not found" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const id = normalizeRouteId(getRouterParam(event, "id"));

  const [filament] = await db
    .select({ imageUrl: filaments.imageUrl })
    .from(filaments)
    .where(and(eq(filaments.id, id), eq(filaments.userId, userId)))
    .limit(1);

  if (!filament)
    throw createError({ statusCode: 404, message: "Filament not found" });

  db.transaction((tx) => {
    tx.delete(spools).where(eq(spools.filamentId, id)).run();
    tx.delete(filaments)
      .where(and(eq(filaments.id, id), eq(filaments.userId, userId)))
      .run();
  });

  await deleteUploadedImage(filament.imageUrl);

  notifyUser(userId, "data:changed");
  return { ok: true };
});

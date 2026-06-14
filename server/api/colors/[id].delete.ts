import { colors } from "#server/db/schema";
import { eq, and } from "drizzle-orm";
import { s } from "#server/utils/openapi-schemas";

defineRouteMeta({
  openAPI: {
    tags: ["Colors"],
    summary: "Delete color",
    description:
      "Deletes a color. Blocked with 409 if any filament still references it.",
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
      404: { description: "Color not found" },
      409: {
        description: "Color is still referenced by one or more filaments",
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const id = Number(getRouterParam(event, "id"));

  await assertNoFilamentUsage(userId, id, "color");

  const [result] = await db
    .delete(colors)
    .where(and(eq(colors.id, id), eq(colors.userId, userId)))
    .returning();

  if (!result)
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  return { ok: true };
});

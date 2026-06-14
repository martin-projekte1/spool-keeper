import { colors } from "#server/db/schema";
import { eq, and } from "drizzle-orm";
import { s } from "#server/utils/openapi-schemas";

defineRouteMeta({
  openAPI: {
    tags: ["Colors"],
    summary: "Update color",
    description: "Updates the name and hex value of a color.",
    security: [{ sessionCookie: [] }],
    parameters: [
      { in: "path", name: "id", required: true, schema: { type: "integer" } },
    ],
    requestBody: {
      required: true,
      content: { "application/json": { schema: s.colorInsert } },
    },
    responses: {
      200: {
        description: "Updated color",
        content: { "application/json": { schema: s.color } },
      },
      400: { description: "Name or hex is required" },
      401: { description: "Not authenticated" },
      404: { description: "Color not found" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody<{ name?: string; hex?: string }>(event);

  if (!body?.name?.trim())
    throw createError({ statusCode: 400, statusMessage: "Name is required" });
  if (!body?.hex?.trim())
    throw createError({ statusCode: 400, statusMessage: "Hex is required" });

  const [result] = await db
    .update(colors)
    .set({ name: body.name.trim(), hex: body.hex.trim() })
    .where(and(eq(colors.id, id), eq(colors.userId, userId)))
    .returning();

  if (!result)
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  return result;
});

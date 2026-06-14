import { materials } from "#server/db/schema";
import { eq, and } from "drizzle-orm";
import { s } from "#server/utils/openapi-schemas";

defineRouteMeta({
  openAPI: {
    tags: ["Materials"],
    summary: "Update material",
    description: "Renames a material.",
    security: [{ sessionCookie: [] }],
    parameters: [
      { in: "path", name: "id", required: true, schema: { type: "integer" } },
    ],
    requestBody: {
      required: true,
      content: { "application/json": { schema: s.materialInsert } },
    },
    responses: {
      200: {
        description: "Updated material",
        content: { "application/json": { schema: s.material } },
      },
      400: { description: "Name is required" },
      401: { description: "Not authenticated" },
      404: { description: "Material not found" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody<{ name?: string }>(event);

  if (!body?.name?.trim())
    throw createError({ statusCode: 400, statusMessage: "Name is required" });

  const [result] = await db
    .update(materials)
    .set({ name: body.name.trim() })
    .where(and(eq(materials.id, id), eq(materials.userId, userId)))
    .returning();

  if (!result)
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  return result;
});

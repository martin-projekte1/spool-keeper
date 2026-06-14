import { colors } from "#server/db/schema";
import { s } from "#server/utils/openapi-schemas";

defineRouteMeta({
  openAPI: {
    tags: ["Colors"],
    summary: "Create color",
    description: "Creates a new color with a display name and hex value.",
    security: [{ sessionCookie: [] }],
    requestBody: {
      required: true,
      content: { "application/json": { schema: s.colorInsert } },
    },
    responses: {
      200: {
        description: "Created color",
        content: { "application/json": { schema: s.color } },
      },
      400: { description: "Name or hex is required" },
      401: { description: "Not authenticated" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const body = await readBody<{ name?: string; hex?: string }>(event);

  if (!body?.name?.trim())
    throw createError({ statusCode: 400, statusMessage: "Name is required" });
  if (!body?.hex?.trim())
    throw createError({ statusCode: 400, statusMessage: "Hex is required" });

  const [result] = await db
    .insert(colors)
    .values({ name: body.name.trim(), hex: body.hex.trim(), userId })
    .returning();
  return result;
});

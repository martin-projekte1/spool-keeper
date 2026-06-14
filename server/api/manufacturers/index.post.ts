import { manufacturers } from "#server/db/schema";
import { s } from "#server/utils/openapi-schemas";

defineRouteMeta({
  openAPI: {
    tags: ["Manufacturers"],
    summary: "Create manufacturer",
    description: "Creates a new manufacturer for the authenticated user.",
    security: [{ sessionCookie: [] }],
    requestBody: {
      required: true,
      content: { "application/json": { schema: s.manufacturerInsert } },
    },
    responses: {
      200: {
        description: "Created manufacturer",
        content: { "application/json": { schema: s.manufacturer } },
      },
      400: { description: "Name is required" },
      401: { description: "Not authenticated" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const body = await readBody<{ name?: string }>(event);

  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Name is required" });
  }

  const [result] = await db
    .insert(manufacturers)
    .values({
      name: body.name.trim(),
      userId,
    })
    .returning();

  return result;
});

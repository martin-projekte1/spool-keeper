import { s } from "#server/utils/openapi-schemas";
import { getFilamentForUser } from "#server/utils/filaments";

defineRouteMeta({
  openAPI: {
    tags: ["Filaments"],
    summary: "Get filament",
    description:
      "Returns a single filament by ID with all relations. Returns 404 if not found or not owned by the user.",
    security: [{ sessionCookie: [] }],
    parameters: [
      { in: "path", name: "id", required: true, schema: { type: "integer" } },
    ],
    responses: {
      200: {
        description: "Filament with relations",
        content: { "application/json": { schema: s.filament } },
      },
      401: { description: "Not authenticated" },
      404: { description: "Filament not found" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const id = normalizeRouteId(getRouterParam(event, "id"));

  const filament = await getFilamentForUser(userId, id);
  if (!filament)
    throw createError({ statusCode: 404, message: "Filament not found" });

  return filament;
});

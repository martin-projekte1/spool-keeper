import { colors } from "#server/db/schema";
import { eq } from "drizzle-orm";
import { s } from "#server/utils/openapi-schemas";

defineRouteMeta({
  openAPI: {
    tags: ["Colors"],
    summary: "List colors",
    description: "Returns all colors for the authenticated user.",
    security: [{ sessionCookie: [] }],
    responses: {
      200: {
        description: "Array of colors",
        content: { "application/json": { schema: s.colorList } },
      },
      401: { description: "Not authenticated" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  return db.select().from(colors).where(eq(colors.userId, userId));
});

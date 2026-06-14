import { featuresTable } from "#server/db/schema";
import { eq } from "drizzle-orm";
import { s } from "#server/utils/openapi-schemas";

defineRouteMeta({
  openAPI: {
    tags: ["Features"],
    summary: "List features",
    description:
      "Returns all features for the authenticated user (e.g. silk, glow-in-the-dark, matte).",
    security: [{ sessionCookie: [] }],
    responses: {
      200: {
        description: "Array of features",
        content: { "application/json": { schema: s.featureList } },
      },
      401: { description: "Not authenticated" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  return db
    .select()
    .from(featuresTable)
    .where(eq(featuresTable.userId, userId));
});

import { manufacturers } from "#server/db/schema";
import { eq } from "drizzle-orm";

import { s } from "#server/utils/openapi-schemas";

defineRouteMeta({
  openAPI: {
    tags: ["Manufacturers"],
    summary: "List manufacturers",
    description: "Returns all manufacturers for the authenticated user.",
    security: [{ sessionCookie: [] }],
    responses: {
      200: {
        description: "Array of manufacturers",
        content: { "application/json": { schema: s.manufacturerList } },
      },
      401: { description: "Not authenticated" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  return db
    .select()
    .from(manufacturers)
    .where(eq(manufacturers.userId, userId));
});

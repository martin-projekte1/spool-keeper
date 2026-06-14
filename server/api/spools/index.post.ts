import { spools } from "#server/db/schema";
import { s } from "#server/utils/openapi-schemas";

defineRouteMeta({
  openAPI: {
    tags: ["Spools"],
    summary: "Add spool",
    description:
      "Adds a new spool to an existing filament. The filament must belong to the authenticated user.",
    security: [{ sessionCookie: [] }],
    requestBody: {
      required: true,
      content: { "application/json": { schema: s.spoolInsert } },
    },
    responses: {
      200: {
        description: "Created spool",
        content: { "application/json": { schema: s.spool } },
      },
      401: { description: "Not authenticated" },
      403: { description: "Filament not owned by user" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const body = await readBody<{
    filamentId: number;
    initialWeightG?: number;
    remainingWeightG?: number;
    status?: "sealed" | "open" | "active";
    purchasedAt?: string | null;
  }>(event);

  const filamentId = await assertOwnedFilamentId(userId, body?.filamentId);

  const [result] = await db
    .insert(spools)
    .values({
      userId,
      filamentId,
      initialWeightG: body.initialWeightG ?? 1000,
      remainingWeightG: body.remainingWeightG ?? body.initialWeightG ?? 1000,
      status: body.status ?? "sealed",
      purchasedAt: body.purchasedAt ?? null,
    })
    .returning();

  return result;
});

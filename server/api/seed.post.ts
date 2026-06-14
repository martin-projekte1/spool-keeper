import { seedForUser } from "#server/utils/seed";

defineRouteMeta({
  openAPI: {
    tags: ["Internal"],
    summary: "Seed demo data",
    description:
      "Populates the authenticated user's account with demo filaments and spools.",
    security: [{ sessionCookie: [] }],
    responses: {
      200: { description: "{ ok: true, message: string }" },
      401: { description: "Not authenticated" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  await seedForUser(userId);

  return { ok: true, message: "Seed successful" };
});

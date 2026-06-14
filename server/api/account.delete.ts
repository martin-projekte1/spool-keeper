import { clearUserData } from "#server/utils/ownership";

defineRouteMeta({
  openAPI: {
    tags: ["Account"],
    summary: "Delete account",
    description:
      "Permanently deletes all data for the authenticated user and clears their session. Irreversible.",
    security: [{ sessionCookie: [] }],
    responses: {
      200: { description: "{ ok: true }" },
      401: { description: "Not authenticated" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);

  db.transaction((tx) => {
    clearUserData(tx, userId);
  });

  await clearUserSession(event);

  return { ok: true };
});

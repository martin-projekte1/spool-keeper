import { getAuthSession } from "#server/utils/auth-session";

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;

  if (path.startsWith("/auth/")) return;
  if (path.startsWith("/_nuxt/")) return;
  if (path.startsWith("/api/_auth/")) return;
  if (/\.(css|html|ico|js|json|png|svg|webmanifest|webp)$/.test(path)) return;
  if (path === "/login") return;

  const session = await getAuthSession(event);

  if (!session?.user) {
    if (path.startsWith("/api/")) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }
    return sendRedirect(event, "/login");
  }
});

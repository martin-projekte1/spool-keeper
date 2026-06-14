import type { H3Event } from "h3";

export async function requireUserId(event: H3Event): Promise<string> {
  const session = await getUserSession(event);
  const userId = session.user?.email;
  if (!userId) throw createError({ statusCode: 401, message: "Unauthorized" });
  return userId;
}

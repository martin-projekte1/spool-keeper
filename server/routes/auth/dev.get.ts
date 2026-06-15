import { manufacturers } from "#server/db/schema";
import { seedForUser } from "#server/utils/seed";
import { setAuthSession } from "#server/utils/auth-session";
import { eq } from "drizzle-orm";

const demoUser = {
  name: "Demo User",
  email: "demo@spool-keeper.local",
  avatar: "",
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  if (!import.meta.dev || !config.devAuthBypass) {
    throw createError({ statusCode: 404, message: "Not found" });
  }

  await setAuthSession(event, { user: demoUser });

  const existing = await db
    .select()
    .from(manufacturers)
    .where(eq(manufacturers.userId, demoUser.email))
    .limit(1);

  if (existing.length === 0) {
    await seedForUser(demoUser.email);
  }

  return sendRedirect(event, "/");
});

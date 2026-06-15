import type { H3Event, SessionConfig } from "h3";
import { useSession } from "h3";

type AuthSessionData = {
  user?: {
    email: string;
    name: string;
    avatar: string;
  };
  secure?: Record<string, unknown>;
};

function getSessionConfig(event: H3Event): SessionConfig {
  const runtimeConfig = useRuntimeConfig(event);
  const envPrefix = runtimeConfig.nitro?.envPrefix || "NUXT_";
  const envPassword = process.env[`${envPrefix}SESSION_PASSWORD`];
  const config = runtimeConfig.session as Partial<SessionConfig>;

  return {
    ...config,
    password: config.password || envPassword || "",
  } as SessionConfig;
}

export async function getAuthSession(event: H3Event) {
  const session = await useSession<AuthSessionData>(event, getSessionConfig(event));
  return { ...session.data, id: session.id };
}

export async function setAuthSession(event: H3Event, data: AuthSessionData) {
  const session = await useSession<AuthSessionData>(event, getSessionConfig(event));
  await session.update({ ...session.data, ...data });
  return session.data;
}

export async function clearAuthSession(event: H3Event) {
  const session = await useSession<AuthSessionData>(event, getSessionConfig(event));
  await session.clear();
}

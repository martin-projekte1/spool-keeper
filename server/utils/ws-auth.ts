const TOKEN_TTL_MS = 60_000

type WsTokenEntry = {
  userId: string
  expiresAt: number
}

const wsTokens = new Map<string, WsTokenEntry>()

function cleanupExpiredTokens() {
  const now = Date.now()
  for (const [token, entry] of wsTokens) {
    if (entry.expiresAt <= now) wsTokens.delete(token)
  }
}

export function issueWsAuthToken(userId: string): string {
  cleanupExpiredTokens()
  const token = crypto.randomUUID()
  wsTokens.set(token, { userId, expiresAt: Date.now() + TOKEN_TTL_MS })
  return token
}

export function consumeWsAuthToken(token: string): string | null {
  cleanupExpiredTokens()
  const entry = wsTokens.get(token)
  if (!entry) return null
  wsTokens.delete(token)
  return entry.expiresAt > Date.now() ? entry.userId : null
}

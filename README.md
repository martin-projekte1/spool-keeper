# Spool Keeper

Web application for managing 3D printing filament.
Track spools, remaining weight, print temperatures, and generate QR labels.

**Live:** [spoolkeeper.site](https://spoolkeeper.site)

## Stack

- **Nuxt 4** (Vue 3 + Nitro) full-stack-framework
- **SQLite + Drizzle ORM** file-based database, no server
- **Google OAuth** via nuxt-auth-utils
- **Tailwind CSS v4 + Nuxt UI**
- Docker + Caddy on a VPS

## Local Development

```bash
# Recommended: Node.js 24+, pnpm 10+
cp .env.example .env   # fill in Google OAuth credentials & session password
pnpm install
pnpm dev
```
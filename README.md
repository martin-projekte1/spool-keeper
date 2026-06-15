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

### Prerequisites

- Install [pnpm](https://pnpm.io/installation) & [node](https://nodejs.org/en/download).
- Recommended: Node.js 24+, pnpm 11+

### Demo Mode

Resolve dependencies & run in demo mode:

```bash
pnpm install
pnpm dev:demo           # local demo mode, no Google OAuth required
```

Demo mode enables a development-only login button for `demo@spool-keeper.local`
and seeds example data on first login.

### Google OAuth

For development with real Google OAuth:

```bash
cp .env.example .env   # fill in Google OAuth credentials & session password
pnpm dev
```

# Spool Keeper

![Nuxt 4](https://img.shields.io/badge/Nuxt_4-00DC82?style=flat&logo=nuxt&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Nitro](https://img.shields.io/badge/Nitro-000000?style=flat&logo=nitro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat&logo=tailwind-css&logoColor=white)
![Nuxt UI](https://img.shields.io/badge/Nuxt_UI-00DC82?style=flat&logo=nuxt&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat&logo=drizzle&logoColor=black)
![Google OAuth](https://img.shields.io/badge/Google_OAuth-4285F4?style=flat&logo=google&logoColor=white)
![nuxt-auth-utils](https://img.shields.io/badge/nuxt--auth--utils-00DC82?style=flat&logo=nuxt&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Caddy](https://img.shields.io/badge/Caddy-1F88C0?style=flat&logo=caddy&logoColor=white)

A web app for managing 3D printing filament: track spools, remaining weight,
print temperatures, and QR labels.

- **Live app:** [spoolkeeper.site](https://www.spoolkeeper.site/login?ref=github.com/martin-projekte1)
- **API docs:** [spoolkeeper.site/api-docs.html](https://spoolkeeper.site/api-docs.html?ref=github.com/martin-projekte1)
- **GitHub repository:** [martin-projekte1/spool-keeper](https://github.com/martin-projekte1/spool-keeper)

## Stack

- **App:** [Nuxt 4](https://nuxt.com/), [Vue 3](https://vuejs.org/), [Nitro](https://nitro.build/)
- **Database:** [SQLite](https://sqlite.org/), [Drizzle ORM](https://orm.drizzle.team/)
- **Auth:** [Google OAuth](https://developers.google.com/identity/protocols/oauth2), [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils)
- **UI:** [Tailwind CSS v4](https://tailwindcss.com/), [Nuxt UI](https://ui.nuxt.com/)
- **Deploy:** [Docker](https://www.docker.com/), [Caddy](https://caddyserver.com/)

## Local Development

### Prerequisites

- Install [pnpm](https://pnpm.io/installation) & [node](https://nodejs.org/en/download).
- Recommended: Node.js 24+, pnpm 11+

### Demo Mode

Resolve dependencies & run in demo mode:

```bash
pnpm install
pnpm dev:demo
```
Demo mode has a local-only login button (using `demo@spool-keeper.local`) and seeds example data on first login.

```bash
pnpm dev:demo --host    # optional: expose demo mode on the local network
```

### Google OAuth

For development with real Google OAuth:

```bash
cp .env.example .env   # fill in Google OAuth credentials & session password
pnpm dev
```

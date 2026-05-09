# Spool Keeper — Filament Inventory Manager

Web application for managing 3D printing filament spools.
Built with **Nuxt 4**, **Nuxt UI**, **Tailwind CSS v4**, and **SQLite**.

---

## 💡 Features

- **Filament Management:** Search, filter, and sort by material, manufacturer, and color.
- **Level Tracking:** Real-time tracking of remaining weight per spool.
- **QR Label Printing:** Generate and print QR labels for physical spools.
- **PWA Support:** Fully installable on mobile and desktop for scan-workflows.

## 🏗️ Tech Stack

- **Frontend:** Nuxt 4.3 (Vue 3), Tailwind CSS v4
- **Backend:** Nitro, Drizzle ORM, SQLite
- **Auth:** Google OAuth via nuxt-auth-utils
- **Infrastructure:** Docker, Caddy, GitHub Actions (CI/CD)

## 🛠️ Local Development

```bash
pnpm install
pnpm drizzle-kit push
pnpm dev
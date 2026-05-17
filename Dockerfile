# --- Builder Stage ---
FROM node:24-alpine AS builder
WORKDIR /app

# Build tools are required for native modules like better-sqlite3
RUN apk add --no-cache python3 make g++

RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

COPY package.json pnpm-lock.yaml ./

# Native build scripts are executed according to pnpm.onlyBuiltDependencies in package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN NODE_OPTIONS=--max-old-space-size=4096 pnpm build

# --- Runtime Stage ---
FROM node:24-alpine
WORKDIR /app

# Required for executing the compiled better-sqlite3 binary on Alpine
RUN apk add --no-cache libstdc++

COPY --from=builder /app/.output ./.output

# Ensure data directory exists for SQLite persistence
RUN mkdir -p /app/data

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="/app/data/spool-keeper.db"

# Fixed entrypoint prevents the container from exiting immediately
ENTRYPOINT ["node", ".output/server/index.mjs"]
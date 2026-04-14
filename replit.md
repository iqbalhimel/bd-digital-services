# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Project: BD Digital Services

A bilingual (Bangla + English) digital product marketplace for bddigitalservices.com.

### Architecture

- `artifacts/api-server` — Express 5 REST API, serves frontend static files in production
- `artifacts/bd-digital-services` — React + Vite frontend (public storefront + admin panel)
- `lib/db` — Drizzle ORM schema and database client
- `lib/api-spec` — OpenAPI YAML spec
- `lib/api-client-react` — Orval-generated React Query hooks (from OpenAPI spec)
- `lib/api-zod` — Orval-generated Zod schemas for request validation

### API Routes (all under `/api/*`)

- `GET/POST/PUT/DELETE /api/categories`
- `GET/POST/PUT/DELETE /api/products` (with `/products/featured`)
- `GET/POST /api/orders`
- `GET/PUT /api/settings`
- `GET/POST /api/notice`
- `POST /api/admin/login`
- `GET /api/stats`

### Admin Panel

- URL: `/admin`
- Username: `ADMIN_USERNAME` env var (default: `admin`)
- Password: `ADMIN_PASSWORD` env var (default: `admin123`)

### Contact & Payments

- WhatsApp/Telegram: +8801572792499
- bKash/Nagad/Rocket: 01687476714

### Theme System

- **Dark/Light toggle**: Sun/Moon icon in the header navbar
- **Default**: Dark mode (falls back to system preference for first visit)
- **Persistence**: localStorage key `bd-theme` ("dark" | "light")
- **CSS architecture**: `:root` = light tokens, `.dark` = dark tokens; Tailwind `dark:` variant via `@custom-variant dark`
- **Theme Provider**: `src/components/theme-provider.tsx` — React context + `useTheme()` hook
- **Flash prevention**: `main.tsx` applies `.dark` class synchronously before React render
- **Transition**: `data-transitioning` attribute on `<html>` enables 200ms CSS transitions during toggle

### Replit Setup

- **API Server workflow**: `PORT=8080 pnpm --filter @workspace/api-server run dev` (port 8080)
- **Frontend workflow**: `PORT=18910 BASE_PATH=/ pnpm --filter @workspace/bd-digital-services run dev` (port 18910)
- **Database**: Replit PostgreSQL provisioned; schema applied via `pnpm --filter @workspace/db run push`
- **Artifacts**: `artifacts/api-server/.replit-artifact/artifact.toml` and `artifacts/bd-digital-services/.replit-artifact/artifact.toml`

### Deployment

See `DEPLOYMENT.md` for Hostinger Node.js hosting setup.

# BD Digital Services — Deployment Guide

## Hostinger Node.js Hosting

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database (Hostinger provides one)

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=8080
NODE_ENV=production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
ADMIN_SECRET=your-random-secret-key
```

### Build Steps

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm --filter @workspace/db run db:push

# Build frontend
pnpm --filter @workspace/bd-digital-services run build

# Build API server
pnpm --filter @workspace/api-server run build
```

### Production Start

The API server serves both the API routes (`/api/*`) and the React frontend static files in production.

```bash
node artifacts/api-server/dist/index.mjs
```

### How It Works

- Frontend (React) is built to `artifacts/bd-digital-services/dist/public/`
- The Express server serves the API at `/api/*` and static files at all other routes
- Admin panel is at `/admin` (username/password from env vars)

### Admin Panel

- URL: `https://yourdomain.com/admin`
- Username: value of `ADMIN_USERNAME` env var (default: `admin`)
- Password: value of `ADMIN_PASSWORD` env var (default: `admin123`)

**Change these before going live!**

### Seeding Initial Data

Categories and products can be seeded via the admin panel at `/admin/products` and `/admin/categories`.

Default site settings (WhatsApp, bKash number, etc.) are set automatically on first API call to `/api/settings`.

To change them, log in to the admin panel and go to Settings.

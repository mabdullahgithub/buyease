# BuyEase — Turborepo Monorepo

COD Form & Upsells Shopify app. Three Next.js apps + three shared packages managed with Turborepo.

---

## Monorepo Structure

```
BUYEASE/
├── apps/
│   ├── landing/       → buyease.app          (port 3000)
│   ├── merchant/      → app.buyease.app       (port 3001)
│   └── admin/         → admin.buyease.app     (port 3002)
├── packages/
│   ├── db/            → Prisma schema + DB client (@buyease/db)
│   ├── ui/            → Shared UI components  (@buyease/ui)
│   └── utils/         → Shared utilities      (@buyease/utils)
├── turbo.json
├── package.json
└── .npmrc
```

---

## Prerequisites

- Node.js >= 20
- npm >= 10
- PostgreSQL (or Supabase project)
- Shopify Partner account (for `apps/merchant`)

---

## First-Time Setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/buyease.git
cd buyease
npm install
```

### 2. Set up environment variables

Each app has an `.env.example`. Copy those files, or edit the local starter files
(`.env.local` / `packages/db/.env` — gitignored) with the same keys; adjust
secrets and URLs for your machine:

- `apps/landing/.env.local` — `PORT`, `NEXT_PUBLIC_*`
- `apps/merchant/.env.local` — `PORT`, `DATABASE_URL`, Shopify keys, `SHOPIFY_APP_URL`
- `apps/admin/.env.local` — `PORT`, `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `ADMIN_ALLOWED_IPS`
- `packages/db/.env` — `DATABASE_URL` (for Prisma CLI: `db:generate`, `db:push`, `db:studio`)

Next.js reads **`PORT` from each app’s `.env.local`**. Change `PORT` there to run
on a different port, and keep `NEXT_PUBLIC_APP_URL` / `AUTH_URL` / `NEXTAUTH_URL`
in sync with that port for the admin app.

```bash
cp apps/landing/.env.example  apps/landing/.env.local
cp apps/merchant/.env.example apps/merchant/.env.local
cp apps/admin/.env.example    apps/admin/.env.local
cp packages/db/.env.example  packages/db/.env
```

The main shared variable is `DATABASE_URL` — merchant, admin, and Prisma CLI
can all use the same Postgres database.

### 3. Set up the database

```bash
# Generate the Prisma client
npm run db:generate

# Push the schema to the database (dev)
npm run db:push

# Or run migrations (staging/production)
npm run db:migrate
```

### 4. Create the first admin user (seeder)

1. In **`packages/db/.env`**, set `DATABASE_URL` and seed credentials (see `packages/db/.env.example`):

   - `ADMIN_SEED_EMAIL` — sign-in email  
   - `ADMIN_SEED_PASSWORD` — min **12** characters with **upper**, **lower**, and a **digit** (same rules as the admin “change password” UI)

2. Apply the schema, then run the seeder:

```bash
npm run db:generate
npm run db:push
npm run db:seed:admin
```

Re-running **`db:seed:admin`** upserts the same email: it resets the password hash and sets `role` to `SUPER_ADMIN` and `isActive` to `true`.

---

## Development

### Run all apps simultaneously

```bash
npm run dev
```

Turbo runs all three apps in parallel:

| App      | URL                   |
|----------|-----------------------|
| landing  | http://localhost:3000 |
| merchant | http://localhost:3001 |
| admin    | http://localhost:3002 |

### Run a single app

```bash
# Landing only
npm run dev --workspace=apps/landing

# Merchant only (Shopify requires HTTPS — use ngrok)
npm run dev --workspace=apps/merchant

# Admin only
npm run dev --workspace=apps/admin
```

### Run the Prisma Studio

```bash
npm run db:studio
```

---

## Shopify BFS Readiness

For merchant-app eligibility controls (OAuth-only install flow, billing policy, Partner Dashboard prerequisites, and performance thresholds), use:

- `apps/merchant/BFS_READINESS.md`

---

## Building

```bash
# Build all apps
npm run build

# Build a single app
npm run build --workspace=apps/landing
```

---

## Deployment (Vercel)

Each app is an independent Vercel project. Set `Root Directory` to:

| App      | Root Directory  |
|----------|-----------------|
| landing  | `apps/landing`  |
| merchant | `apps/merchant` |
| admin    | `apps/admin`    |

Packages are hoisted to the root `node_modules`, so Vercel builds work
without extra configuration.

---

## Packages

### `@buyease/db`

Prisma ORM with PostgreSQL. Models: `Session`, `Merchant`, `Order`, `Plan`, `AdminUser`.

```ts
import { db } from '@buyease/db';
const merchants = await db.merchant.findMany();
```

### `@buyease/ui`

Shared shadcn/ui components for `apps/landing` and `apps/admin`.

```ts
import { Button, Card, Badge, Table, Modal, Input } from '@buyease/ui';
```

### `@buyease/utils`

Pure TypeScript utilities usable in any app or package.

```ts
import { formatCurrency, formatDate, calculateCODFee, verifyShopifyWebhookHmac, paginate } from '@buyease/utils';
```

---

## Environment Variables Reference

### Shared

| Variable       | Used by          | Description               |
|----------------|------------------|---------------------------|
| `DATABASE_URL` | db, merchant, admin | Postgres connection string |

### apps/merchant

| Variable              | Description                             |
|-----------------------|-----------------------------------------|
| `SHOPIFY_API_KEY`     | From Shopify Partner Dashboard          |
| `SHOPIFY_API_SECRET`  | From Shopify Partner Dashboard          |
| `SHOPIFY_APP_URL`     | Public HTTPS URL of the merchant app    |
| `SHOPIFY_SCOPES`      | Comma-separated OAuth scopes            |
| `SESSION_SECRET`      | Random 64-char string for session security |

### apps/admin

| Variable              | Description                             |
|-----------------------|-----------------------------------------|
| `AUTH_SECRET`         | Random 64-char string for NextAuth JWT  |
| `NEXTAUTH_URL`        | Full URL of the admin app               |
| `ADMIN_ALLOWED_IPS`   | Comma-separated IP allowlist            |

---

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Framework    | Next.js 16 (App Router)                 |
| Language     | TypeScript (strict)                     |
| Monorepo     | Turborepo                               |
| Database     | PostgreSQL via Prisma ORM               |
| Auth         | NextAuth v5 (admin), Shopify OAuth (merchant) |
| UI — Landing | Tailwind CSS v4 + shadcn/ui             |
| UI — Admin   | Tailwind CSS v4 + shadcn/ui + @buyease/ui |
| UI — Merchant| @shopify/polaris                        |
| Package mgr  | npm workspaces                          |

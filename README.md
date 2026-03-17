# Bescuit CostTracker

Cloudflare-native web app for tracking bar-restaurante purchasing costs from pasted invoice JSON.

## Stack

- TanStack Start + TanStack Router
- Cloudflare Workers + D1
- Drizzle ORM
- Tailwind v4 utilities plus custom CSS system

## Phase 1 status

Phase 1 is verified and ready for Phase 2:

- TanStack Start app scaffolded
- Cloudflare Worker and D1 binding configured
- Drizzle schema and initial migration generated
- Base category seed included in the first migration
- App shell, top bar, bottom nav, and route skeleton pages added
- Vitest isolated from the Cloudflare worker runner
- Minimal regression tests cover utilities, navigation shell, and default categories
- Local D1 migration plus seeded categories verified before handoff

## Development

```bash
pnpm install
pnpm cf:typegen
pnpm db:migrate:local
pnpm dev
```

`pnpm cf:typegen` refreshes the checked-in `worker-configuration.d.ts` runtime bindings from `wrangler.jsonc`.

## Database

Generate migrations:

```bash
pnpm db:generate
```

Apply local D1 migrations:

```bash
pnpm db:migrate:local
```

Verify the local schema and seed data:

```bash
pnpm exec wrangler d1 execute costtracker-db --local --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('suppliers', 'categories', 'invoices', 'invoice_items') ORDER BY name"
pnpm exec wrangler d1 execute costtracker-db --local --command "SELECT name, sort_order FROM categories ORDER BY sort_order, name"
```

Apply remote D1 migrations:

```bash
pnpm db:migrate:remote
```

Important:

- Replace `database_id` in `wrangler.jsonc` before applying remote migrations or deploying.
- The migrations directory is `drizzle/migrations`.

## Quality checks

```bash
pnpm build
pnpm exec eslint .
pnpm test
```

## Route map

- `/` dashboard
- `/upload` invoice JSON upload shell
- `/invoices/` invoice list shell
- `/invoices/$invoiceId` invoice detail shell
- `/analytics` product trend shell
- `/compare` supplier comparison shell
- `/suppliers/` supplier management shell

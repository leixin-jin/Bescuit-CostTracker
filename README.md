# Bescuit CostTracker

Cloudflare-native web app for tracking bar-restaurante purchasing costs from pasted invoice JSON.

## Stack

- TanStack Start + TanStack Router
- Cloudflare Workers + D1
- Drizzle ORM
- Tailwind v4 utilities plus custom CSS system

## Phase 4 status

The app is now prepared for a production-ready release flow:

- Shared loading, empty, not-found, and error handling across the main routes
- PWA install metadata plus offline fallback via a service worker
- Cloudflare release scripts for backup, migrate, deploy, and smoke verification
- Server-side operation logging for invoice and analytics requests
- Acceptance and operations runbooks under [`doc/`](./doc)

## Development

```bash
pnpm install
pnpm cf:typegen
pnpm db:migrate:local
pnpm dev
```

`pnpm cf:typegen` refreshes the checked-in `worker-configuration.d.ts` runtime bindings from `wrangler.jsonc`.

## PWA and offline behavior

- `public/manifest.json` is configured for installable standalone launches.
- `public/sw.js` caches core assets and serves `public/offline.html` when navigation requests fail offline.
- The runtime banner surfaces offline mode, install prompts, and cache update refreshes.

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

Create backups before remote changes:

```bash
pnpm db:backup:production
pnpm db:backup:staging
```

Important:

- Replace `database_id` in `wrangler.jsonc` before applying remote migrations or deploying.
- The migrations directory is `drizzle/migrations`.
- Staging uses `wrangler.jsonc > env.staging`; replace its placeholder `database_id` before the first staging release.

## Quality checks

```bash
pnpm build
pnpm exec eslint .
pnpm test
```

## Cloudflare release flow

Production release:

```bash
pnpm deploy:production
```

Staging release:

```bash
pnpm deploy:staging
```

Both scripts run the same sequence:

1. Verify Wrangler authentication.
2. Build the application.
3. Export a remote D1 SQL backup into `backups/<target>/`.
4. Apply remote migrations.
5. Deploy the worker with `--keep-vars`.

Run the release smoke check against a deployed URL:

```bash
pnpm smoke:release -- --base-url=https://<deployment-url>
pnpm smoke:release -- --base-url=https://<deployment-url> --invoice-id=<known-id>
```

Further operations details:

- [`doc/phase-4-operations.md`](./doc/phase-4-operations.md)
- [`doc/phase-4-acceptance.md`](./doc/phase-4-acceptance.md)

## Route map

- `/` dashboard
- `/upload` invoice JSON upload shell
- `/invoices/` invoice list shell
- `/invoices/$invoiceId` invoice detail shell
- `/analytics` product trend shell
- `/compare` supplier comparison shell
- `/suppliers/` supplier management shell

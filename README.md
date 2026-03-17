# Bescuit CostTracker

Cloudflare-native web app for tracking bar-restaurante purchasing costs from pasted invoice JSON.

## Stack

- TanStack Start + TanStack Router
- Cloudflare Workers + D1
- Drizzle ORM
- Tailwind v4 utilities plus custom CSS system

## Phase 1 status

Phase 1 is implemented:

- TanStack Start app scaffolded
- Cloudflare Worker and D1 binding configured
- Drizzle schema and initial migration generated
- Base category seed included in the first migration
- App shell, top bar, bottom nav, and route skeleton pages added

## Development

```bash
pnpm install
pnpm dev
```

## Database

Generate migrations:

```bash
pnpm db:generate
```

Apply local D1 migrations:

```bash
pnpm db:migrate:local
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
pnpm check
pnpm build
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

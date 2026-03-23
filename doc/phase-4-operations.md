# Phase 4 Operations Runbook

## Environment convention

- `local`: `wrangler dev` plus `costtracker-db --local`.
- `staging`: Cloudflare environment `staging`, dedicated D1 database, same schema as production.
- `production`: base `wrangler.jsonc` config and the production D1 database.

## Required configuration

- Keep the D1 binding name as `DB` in every environment.
- Put non-secret flags in `wrangler.jsonc` or `wrangler.jsonc` environment blocks.
- Store secrets with `wrangler secret put <KEY>` per environment instead of committing them.
- Use `.dev.vars` only for local development values that should never be deployed.

## Migration policy

- A release that combines migrations and code deploys must keep migrations backward-compatible.
- Apply additive migrations first, then deploy code, then remove deprecated columns or tables in a later release.
- If a migration is destructive or changes data shape incompatibly, split the release into two deployments.

## Standard release flow

1. Confirm Cloudflare auth with `pnpm exec wrangler whoami`.
2. Build the app with `pnpm run build`.
3. Export a remote D1 backup before schema changes.
4. Apply remote migrations.
5. Deploy the Worker with `--keep-vars`.
6. Run the smoke script against the deployed URL.

## One-command scripts

- `pnpm deploy:production`
- `pnpm deploy:staging`
- `pnpm db:backup:production`
- `pnpm db:backup:staging`
- `pnpm smoke:release -- --base-url=https://<your-domain>`

## Rollback options

- Worker rollback: redeploy the previous build tag or commit after confirming the schema is still compatible.
- Data rollback:
  Run `pnpm exec wrangler d1 time-travel restore costtracker-db --bookmark <bookmark>` when D1 Time Travel is available for the target incident window.
- Export fallback:
  Restore from the SQL export created by the release script if time-travel is not the chosen recovery path.

## First-week production watchlist

- Import failure rate from the upload flow.
- Invoice detail save and delete failures.
- Analytics query error rate.
- D1 slow-query signals from `wrangler d1 insights`.
- Service worker update failures and offline fallback complaints.

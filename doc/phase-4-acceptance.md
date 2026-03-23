# Phase 4 Acceptance Record

## Automated checks

- `pnpm test`
- `pnpm build`
- `node scripts/deploy-cloudflare.mjs production --dry-run`
- `node scripts/export-d1.mjs production --dry-run`

## Manual release checklist

1. Open `/`, `/upload`, `/invoices`, `/analytics`, `/compare`, and `/suppliers` on desktop and mobile widths.
2. Import one invoice, confirm it appears in the invoice list, then open the detail page.
3. Edit the invoice detail, save it, and confirm analytics and compare pages reflect the updated data.
4. Install the PWA from a supported browser and confirm icon, standalone launch, and offline fallback.
5. Disconnect the network and verify a cached route or `offline.html` is served predictably.
6. Reconnect, refresh the app, and verify new data can be loaded again.
7. Run `pnpm smoke:release -- --base-url=https://<deployment-url> [--invoice-id=<known-id>]`.

## Sign-off fields

- Release target:
- Release commit:
- Release timestamp:
- Verified by:
- Known follow-ups:

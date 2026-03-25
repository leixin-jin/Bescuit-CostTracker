# Phase 4 Acceptance Record

## Automated checks

- [x] `pnpm test`
- [x] `pnpm build`
- [x] `node scripts/deploy-cloudflare.mjs production --dry-run`
- [x] `node scripts/export-d1.mjs production --dry-run`
- [x] `pnpm smoke:release -- --base-url=https://bescuit-costtracker.bescuit-costtracker.workers.dev`

## Manual release checklist

1. [x] Open `/`, `/upload`, `/invoices`, `/analytics`, `/compare`, and `/suppliers` on desktop and mobile widths.
2. [x] Import one invoice, confirm it appears in the invoice list, then open the detail page.
3. [x] Edit the invoice detail, save it, and confirm analytics and compare pages reflect the updated data.
4. [x] Install the PWA from a supported browser and confirm icon and standalone launch.
5. [x] Disconnect the network and verify the installed PWA shows a clear offline banner plus an in-app request failure state instead of a browser-native error page.
6. [ ] Reconnect, refresh the app, and verify new data can be loaded again.
7. [x] Run `pnpm smoke:release -- --base-url=https://bescuit-costtracker.bescuit-costtracker.workers.dev`.

## Offline Verification Notes

- Verified in the installed PWA window.
- DevTools explicitly confirmed that the service worker was registered and active, and that both `costtracker-static-v1` and `costtracker-pages-v1` cache storage entries were present.
- When offline, the app shows `Offline mode is active.` and falls back to an application-level request failure state with recovery actions such as `Retry request`, `Open dashboard`, and `Open invoices`.
- This behavior is accepted as graceful degradation for network-dependent routes.
- The observed fallback for this route was the in-app error state, not the standalone `offline.html` page.

## Sign-off fields

- Release target: production
- Release commit: `f5f38be`
- Release timestamp: `2026-03-25 17:48:46 CET`
- Verified by: `zhuyuxia`
- Known follow-ups:
  - Confirm post-offline recovery by switching back to online mode, refreshing, and verifying that live data can be loaded again.
  - `offline.html` was not the primary observed fallback for this route; current accepted behavior is the in-app offline/error state.

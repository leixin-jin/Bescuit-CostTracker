import { Link, createFileRoute } from '@tanstack/react-router'
import { DashboardOverview } from '../features/analytics/AnalyticsViews'
import { getDashboardMetricsQuery } from '../features/analytics/analytics.functions'
import { defaultInvoiceSearch } from '../features/invoices/schema'

export const Route = createFileRoute('/')({
  loader: () => getDashboardMetricsQuery(),
  component: DashboardPage,
})

function DashboardPage() {
  const metrics = Route.useLoaderData()

  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <div className="hero-panel__grid hero-panel__grid--wide">
          <div>
            <p className="eyebrow">Mediterranean cost control</p>
            <h2 className="page-title">
              Live purchasing metrics for a bar-restaurante cost tracker.
            </h2>
            <p className="page-copy">
              The dashboard now reads the real D1 state behind invoices, line
              items, suppliers, analytics, and comparison flows. It surfaces
              current spend, supplier coverage, recent import activity, and
              product category movement instead of fixed placeholder metrics.
            </p>
          </div>

          <div className="section-card surface-muted">
            <p className="eyebrow">Immediate actions</p>
            <div className="hero-actions" style={{ marginTop: '1rem' }}>
              <Link to="/upload" className="button">
                Open upload flow
              </Link>
              <Link
                to="/invoices"
                search={defaultInvoiceSearch}
                className="button button-secondary"
              >
                Review invoice shell
              </Link>
            </div>
            <div className="pill-row" style={{ marginTop: '1rem' }}>
              <span className="pill">Cloudflare Workers</span>
              <span className="pill">D1 + Drizzle</span>
              <span className="pill">Phase 3 analytics</span>
            </div>
          </div>
        </div>
      </section>

      <DashboardOverview metrics={metrics} />
    </div>
  )
}

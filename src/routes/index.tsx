import { Link, createFileRoute } from '@tanstack/react-router'

const metrics = [
  {
    label: 'D1 tables',
    value: '4',
    copy: 'Suppliers, categories, invoices, and invoice items are modeled and indexed.',
  },
  {
    label: 'Seed categories',
    value: '11',
    copy: 'Base product taxonomy is ready to receive Gemini invoice payloads.',
  },
  {
    label: 'Live routes',
    value: '6',
    copy: 'Dashboard, upload, invoices, analytics, compare, and suppliers skeleton pages are wired.',
  },
  {
    label: 'Current milestone',
    value: 'Phase 1',
    copy: 'Foundation complete: app shell, navigation, Cloudflare config, and migrations.',
  },
] as const

const foundationChecklist = [
  'TanStack Start app scaffolded in the existing repository.',
  'Wrangler configured for Cloudflare Workers plus D1 binding and migrations folder.',
  'Drizzle schema mirrors the planning document and includes invoice-friendly indexes.',
  'Global layout now behaves like a focused operations dashboard on desktop and mobile.',
] as const

const nextSteps = [
  {
    title: 'Phase 2: paste JSON',
    detail:
      'Add Zod validation, parse preview, inline editing, and invoice save flow.',
  },
  {
    title: 'Phase 3: analytics',
    detail:
      'Wire real product trends, supplier comparison queries, and dashboard stats.',
  },
  {
    title: 'Phase 4: ship',
    detail:
      'Polish responsive motion, add PWA details, and deploy to Cloudflare.',
  },
] as const

export const Route = createFileRoute('/')({ component: DashboardPage })

function DashboardPage() {
  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <div className="hero-panel__grid hero-panel__grid--wide">
          <div>
            <p className="eyebrow">Mediterranean cost control</p>
            <h2 className="page-title">
              Invoice-ready architecture for a bar-restaurante cost tracker.
            </h2>
            <p className="page-copy">
              The app foundation is now aligned to the project plan: Cloudflare
              worker runtime, D1-ready schema, Drizzle migrations, and route
              scaffolding for upload, analytics, invoice history, supplier
              management, and comparison flows.
            </p>
          </div>

          <div className="section-card surface-muted">
            <p className="eyebrow">Immediate actions</p>
            <div className="hero-actions" style={{ marginTop: '1rem' }}>
              <Link to="/upload" className="button">
                Open upload flow
              </Link>
              <Link to="/invoices/" className="button button-secondary">
                Review invoice shell
              </Link>
            </div>
            <div className="pill-row" style={{ marginTop: '1rem' }}>
              <span className="pill">Cloudflare Workers</span>
              <span className="pill">D1 + Drizzle</span>
              <span className="pill">TanStack Router</span>
            </div>
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="surface-panel metric-card">
            <p className="metric-label">{metric.label}</p>
            <p className="metric-value">{metric.value}</p>
            <p className="metric-copy">{metric.copy}</p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="surface-panel section-card">
          <p className="eyebrow">Foundation checklist</p>
          <h3 className="section-heading">What is already in place</h3>
          <ul className="check-list" style={{ marginTop: '1rem' }}>
            {foundationChecklist.map((item) => (
              <li key={item} className="check-item">
                <span className="check-item__icon">01</span>
                <span className="section-copy">{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">Roadmap</p>
          <h3 className="section-heading">Next delivery slices</h3>
          <ul className="stack-list" style={{ marginTop: '1rem' }}>
            {nextSteps.map((step) => (
              <li key={step.title} className="stack-item">
                <div>
                  <strong>{step.title}</strong>
                  <p className="section-copy" style={{ marginTop: '0.35rem' }}>
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}

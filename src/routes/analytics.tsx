import { createFileRoute } from '@tanstack/react-router'

const monthlyTrend = [
  { month: 'Oct', value: 4.8, height: '42%' },
  { month: 'Nov', value: 5.1, height: '54%' },
  { month: 'Dec', value: 5.6, height: '66%' },
  { month: 'Jan', value: 5.3, height: '60%' },
  { month: 'Feb', value: 5.9, height: '76%' },
  { month: 'Mar', value: 6.2, height: '88%' },
] as const

const analyticsTiles = [
  {
    label: 'Tracked horizon',
    value: '6 months',
    hint: 'Time filter will drive the query window.',
  },
  {
    label: 'Search mode',
    value: 'By product',
    hint: 'Autocomplete will reuse invoice item names.',
  },
  {
    label: 'Output',
    value: 'Trend + min/max',
    hint: 'Avg, min, max, and quantity are planned in phase 3.',
  },
] as const

export const Route = createFileRoute('/analytics')({ component: AnalyticsPage })

function AnalyticsPage() {
  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <p className="eyebrow">Price intelligence</p>
        <h2 className="page-title">
          Trend analysis shell for products and monthly movement.
        </h2>
        <p className="page-copy">
          The page structure is ready for product search, trend charts, and
          monthly rollups once invoice data starts landing in D1.
        </p>
      </section>

      <section className="three-column-grid">
        {analyticsTiles.map((tile) => (
          <article key={tile.label} className="surface-panel section-card">
            <p className="metric-label">{tile.label}</p>
            <p
              className="metric-value"
              style={{ fontSize: '1.6rem', marginTop: '0.4rem' }}
            >
              {tile.value}
            </p>
            <p className="metric-copy">{tile.hint}</p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="surface-panel section-card">
          <div className="field">
            <label htmlFor="product-search">Product search</label>
            <input
              id="product-search"
              className="text-input"
              placeholder="Aceite de oliva virgen extra 5L"
              disabled
            />
          </div>

          <div className="chart-shell" style={{ marginTop: '1.4rem' }}>
            {monthlyTrend.map((point) => (
              <div key={point.month} className="chart-bar">
                <span className="chart-bar__value">
                  EUR {point.value.toFixed(2)}
                </span>
                <div
                  className="chart-bar__column"
                  style={{ height: point.height }}
                />
                <span className="chart-bar__label">{point.month}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">Phase 3 wiring</p>
          <h3 className="section-heading">Planned query outputs</h3>
          <ul className="stack-list" style={{ marginTop: '1rem' }}>
            <li className="stack-item">
              <span>Average price by month</span>
              <span className="stack-item__value">AVG(unit_price)</span>
            </li>
            <li className="stack-item">
              <span>Best and worst observed price</span>
              <span className="stack-item__value">MIN / MAX</span>
            </li>
            <li className="stack-item">
              <span>Total purchased quantity</span>
              <span className="stack-item__value">SUM(quantity)</span>
            </li>
            <li className="stack-item">
              <span>Observation count</span>
              <span className="stack-item__value">COUNT(*)</span>
            </li>
          </ul>
        </article>
      </section>
    </div>
  )
}

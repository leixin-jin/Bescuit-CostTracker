import { createFileRoute } from '@tanstack/react-router'
import { formatCurrency } from '../lib/utils'

const comparisonRows = [
  {
    product: 'Aceite de oliva virgen extra 5L',
    unit: 'ud',
    offers: [
      { supplier: 'Makro', price: 8.5, best: true },
      { supplier: 'Mercabarna', price: 8.9, best: false },
      { supplier: 'Distribucion BCN', price: 9.15, best: false },
    ],
  },
  {
    product: 'Pollo entero',
    unit: 'kg',
    offers: [
      { supplier: 'Makro', price: 3.2, best: true },
      { supplier: 'Carnes Sur', price: 3.35, best: false },
      { supplier: 'Avicola Delta', price: 3.48, best: false },
    ],
  },
] as const

export const Route = createFileRoute('/compare')({ component: ComparePage })

function ComparePage() {
  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <p className="eyebrow">Supplier benchmark</p>
        <h2 className="page-title">
          Compare latest supplier prices for the same product.
        </h2>
        <p className="page-copy">
          The matrix layout is in place and ready for the phase 3 SQL query that
          ranks suppliers using each product&apos;s latest observed invoice
          price.
        </p>
      </section>

      <section className="content-grid">
        <article className="surface-panel section-card">
          <div className="field">
            <label htmlFor="compare-search">Search product</label>
            <input
              id="compare-search"
              className="text-input"
              placeholder="Aceite, cerveza, pollo..."
              disabled
            />
          </div>

          <div className="comparison-matrix" style={{ marginTop: '1.25rem' }}>
            {comparisonRows.map((row) => (
              <section key={row.product} className="comparison-row">
                <div className="comparison-row__header">
                  <div>
                    <h3
                      className="section-heading"
                      style={{ marginBottom: '0.2rem' }}
                    >
                      {row.product}
                    </h3>
                    <p className="section-copy">
                      Latest known prices in {row.unit}
                    </p>
                  </div>
                  <span className="badge badge-info">
                    {row.offers.length} suppliers
                  </span>
                </div>

                <div className="comparison-row__prices">
                  {row.offers.map((offer) => (
                    <div
                      key={offer.supplier}
                      className={`price-card${offer.best ? ' is-best' : ''}`}
                    >
                      <div>
                        <strong>{offer.supplier}</strong>
                        <p className="muted" style={{ margin: '0.2rem 0 0' }}>
                          Latest sample
                        </p>
                      </div>
                      <span
                        className={`badge ${offer.best ? 'badge-success' : 'badge-info'}`}
                      >
                        {formatCurrency(offer.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">Comparison logic</p>
          <h3 className="section-heading">What phase 3 will compute</h3>
          <ul className="stack-list" style={{ marginTop: '1rem' }}>
            <li className="stack-item">
              <span>Latest price per supplier and product</span>
              <span className="stack-item__value">ROW_NUMBER()</span>
            </li>
            <li className="stack-item">
              <span>Rank cheapest supplier first</span>
              <span className="stack-item__value">RANK()</span>
            </li>
            <li className="stack-item">
              <span>Optional product filter</span>
              <span className="stack-item__value">LIKE search</span>
            </li>
          </ul>
        </article>
      </section>
    </div>
  )
}

import { createFileRoute } from '@tanstack/react-router'

const supplierCards = [
  {
    name: 'Makro',
    contact: 'Purchasing desk',
    state: 'planned',
    note: 'Expected to auto-create from first saved invoice.',
  },
  {
    name: 'Mercabarna',
    contact: 'Fresh market',
    state: 'planned',
    note: 'Will appear once invoice imports are confirmed.',
  },
  {
    name: 'Carnes Sur',
    contact: 'Meat distributor',
    state: 'planned',
    note: 'Ready for later notes and contact fields.',
  },
] as const

const supplierFields = [
  'Unique supplier name',
  'Optional contact details',
  'Notes for negotiation or delivery behavior',
  'Invoice linkage for spend analysis',
] as const

export const Route = createFileRoute('/suppliers/')({
  component: SuppliersPage,
})

function SuppliersPage() {
  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <p className="eyebrow">Supplier directory</p>
        <h2 className="page-title">
          Management shell for supplier records and contact context.
        </h2>
        <p className="page-copy">
          The table is not populated from D1 yet, but the data model and route
          are ready for phase 2 invoice saves to bootstrap the registry
          automatically.
        </p>
      </section>

      <section className="route-grid">
        <article className="surface-panel section-card">
          <div className="action-row">
            <button type="button" className="button" disabled>
              Add supplier
            </button>
            <button type="button" className="button button-secondary" disabled>
              Import from invoices
            </button>
          </div>

          <div className="three-column-grid" style={{ marginTop: '1rem' }}>
            {supplierCards.map((supplier) => (
              <article
                key={supplier.name}
                className="surface-panel section-card surface-muted"
              >
                <p className="metric-label">{supplier.contact}</p>
                <h3 className="section-heading" style={{ marginTop: '0.4rem' }}>
                  {supplier.name}
                </h3>
                <p className="section-copy">{supplier.note}</p>
                <div className="pill-row" style={{ marginTop: '0.8rem' }}>
                  <span className="badge badge-warning">{supplier.state}</span>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">Model fields</p>
          <h3 className="section-heading">Supplier schema coverage</h3>
          <ul className="stack-list" style={{ marginTop: '1rem' }}>
            {supplierFields.map((field) => (
              <li key={field} className="stack-item">
                <span>{field}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}

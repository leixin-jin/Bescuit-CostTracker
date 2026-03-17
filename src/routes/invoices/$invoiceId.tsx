import { Link, createFileRoute } from '@tanstack/react-router'
import { formatCurrency } from '../../lib/utils'

const detailItems = [
  {
    product: 'Aceite de oliva virgen extra 5L',
    qty: '3 ud',
    price: 8.5,
    total: 28.05,
  },
  { product: 'Pollo entero', qty: '10 kg', price: 3.2, total: 35.2 },
] as const

export const Route = createFileRoute('/invoices/$invoiceId')({
  component: InvoiceDetailPage,
})

function InvoiceDetailPage() {
  const { invoiceId } = Route.useParams()

  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <p className="eyebrow">Invoice detail shell</p>
        <h2 className="page-title">
          Prepared editor for invoice record {invoiceId}.
        </h2>
        <p className="page-copy">
          This route exists now so phase 2 can focus on loading and updating
          saved records instead of adding more navigation plumbing later.
        </p>
        <div className="hero-actions" style={{ marginTop: '1rem' }}>
          <Link to="/invoices/" className="button button-secondary">
            Back to invoices
          </Link>
        </div>
      </section>

      <section className="content-grid">
        <article className="surface-panel section-card">
          <div className="pill-row">
            <span className="badge badge-info">Makro</span>
            <span className="badge badge-success">verified</span>
            <span className="badge badge-warning">2 lines</span>
          </div>

          <div className="table-shell" style={{ marginTop: '1rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Unitario</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detailItems.map((item) => (
                  <tr key={item.product}>
                    <td>{item.product}</td>
                    <td>{item.qty}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">Future edit tools</p>
          <h3 className="section-heading">Planned controls</h3>
          <ul className="stack-list" style={{ marginTop: '1rem' }}>
            <li className="stack-item">
              <span>Inline item correction</span>
            </li>
            <li className="stack-item">
              <span>Draft / verified status switch</span>
            </li>
            <li className="stack-item">
              <span>Delete invoice with cascading item cleanup</span>
            </li>
          </ul>
        </article>
      </section>
    </div>
  )
}

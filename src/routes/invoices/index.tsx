import { Link, createFileRoute } from '@tanstack/react-router'
import { formatCurrency, formatShortDate } from '../../lib/utils'

const plannedInvoices = [
  {
    id: 'makro-2026-03-16',
    supplier: 'Makro',
    number: 'ALB-2026-0342',
    date: '2026-03-16',
    total: 63.25,
    items: 2,
    status: 'verified',
  },
  {
    id: 'mercabarna-2026-03-12',
    supplier: 'Mercabarna',
    number: 'FC-200184',
    date: '2026-03-12',
    total: 186.4,
    items: 7,
    status: 'draft',
  },
  {
    id: 'carnes-sur-2026-03-09',
    supplier: 'Carnes Sur',
    number: 'CS-9918',
    date: '2026-03-09',
    total: 94.7,
    items: 4,
    status: 'verified',
  },
] as const

export const Route = createFileRoute('/invoices/')({ component: InvoicesPage })

function InvoicesPage() {
  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <p className="eyebrow">Invoice registry</p>
        <h2 className="page-title">
          List, filter, and inspect every saved delivery note.
        </h2>
        <p className="page-copy">
          This page is ready for server-driven filtering once phase 2 starts
          writing invoices into D1. The dynamic detail route is already in place
          for individual record review.
        </p>
      </section>

      <section className="route-grid">
        <article className="surface-panel section-card">
          <div className="two-column-grid">
            <div className="field">
              <label htmlFor="invoice-search">Search invoice</label>
              <input
                id="invoice-search"
                className="text-input"
                placeholder="Proveedor, numero, producto..."
                disabled
              />
            </div>
            <div className="field">
              <label htmlFor="invoice-filter">Status</label>
              <select
                id="invoice-filter"
                className="select-input"
                disabled
                defaultValue="all"
              >
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="table-shell" style={{ marginTop: '1rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {plannedInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <Link
                        to="/invoices/$invoiceId"
                        params={{ invoiceId: invoice.id }}
                        className="inline-link"
                      >
                        {invoice.number}
                      </Link>
                    </td>
                    <td>{invoice.supplier}</td>
                    <td>{formatShortDate(invoice.date)}</td>
                    <td>{invoice.items}</td>
                    <td>{formatCurrency(invoice.total)}</td>
                    <td>
                      <span
                        className={`badge ${
                          invoice.status === 'verified'
                            ? 'badge-success'
                            : 'badge-warning'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">Ready for wiring</p>
          <h3 className="section-heading">Next behaviors</h3>
          <ul className="stack-list" style={{ marginTop: '1rem' }}>
            <li className="stack-item">
              <span>Server-side date and supplier ordering</span>
            </li>
            <li className="stack-item">
              <span>
                Search by invoice number, supplier, or product keyword
              </span>
            </li>
            <li className="stack-item">
              <span>Detail page edit and delete actions</span>
            </li>
          </ul>
        </article>
      </section>
    </div>
  )
}

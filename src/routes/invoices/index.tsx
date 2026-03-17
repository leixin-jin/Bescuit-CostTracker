import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { formatCurrency, formatShortDate } from '../../lib/utils'
import { listInvoicesQuery } from '../../features/invoices/invoice.functions'
import { invoiceSearchSchema } from '../../features/invoices/schema'

export const Route = createFileRoute('/invoices/')({
  validateSearch: (search) => invoiceSearchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listInvoicesQuery({ data: deps }),
  component: InvoicesPage,
})

function InvoicesPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const search = Route.useSearch()
  const invoices = Route.useLoaderData()

  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <p className="eyebrow">Invoice registry</p>
        <h2 className="page-title">List, filter, and inspect every saved invoice.</h2>
        <p className="page-copy">
          The registry now reads directly from D1, supports keyword lookup
          across suppliers, numbers, and products, and keeps draft invoices
          visible until they are verified.
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
                value={search.query}
                onChange={(event) =>
                  navigate({
                    search: (previous) => ({
                      ...previous,
                      query: event.target.value,
                    }),
                  })
                }
              />
            </div>

            <div className="field">
              <label htmlFor="invoice-filter">Status</label>
              <select
                id="invoice-filter"
                className="select-input"
                value={search.status}
                onChange={(event) =>
                  navigate({
                    search: (previous) => ({
                      ...previous,
                      status:
                        event.target.value === 'draft' ||
                        event.target.value === 'verified'
                          ? event.target.value
                          : 'all',
                    }),
                  })
                }
              >
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {invoices.length > 0 ? (
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
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <Link
                          to="/invoices/$invoiceId"
                          params={{ invoiceId: invoice.id }}
                          className="inline-link"
                        >
                          {invoice.invoiceNumber || 'Sin numero'}
                        </Link>
                      </td>
                      <td>{invoice.supplierName}</td>
                      <td>{formatShortDate(invoice.invoiceDate)}</td>
                      <td>{invoice.itemCount}</td>
                      <td>{formatCurrency(invoice.totalAmount)}</td>
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
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">0</div>
              <div>
                <h3 className="section-heading">No invoices match the current filter</h3>
                <p className="section-copy">
                  Adjust the search, clear the status filter, or import a new
                  invoice to populate the registry.
                </p>
              </div>
              <Link to="/upload" className="button">
                Import invoice
              </Link>
            </div>
          )}
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">Live summary</p>
          <h3 className="section-heading">Current registry window</h3>
          <ul className="stack-list" style={{ marginTop: '1rem' }}>
            <li className="stack-item">
              <span>Visible invoices</span>
              <span className="stack-item__value">{invoices.length}</span>
            </li>
            <li className="stack-item">
              <span>Draft count</span>
              <span className="stack-item__value">
                {invoices.filter((invoice) => invoice.status === 'draft').length}
              </span>
            </li>
            <li className="stack-item">
              <span>Window total</span>
              <span className="stack-item__value">
                {formatCurrency(
                  invoices.reduce(
                    (sum, invoice) => sum + invoice.totalAmount,
                    0,
                  ),
                )}
              </span>
            </li>
          </ul>
        </article>
      </section>
    </div>
  )
}

import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { EmptyStateCard } from '../../components/AppStates'
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
        <p className="eyebrow">发票登记簿</p>
        <h2 className="page-title">列出、筛选和检查每一张已保存的发票</h2>
        <p className="page-copy">
          登记簿现在直接从 D1 读取数据，支持按供应商、编号和商品关键词搜索，并保持草稿发票可见直到审核通过。
        </p>
      </section>

      <section className="route-grid">
        <article className="surface-panel section-card">
          <div className="two-column-grid">
            <div className="field">
              <label htmlFor="invoice-search">搜索发票</label>
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
              <label htmlFor="invoice-filter">状态</label>
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
                <option value="all">全部</option>
                <option value="verified">已审核</option>
                <option value="draft">草稿</option>
              </select>
            </div>
          </div>

          {invoices.length > 0 ? (
            <div className="table-shell" style={{ marginTop: '1rem' }}>
              <table className="data-table data-table--responsive">
                <thead>
                  <tr>
                    <th>发票</th>
                    <th>供应商</th>
                    <th>日期</th>
                    <th>行项</th>
                    <th>金额</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td data-label="发票">
                        <Link
                          to="/invoices/$invoiceId"
                          params={{ invoiceId: invoice.id }}
                          className="inline-link"
                        >
                          {invoice.invoiceNumber || '无编号'}
                        </Link>
                      </td>
                      <td data-label="供应商">{invoice.supplierName}</td>
                      <td data-label="日期">{formatShortDate(invoice.invoiceDate)}</td>
                      <td data-label="行项">{invoice.itemCount}</td>
                      <td data-label="金额">{formatCurrency(invoice.totalAmount)}</td>
                      <td data-label="状态">
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
            <EmptyStateCard
              title="没有发票匹配当前筛选条件"
              copy="请调整搜索关键词、清除状态筛选，或导入新发票以填充登记簿。"
              action={
                <Link to="/upload" className="button">
                  导入发票
                </Link>
              }
            />
          )}
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">实时汇总</p>
          <h3 className="section-heading">当前登记窗口</h3>
          <ul className="stack-list" style={{ marginTop: '1rem' }}>
            <li className="stack-item">
              <span>可见发票数</span>
              <span className="stack-item__value">{invoices.length}</span>
            </li>
            <li className="stack-item">
              <span>草稿数</span>
              <span className="stack-item__value">
                {invoices.filter((invoice) => invoice.status === 'draft').length}
              </span>
            </li>
            <li className="stack-item">
              <span>窗口总额</span>
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

import type {
  AnalyticsPageData,
  ComparePageData,
  DashboardMetrics,
  ProductSuggestion,
} from './analytics.server'
import {
  formatCurrency,
  formatFullDate,
  formatMonthLabel,
} from '../../lib/utils'

type SuggestionListProps = {
  suggestions: ProductSuggestion[]
  onSelect: (suggestion: ProductSuggestion) => void
}

function SuggestionList({ suggestions, onSelect }: SuggestionListProps) {
  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="suggestion-list" role="listbox" aria-label="Product suggestions">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.productKey}
          type="button"
          className="suggestion-item"
          onClick={() => onSelect(suggestion)}
        >
          <span>
            <strong>{suggestion.displayName}</strong>
            <span className="suggestion-item__meta">
              {suggestion.sampleCount} samples
              {suggestion.variantCount > 1
                ? ` · ${suggestion.variantCount} name variants`
                : ''}
            </span>
          </span>
          <span className="badge badge-info">
            {suggestion.lastPurchasedAt
              ? formatFullDate(suggestion.lastPurchasedAt)
              : 'No date'}
          </span>
        </button>
      ))}
    </div>
  )
}

export function DashboardOverview({
  metrics,
}: {
  metrics: DashboardMetrics
}) {
  const metricCards = [
    {
      label: 'Total spend',
      value: formatCurrency(metrics.totalSpend),
      copy:
        metrics.totalInvoiceCount > 0
          ? `${metrics.totalInvoiceCount} invoices stored in D1.`
          : 'No invoices imported yet.',
    },
    {
      label: 'Active suppliers',
      value: String(metrics.activeSuppliers),
      copy:
        metrics.activeSuppliers > 0
          ? 'Suppliers with at least one imported invoice.'
          : 'Supplier count will appear after the first import.',
    },
    {
      label: `Invoices in ${metrics.recentWindowDays} days`,
      value: String(metrics.recentInvoiceCount),
      copy:
        metrics.latestInvoiceDate
          ? `Latest import dated ${formatFullDate(metrics.latestInvoiceDate)}.`
          : 'No recent activity yet.',
    },
    {
      label: `Categories in ${metrics.recentWindowDays} days`,
      value: String(metrics.recentCategoryCount),
      copy:
        metrics.recentCategoryCount > 0
          ? 'Distinct purchased categories in the current operating window.'
          : 'Categories will populate after invoice lines are imported.',
    },
  ] as const

  return (
    <>
      <section className="metrics-grid">
        {metricCards.map((metric) => (
          <article key={metric.label} className="surface-panel metric-card">
            <p className="metric-label">{metric.label}</p>
            <p className="metric-value metric-value--compact">{metric.value}</p>
            <p className="metric-copy">{metric.copy}</p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="surface-panel section-card">
          <p className="eyebrow">Live operating view</p>
          <h3 className="section-heading">What the dashboard now tracks</h3>
          <ul className="stack-list" style={{ marginTop: '1rem' }}>
            <li className="stack-item">
              <span>Imported invoices</span>
              <span className="stack-item__value">{metrics.totalInvoiceCount}</span>
            </li>
            <li className="stack-item">
              <span>Suppliers with activity</span>
              <span className="stack-item__value">{metrics.activeSuppliers}</span>
            </li>
            <li className="stack-item">
              <span>Recent category coverage</span>
              <span className="stack-item__value">{metrics.recentCategoryCount}</span>
            </li>
          </ul>
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">Phase 3</p>
          <h3 className="section-heading">Analysis layer is live</h3>
          <p className="section-copy">
            Dashboard, product trends, and supplier comparisons now read from
            the same D1 invoice line data. Empty databases fall back to neutral
            copy instead of placeholder metrics.
          </p>
        </article>
      </section>
    </>
  )
}

type AnalyticsPageContentProps = {
  data: AnalyticsPageData
  query: string
  months: string
  onQueryChange: (value: string) => void
  onMonthsChange: (value: string) => void
  onSelectProduct: (suggestion: ProductSuggestion) => void
  onSelectUnit: (unit: string) => void
}

export function AnalyticsPageContent({
  data,
  query,
  months,
  onQueryChange,
  onMonthsChange,
  onSelectProduct,
  onSelectUnit,
}: AnalyticsPageContentProps) {
  const maxAverage = Math.max(
    ...data.trend.map((point) => point.averageUnitPrice),
    1,
  )

  return (
    <>
      <section className="surface-panel hero-panel">
        <p className="eyebrow">Price intelligence</p>
        <h2 className="page-title">
          Search a product and read its monthly purchase trend from D1.
        </h2>
        <p className="page-copy">
          Product search uses normalized invoice item names, monthly aggregates
          calculate average, min, max, quantity, and sample count, and mixed
          units are blocked until the user selects one unit explicitly.
        </p>
      </section>

      <section className="route-grid">
        <article className="surface-panel section-card">
          <div className="two-column-grid">
            <div className="field">
              <label htmlFor="product-search">Product search</label>
              <input
                id="product-search"
                className="text-input"
                placeholder="Aceite de oliva virgen extra 5L"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="analytics-window">Window</label>
              <select
                id="analytics-window"
                className="select-input"
                value={months}
                onChange={(event) => onMonthsChange(event.target.value)}
              >
                <option value="3">Last 3 months</option>
                <option value="6">Last 6 months</option>
                <option value="12">Last 12 months</option>
              </select>
            </div>
          </div>

          <SuggestionList suggestions={data.suggestions} onSelect={onSelectProduct} />

          {data.selectedProduct ? (
            <>
              <div className="section-card__header" style={{ marginTop: '1.25rem' }}>
                <div>
                  <p className="eyebrow">Selected product</p>
                  <h3 className="section-heading">{data.selectedProduct.displayName}</h3>
                  <p className="section-copy">
                    {data.selectedProduct.totalSamples} samples · last purchased{' '}
                    {data.selectedProduct.lastPurchasedAt
                      ? formatFullDate(data.selectedProduct.lastPurchasedAt)
                      : 'without a dated sample'}
                  </p>
                </div>
                {data.selectedProduct.selectedUnit ? (
                  <span className="badge badge-success">
                    Unit: {data.selectedProduct.selectedUnit}
                  </span>
                ) : (
                  <span className="badge badge-warning">Pick a unit</span>
                )}
              </div>

              <div className="pill-row" style={{ marginTop: '0.5rem' }}>
                {data.selectedProduct.unitOptions.map((option) => (
                  <button
                    key={option.unit}
                    type="button"
                    className={`button button-secondary unit-pill${
                      option.unit === data.selectedProduct?.selectedUnit ? ' is-selected' : ''
                    }`}
                    onClick={() => onSelectUnit(option.unit)}
                  >
                    {option.unit} · {option.sampleCount}
                  </button>
                ))}
              </div>

              {data.selectedProduct.conflictWarning ? (
                <p className="feedback-inline feedback-inline--warning">
                  {data.selectedProduct.conflictWarning}
                </p>
              ) : null}

              {data.trend.length > 0 ? (
                <div className="chart-shell" style={{ marginTop: '1.4rem' }}>
                  {data.trend.map((point) => (
                    <div key={point.month} className="chart-bar">
                      <span className="chart-bar__value">
                        {formatCurrency(point.averageUnitPrice)}
                      </span>
                      <div
                        className="chart-bar__column"
                        style={{
                          height: `${Math.max(
                            18,
                            Math.round((point.averageUnitPrice / maxAverage) * 100),
                          )}%`,
                        }}
                      />
                      <span className="chart-bar__label">
                        {formatMonthLabel(point.month)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state__icon">0</div>
                  <div>
                    <h3 className="section-heading">No samples in the selected window</h3>
                    <p className="section-copy">
                      Keep the product selected and widen the window, or import
                      more invoices for this item.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">3</div>
              <div>
                <h3 className="section-heading">Choose a product to start</h3>
                <p className="section-copy">
                  Type at least two characters to fetch indexed product suggestions.
                </p>
              </div>
            </div>
          )}
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">Trend outputs</p>
          <h3 className="section-heading">Monthly aggregates</h3>
          {data.trend.length > 0 ? (
            <ul className="stack-list" style={{ marginTop: '1rem' }}>
              {data.trend.map((point) => (
                <li key={point.month} className="stack-item">
                  <span>{formatMonthLabel(point.month)}</span>
                  <span className="stack-item__value">
                    {formatCurrency(point.averageUnitPrice)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="section-copy">
              Average, minimum, maximum, total quantity, and observation count
              will appear once a product and compatible unit are selected.
            </p>
          )}

          {data.selectedProduct?.selectedUnit && data.trend.length > 0 ? (
            <ul className="stack-list" style={{ marginTop: '1rem' }}>
              <li className="stack-item">
                <span>Tracked unit</span>
                <span className="stack-item__value">{data.selectedProduct.selectedUnit}</span>
              </li>
              <li className="stack-item">
                <span>Total samples</span>
                <span className="stack-item__value">
                  {data.trend.reduce((sum, point) => sum + point.sampleCount, 0)}
                </span>
              </li>
              <li className="stack-item">
                <span>Total quantity</span>
                <span className="stack-item__value">
                  {data.trend
                    .reduce((sum, point) => sum + point.totalQuantity, 0)
                    .toFixed(2)}
                </span>
              </li>
            </ul>
          ) : null}
        </article>
      </section>
    </>
  )
}

type ComparePageContentProps = {
  data: ComparePageData
  query: string
  sort: string
  onQueryChange: (value: string) => void
  onSortChange: (value: string) => void
  onSelectProduct: (suggestion: ProductSuggestion) => void
  onPageChange: (page: number) => void
}

export function ComparePageContent({
  data,
  query,
  sort,
  onQueryChange,
  onSortChange,
  onSelectProduct,
  onPageChange,
}: ComparePageContentProps) {
  return (
    <>
      <section className="surface-panel hero-panel">
        <p className="eyebrow">Supplier benchmark</p>
        <h2 className="page-title">
          Rank each supplier by its latest observed price for the same product.
        </h2>
        <p className="page-copy">
          The comparison matrix keeps only each supplier&apos;s latest sample per
          product and unit, then ranks the current offers from cheapest to most
          expensive.
        </p>
      </section>

      <section className="route-grid">
        <article className="surface-panel section-card">
          <div className="two-column-grid">
            <div className="field">
              <label htmlFor="compare-search">Search product</label>
              <input
                id="compare-search"
                className="text-input"
                placeholder="Aceite, cerveza, pollo..."
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="compare-sort">Sort rows</label>
              <select
                id="compare-sort"
                className="select-input"
                value={sort}
                onChange={(event) => onSortChange(event.target.value)}
              >
                <option value="best-price">Best price</option>
                <option value="supplier-count">Supplier count</option>
                <option value="recent">Most recent</option>
              </select>
            </div>
          </div>

          <SuggestionList suggestions={data.suggestions} onSelect={onSelectProduct} />

          {data.rows.length > 0 ? (
            <div className="comparison-matrix" style={{ marginTop: '1.25rem' }}>
              {data.rows.map((row) => (
                <section key={`${row.productKey}-${row.unit}`} className="comparison-row">
                  <div className="comparison-row__header">
                    <div>
                      <h3 className="section-heading" style={{ marginBottom: '0.2rem' }}>
                        {row.displayName}
                      </h3>
                      <p className="section-copy">
                        Latest known prices in {row.unit}
                        {row.lastObservedAt
                          ? ` · last sample ${formatFullDate(row.lastObservedAt)}`
                          : ''}
                      </p>
                    </div>
                    <div className="pill-row">
                      <span className="badge badge-success">
                        Best {formatCurrency(row.bestPrice)}
                      </span>
                      <span className="badge badge-info">
                        {row.supplierCount} suppliers
                      </span>
                    </div>
                  </div>

                  <div className="comparison-row__prices">
                    {row.offers.map((offer) => (
                      <div
                        key={`${row.productKey}-${row.unit}-${offer.supplierName}`}
                        className={`price-card${offer.isBest ? ' is-best' : ''}`}
                      >
                        <div>
                          <strong>
                            #{offer.priceRank} {offer.supplierName}
                          </strong>
                          <p className="muted" style={{ margin: '0.2rem 0 0' }}>
                            Latest sample {formatFullDate(offer.itemDate)}
                          </p>
                        </div>
                        <span
                          className={`badge ${
                            offer.isBest ? 'badge-success' : 'badge-info'
                          }`}
                        >
                          {formatCurrency(offer.unitPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">0</div>
              <div>
                <h3 className="section-heading">No comparison rows match the filter</h3>
                <p className="section-copy">
                  Search for a product with at least two supplier samples, or
                  import more invoices to create a benchmark.
                </p>
              </div>
            </div>
          )}
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">Current window</p>
          <h3 className="section-heading">Comparison summary</h3>
          <ul className="stack-list" style={{ marginTop: '1rem' }}>
            <li className="stack-item">
              <span>Visible products</span>
              <span className="stack-item__value">{data.rows.length}</span>
            </li>
            <li className="stack-item">
              <span>Total ranked rows</span>
              <span className="stack-item__value">{data.totalRows}</span>
            </li>
            <li className="stack-item">
              <span>Page</span>
              <span className="stack-item__value">
                {data.page} / {data.totalPages}
              </span>
            </li>
          </ul>

          <div className="pagination-row" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="button button-secondary"
              disabled={data.page <= 1}
              onClick={() => onPageChange(data.page - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="button button-secondary"
              disabled={data.page >= data.totalPages}
              onClick={() => onPageChange(data.page + 1)}
            >
              Next
            </button>
          </div>
        </article>
      </section>
    </>
  )
}

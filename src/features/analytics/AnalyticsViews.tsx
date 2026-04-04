import type {
  AnalyticsPageData,
  ComparePageData,
  DashboardMetrics,
  ProductSuggestion,
} from './analytics.server'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EmptyStateCard } from '../../components/AppStates'
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
              {suggestion.sampleCount} 个样本
              {suggestion.variantCount > 1
                ? ` · ${suggestion.variantCount} 个名称变体`
                : ''}
            </span>
          </span>
          <span className="badge badge-info">
            {suggestion.lastPurchasedAt
              ? formatFullDate(suggestion.lastPurchasedAt)
              : '无日期'}
          </span>
        </button>
      ))}
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
}

export function DashboardOverview({
  metrics,
}: {
  metrics: DashboardMetrics
}) {
  const metricCards = [
    {
      label: '总支出',
      value: formatCurrency(metrics.totalSpend),
      copy:
        metrics.totalInvoiceCount > 0
          ? `D1 中已存储 ${metrics.totalInvoiceCount} 张发票。`
          : '尚未导入发票。',
    },
    {
      label: '活跃供应商',
      value: String(metrics.activeSuppliers),
      copy:
        metrics.activeSuppliers > 0
          ? '至少导入过一张发票的供应商。'
          : '第一次导入后将显示供应商数量。',
    },
    {
      label: `近 ${metrics.recentWindowDays} 天发票`,
      value: String(metrics.recentInvoiceCount),
      copy:
        metrics.latestInvoiceDate
          ? `最近导入时间为 ${formatFullDate(metrics.latestInvoiceDate)}。`
          : '尚无最近活动。',
    },
    {
      label: `近 ${metrics.recentWindowDays} 天分类`,
      value: String(metrics.recentCategoryCount),
      copy:
        metrics.recentCategoryCount > 0
          ? '当前运营窗口已购买的不同分类数。'
          : '导入发票行项后将显示分类数据。',
    },
  ] as const

  return (
    <>
      <motion.section 
        className="metrics-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {metricCards.map((metric) => (
          <motion.article key={metric.label} className="surface-panel metric-card" variants={itemVariants}>
            <p className="metric-label">{metric.label}</p>
            <p className="metric-value metric-value--compact">{metric.value}</p>
            <p className="metric-copy">{metric.copy}</p>
          </motion.article>
        ))}
      </motion.section>

      <motion.section 
        className="content-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.article className="surface-panel section-card" variants={itemVariants}>
          <p className="eyebrow">实时运营视图</p>
          <h3 className="section-heading">仪表盘当前追踪内容</h3>
          <ul className="stack-list" style={{ marginTop: '1rem' }}>
            <li className="stack-item">
              <span>已导入发票</span>
              <span className="stack-item__value">{metrics.totalInvoiceCount}</span>
            </li>
            <li className="stack-item">
              <span>有活动的供应商</span>
              <span className="stack-item__value">{metrics.activeSuppliers}</span>
            </li>
            <li className="stack-item">
              <span>近期分类覆盖</span>
              <span className="stack-item__value">{metrics.recentCategoryCount}</span>
            </li>
          </ul>
        </motion.article>

        <motion.article className="surface-panel section-card surface-muted" variants={itemVariants}>
          <p className="eyebrow">分析层</p>
          <h3 className="section-heading">分析功能已上线</h3>
          <p className="section-copy">
            仪表盘、商品趋势和供应商比价现在读取相同的 D1 发票行数据。空数据库将显示中性文案而非占位指标。
          </p>
        </motion.article>
      </motion.section>
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
  return (
    <>
      <section className="surface-panel hero-panel">
        <p className="eyebrow">价格情报</p>
        <h2 className="page-title">
          搜索商品并从 D1 读取其月度采购趋势
        </h2>
        <p className="page-copy">
          商品搜索使用归一化的发票行项名，月度聚合计算平均、最低、最高价、采购量和样本数，混合单位时需用户明确选择一个单位。
        </p>
      </section>

      <section className="route-grid">
        <article className="surface-panel section-card">
          <div className="two-column-grid">
            <div className="field-floating">
              <input
                id="product-search"
                className="text-input"
                placeholder=" "
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
              />
              <label htmlFor="product-search">商品搜索</label>
            </div>

            <div className="field-floating">
              <select
                id="analytics-window"
                className="select-input"
                value={months}
                onChange={(event) => onMonthsChange(event.target.value)}
              >
                <option value="3">近 3 个月</option>
                <option value="6">近 6 个月</option>
                <option value="12">近 12 个月</option>
              </select>
              <label htmlFor="analytics-window">时间窗口</label>
            </div>
          </div>

          <SuggestionList suggestions={data.suggestions} onSelect={onSelectProduct} />

          {data.selectedProduct ? (
            <>
              <div className="section-card__header" style={{ marginTop: '1.25rem' }}>
                <div>
                  <p className="eyebrow">已选商品</p>
                  <h3 className="section-heading">{data.selectedProduct.displayName}</h3>
                  <p className="section-copy">
                    {data.selectedProduct.totalSamples} 个样本 · 最近采购于{' '}
                    {data.selectedProduct.lastPurchasedAt
                      ? formatFullDate(data.selectedProduct.lastPurchasedAt)
                      : '无日期样本'}
                  </p>
                </div>
                {data.selectedProduct.selectedUnit ? (
                  <span className="badge badge-success">
                    单位：{data.selectedProduct.selectedUnit}
                  </span>
                ) : (
                  <span className="badge badge-warning">选择单位</span>
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
                <motion.div 
                  className="chart-shell" 
                  style={{ marginTop: '1.4rem', height: 320, display: 'block' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.trend.map(p => ({ ...p, monthLabel: formatMonthLabel(p.month) }))}
                      margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={(value) => `€${value}`} />
                      <Tooltip 
                        cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-md)' }}
                        itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                        formatter={(value: any) => [formatCurrency(value as number), '平均价格']}
                      />
                      <Area type="monotone" dataKey="averageUnitPrice" name="平均价格" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                <EmptyStateCard
                  title="所选窗口无样本"
                  copy="保持选中商品并扩大窗口范围，或导入更多该商品的发票。"
                />
              )}
            </>
          ) : (
            <EmptyStateCard
              icon="3"
              title="选择一个商品开始"
              copy="输入至少两个字符以获取已索引的商品建议。"
            />
          )}
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">趋势输出</p>
          <h3 className="section-heading">月度汇总</h3>
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
              选择商品和兼容单位后，将显示平均、最低、最高价、总采购量和观测次数。
            </p>
          )}

          {data.selectedProduct?.selectedUnit && data.trend.length > 0 ? (
            <ul className="stack-list" style={{ marginTop: '1rem' }}>
              <li className="stack-item">
                <span>追踪单位</span>
                <span className="stack-item__value">{data.selectedProduct.selectedUnit}</span>
              </li>
              <li className="stack-item">
                <span>总样本数</span>
                <span className="stack-item__value">
                  {data.trend.reduce((sum, point) => sum + point.sampleCount, 0)}
                </span>
              </li>
              <li className="stack-item">
                <span>总采购量</span>
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
        <p className="eyebrow">供应商比价</p>
        <h2 className="page-title">
          按同一商品的最新观测价格对供应商进行排名。
        </h2>
        <p className="page-copy">
          比价矩阵仅为您保留每家供应商针对每个商品及单位的最新样本，并将当前报价从低到高进行排名。
        </p>
      </section>

      <section className="route-grid">
        <article className="surface-panel section-card">
          <div className="two-column-grid">
            <div className="field-floating">
              <input
                id="compare-search"
                className="text-input"
                placeholder=" "
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
              />
              <label htmlFor="compare-search">搜索商品</label>
            </div>

            <div className="field-floating">
              <select
                id="compare-sort"
                className="select-input"
                value={sort}
                onChange={(event) => onSortChange(event.target.value)}
              >
                <option value="best-price">最低价格</option>
                <option value="supplier-count">供应商数量</option>
                <option value="recent">最近更新</option>
              </select>
              <label htmlFor="compare-sort">排序列</label>
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
                        {row.unit} 的最新已知价格
                        {row.lastObservedAt
                          ? ` · 最新样本 ${formatFullDate(row.lastObservedAt)}`
                          : ''}
                      </p>
                    </div>
                    <div className="pill-row">
                      <span className="badge badge-success">
                        最低 {formatCurrency(row.bestPrice)}
                      </span>
                      <span className="badge badge-info">
                        {row.supplierCount} 家供应商
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
                            最新样本 {formatFullDate(offer.itemDate)}
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
            <EmptyStateCard
              title="没有找到匹配的比价数据"
              copy="请搜索具有至少两个供应商样本的商品，或导入更多发票以建立比价基准。"
            />
          )}
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">当前窗口</p>
          <h3 className="section-heading">比价汇总</h3>
          <ul className="stack-list" style={{ marginTop: '1rem' }}>
            <li className="stack-item">
              <span>可见商品数</span>
              <span className="stack-item__value">{data.rows.length}</span>
            </li>
            <li className="stack-item">
              <span>总行数</span>
              <span className="stack-item__value">{data.totalRows}</span>
            </li>
            <li className="stack-item">
              <span>当前页</span>
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
              上一页
            </button>
            <button
              type="button"
              className="button button-secondary"
              disabled={data.page >= data.totalPages}
              onClick={() => onPageChange(data.page + 1)}
            >
              下一页
            </button>
          </div>
        </article>
      </section>
    </>
  )
}

import { Link, createFileRoute } from '@tanstack/react-router'
import { DashboardOverview } from '../features/analytics/AnalyticsViews'
import { getDashboardMetricsQuery } from '../features/analytics/analytics.functions'
import { defaultInvoiceSearch } from '../features/invoices/schema'

export const Route = createFileRoute('/')({
  loader: () => getDashboardMetricsQuery(),
  component: DashboardPage,
})

function DashboardPage() {
  const metrics = Route.useLoaderData()

  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <div className="hero-panel__grid hero-panel__grid--wide">
          <div>
            <p className="eyebrow">地中海成本管控</p>
            <h2 className="page-title">
              酒吧餐厅成本追踪实时采购指标
            </h2>
            <p className="page-copy">
              仪表盘现在读取 D1 中发票、行项、供应商、分析和比价流程的真实状态，展示当前支出、供应商覆盖、最近导入活动和商品分类变动，而非固定的占位指标。
            </p>
          </div>

          <div className="section-card surface-muted">
            <p className="eyebrow">快捷操作</p>
            <div className="hero-actions" style={{ marginTop: '1rem' }}>
              <Link to="/upload" className="button">
                打开上传流程
              </Link>
              <Link
                to="/invoices"
                search={defaultInvoiceSearch}
                className="button button-secondary"
              >
                查看发票列表
              </Link>
            </div>
            <div className="pill-row" style={{ marginTop: '1rem' }}>
              <span className="pill">Cloudflare Workers</span>
              <span className="pill">D1 + Drizzle</span>
              <span className="pill">趋势分析</span>
            </div>
          </div>
        </div>
      </section>

      <DashboardOverview metrics={metrics} />
    </div>
  )
}

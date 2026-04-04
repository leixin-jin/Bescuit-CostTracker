import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { defaultInvoiceSearch } from '../features/invoices/schema'

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return '上次请求未完成。请重试操作或查看发布日志。'
}

export function PageNotice({
  eyebrow,
  title,
  copy,
  actions,
}: {
  eyebrow: string
  title: string
  copy: string
  actions?: ReactNode
}) {
  return (
    <section className="surface-panel hero-panel state-panel">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="page-title">{title}</h2>
      <p className="page-copy">{copy}</p>
      {actions ? (
        <div className="hero-actions" style={{ marginTop: '1rem' }}>
          {actions}
        </div>
      ) : null}
    </section>
  )
}

export function EmptyStateCard({
  icon = '0',
  title,
  copy,
  action,
}: {
  icon?: string
  title: string
  copy: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <div>
        <h3 className="section-heading">{title}</h3>
        <p className="section-copy">{copy}</p>
      </div>
      {action}
    </div>
  )
}

export function RoutePendingState() {
  return (
    <div className="page-shell page-fade">
      <PageNotice
        eyebrow="正在加载"
        title="正在同步最新的发票数据"
        copy="Bescuit 成本追踪正在从 D1 获取本路由所需的数据，加载完成后即显示当前视图。"
        actions={
          <div className="loading-inline" aria-live="polite">
            <span className="loading-dot" />
            <span>正在刷新页面状态…</span>
          </div>
        }
      />
    </div>
  )
}

export function RouteErrorState({ error, reset }: ErrorComponentProps) {
  const safeReset = reset as (() => void) | undefined

  return (
    <div className="page-shell page-fade">
      <PageNotice
        eyebrow="请求失败"
        title="无法加载此页面"
        copy={getErrorMessage(error)}
        actions={
          <>
            {safeReset ? (
              <button type="button" className="button" onClick={() => safeReset()}>
                重试请求
              </button>
            ) : null}
            <Link to="/" className="button button-secondary" activeOptions={{ exact: true }}>
              打开仪表盘
            </Link>
            <Link
              to="/invoices"
              search={defaultInvoiceSearch}
              className="button button-secondary"
            >
              打开发票列表
            </Link>
          </>
        }
      />
    </div>
  )
}

export function RouteNotFoundState() {
  return (
    <div className="page-shell page-fade">
      <PageNotice
        eyebrow="未找到"
        title="请求的页面不存在"
        copy="链接可能已过期，或该路由已不在当前发布版本中。"
        actions={
          <>
            <Link to="/" className="button" activeOptions={{ exact: true }}>
              打开仪表盘
            </Link>
            <Link
              to="/invoices"
              search={defaultInvoiceSearch}
              className="button button-secondary"
            >
              查看发票
            </Link>
          </>
        }
      />
    </div>
  )
}

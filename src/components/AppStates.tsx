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

  return 'The last request did not complete. Retry the action or check the release logs.'
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
        eyebrow="Loading workspace"
        title="Syncing the latest invoice data."
        copy="Bescuit CostTracker is fetching D1-backed data for this route. The current view will appear as soon as the request settles."
        actions={
          <div className="loading-inline" aria-live="polite">
            <span className="loading-dot" />
            <span>Refreshing page state…</span>
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
        eyebrow="Request failed"
        title="This screen could not be loaded."
        copy={getErrorMessage(error)}
        actions={
          <>
            {safeReset ? (
              <button type="button" className="button" onClick={() => safeReset()}>
                Retry request
              </button>
            ) : null}
            <Link to="/" className="button button-secondary" activeOptions={{ exact: true }}>
              Open dashboard
            </Link>
            <Link
              to="/invoices"
              search={defaultInvoiceSearch}
              className="button button-secondary"
            >
              Open invoices
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
        eyebrow="Not found"
        title="The requested page does not exist."
        copy="The link may be stale, or the route may no longer be part of the current release."
        actions={
          <>
            <Link to="/" className="button" activeOptions={{ exact: true }}>
              Open dashboard
            </Link>
            <Link
              to="/invoices"
              search={defaultInvoiceSearch}
              className="button button-secondary"
            >
              Review invoices
            </Link>
          </>
        }
      />
    </div>
  )
}

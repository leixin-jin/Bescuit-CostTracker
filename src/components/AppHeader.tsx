import { Link } from '@tanstack/react-router'
import { defaultInvoiceSearch } from '../features/invoices/schema'

const navigation: Array<{
  to: '/' | '/upload' | '/invoices' | '/analytics' | '/compare' | '/suppliers'
  label: string
  exact?: boolean
  search?: typeof defaultInvoiceSearch
}> = [
  { to: '/', label: 'Dashboard', exact: true },
  { to: '/upload', label: 'Upload' },
  { to: '/invoices', label: 'Invoices', search: defaultInvoiceSearch },
  { to: '/analytics', label: 'Analytics' },
  { to: '/compare', label: 'Compare' },
  { to: '/suppliers', label: 'Suppliers' },
]

export function AppHeader() {
  return (
    <header className="app-shell app-header">
      <div className="app-header__bar">
        <div className="brand-lockup">
          <Link to="/" className="brand-mark" activeOptions={{ exact: true }}>
            BC
          </Link>
          <div>
            <p className="eyebrow">Bescuit CostTracker</p>
            <h1 className="brand-title">
              Bar purchasing control from invoice to insight
            </h1>
          </div>
        </div>

        <nav className="desktop-nav" aria-label="Primary">
          {navigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              search={item.search}
              activeOptions={{ exact: item.exact }}
              className="nav-chip"
              activeProps={{ className: 'is-active' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="status-pill">
          <span className="status-dot" />
          Phase 3 live
        </div>
      </div>
    </header>
  )
}

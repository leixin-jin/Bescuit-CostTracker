import { Link } from '@tanstack/react-router'

const navigation = [
  { to: '/', label: 'Dashboard', exact: true },
  { to: '/upload', label: 'Upload' },
  { to: '/invoices/', label: 'Invoices' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/compare', label: 'Compare' },
  { to: '/suppliers/', label: 'Suppliers' },
] as const

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
          Phase 1 verified
        </div>
      </div>
    </header>
  )
}

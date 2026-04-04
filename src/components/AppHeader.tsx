import { Link } from '@tanstack/react-router'
import { defaultInvoiceSearch } from '../features/invoices/schema'

const navigation: Array<{
  to: '/' | '/upload' | '/invoices' | '/analytics' | '/compare' | '/suppliers'
  label: string
  exact?: boolean
  search?: typeof defaultInvoiceSearch
}> = [
  { to: '/', label: '仪表盘', exact: true },
  { to: '/upload', label: '上传' },
  { to: '/invoices', label: '发票', search: defaultInvoiceSearch },
  { to: '/analytics', label: '分析' },
  { to: '/compare', label: '比价' },
  { to: '/suppliers', label: '供应商' },
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
            <p className="eyebrow">Bescuit 成本追踪</p>
            <h1 className="brand-title">
              从发票到洞察的酒吧采购成本管控
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
      </div>
    </header>
  )
}

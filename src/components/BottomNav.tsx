import { Link } from '@tanstack/react-router'
import {
  ChartColumnBig,
  FileStack,
  LayoutDashboard,
  Scale,
  Store,
  Upload,
} from 'lucide-react'
import { defaultInvoiceSearch } from '../features/invoices/schema'

const navigation: Array<{
  to: '/' | '/upload' | '/invoices' | '/analytics' | '/compare' | '/suppliers'
  label: string
  exact?: boolean
  icon: typeof LayoutDashboard
  search?: typeof defaultInvoiceSearch
}> = [
  { to: '/', label: '首页', exact: true, icon: LayoutDashboard },
  { to: '/upload', label: '上传', icon: Upload },
  {
    to: '/invoices',
    label: '发票',
    icon: FileStack,
    search: defaultInvoiceSearch,
  },
  { to: '/analytics', label: '分析', icon: ChartColumnBig },
  { to: '/compare', label: '比价', icon: Scale },
  { to: '/suppliers', label: '供应商', icon: Store },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="底部导航">
      {navigation.map((item) => {
        const Icon = item.icon

        return (
          <Link
            key={item.to}
            to={item.to}
            search={item.search}
            activeOptions={{ exact: item.exact }}
            className="bottom-nav__link"
            activeProps={{ className: 'is-active' }}
          >
            <Icon size={18} strokeWidth={2} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

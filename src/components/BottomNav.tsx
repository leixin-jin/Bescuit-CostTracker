import { Link } from '@tanstack/react-router'
import {
  ChartColumnBig,
  FileStack,
  LayoutDashboard,
  Scale,
  Store,
  Upload,
} from 'lucide-react'

const navigation = [
  { to: '/', label: 'Home', exact: true, icon: LayoutDashboard },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/invoices/', label: 'Invoices', icon: FileStack },
  { to: '/analytics', label: 'Analytics', icon: ChartColumnBig },
  { to: '/compare', label: 'Compare', icon: Scale },
  { to: '/suppliers/', label: 'Suppliers', icon: Store },
] as const

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      {navigation.map((item) => {
        const Icon = item.icon

        return (
          <Link
            key={item.to}
            to={item.to}
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

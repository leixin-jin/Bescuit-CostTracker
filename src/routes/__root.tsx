import type { ReactNode } from 'react'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { AppHeader } from '../components/AppHeader'
import { AppRuntime } from '../components/AppRuntime'
import {
  RouteErrorState,
  RouteNotFoundState,
} from '../components/AppStates'
import { BottomNav } from '../components/BottomNav'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Bescuit 成本追踪',
      },
      {
        name: 'description',
        content:
          '基于 Cloudflare 的酒吧餐厅采购成本追踪、趋势分析与供应商比价平台',
      },
      {
        name: 'theme-color',
        content: '#f6f1e8',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'apple-touch-icon',
        href: '/logo192.png',
      },
    ],
  }),
  shellComponent: RootDocument,
  errorComponent: RouteErrorState,
  notFoundComponent: RouteNotFoundState,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        <AppHeader />
        <AppRuntime />
        <main className="app-shell app-main">{children}</main>
        <BottomNav />
        <Scripts />
      </body>
    </html>
  )
}

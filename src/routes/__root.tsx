import type { ReactNode } from 'react'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
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
        title: 'Bescuit CostTracker',
      },
      {
        name: 'description',
        content:
          'Cloudflare-native purchasing tracker for bar-restaurante invoice costs, trends, and supplier comparisons.',
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
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        <AppHeader />
        <AppRuntime />
        <main className="app-shell app-main">{children}</main>
        <BottomNav />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

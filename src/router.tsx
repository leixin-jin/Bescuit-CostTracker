import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import {
  RouteErrorState,
  RouteNotFoundState,
  RoutePendingState,
} from './components/AppStates'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: RoutePendingState,
    defaultErrorComponent: RouteErrorState,
    defaultNotFoundComponent: RouteNotFoundState,
    defaultOnCatch: (error, info) => {
      console.error('[router] uncaught render error', {
        error,
        componentStack: info.componentStack,
      })
    },
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

function isInstallPromptEvent(
  event: Event,
): event is BeforeInstallPromptEvent {
  return typeof (event as BeforeInstallPromptEvent).prompt === 'function'
}

export function AppRuntime() {
  const [isOffline, setIsOffline] = useState(() =>
    typeof window === 'undefined' ? false : !window.navigator.onLine,
  )
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [waitingWorker, setWaitingWorker] =
    useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    function syncConnectivityState() {
      setIsOffline(!window.navigator.onLine)
    }

    function handleOnline() {
      syncConnectivityState()
    }

    function handleOffline() {
      syncConnectivityState()
    }

    function handleForegroundSync() {
      syncConnectivityState()
    }

    syncConnectivityState()
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('focus', handleForegroundSync)
    window.addEventListener('pageshow', handleForegroundSync)
    document.addEventListener('visibilitychange', handleForegroundSync)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('focus', handleForegroundSync)
      window.removeEventListener('pageshow', handleForegroundSync)
      document.removeEventListener('visibilitychange', handleForegroundSync)
    }
  }, [])

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      if (!isInstallPromptEvent(event)) {
        return
      }

      event.preventDefault()
      setInstallEvent(event)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      )
    }
  }, [])

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
      return
    }

    let disposed = false

    function watchRegistration(registration: ServiceWorkerRegistration) {
      if (registration.waiting) {
        setWaitingWorker(registration)
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing

        if (!installing) {
          return
        }

        installing.addEventListener('statechange', () => {
          if (
            installing.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            setWaitingWorker(registration)
          }
        })
      })
    }

    function handleControllerChange() {
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      handleControllerChange,
    )

    void navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (disposed) {
          return
        }

        watchRegistration(registration)
      })
      .catch((error: unknown) => {
        console.error('[pwa] service worker registration failed', error)
      })

    return () => {
      disposed = true
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        handleControllerChange,
      )
    }
  }, [])

  async function handleInstall() {
    if (!installEvent) {
      return
    }

    await installEvent.prompt()
    const choice = await installEvent.userChoice

    if (choice.outcome === 'accepted') {
      setInstallEvent(null)
    }
  }

  function handleRefresh() {
    waitingWorker?.waiting?.postMessage({ type: 'SKIP_WAITING' })
  }

  if (!isOffline && !installEvent && !waitingWorker) {
    return null
  }

  return (
    <div className="app-shell runtime-stack" aria-live="polite">
      {isOffline ? (
        <div className="runtime-banner runtime-banner--warning">
          <div>
            <strong>当前处于离线模式</strong>
            <p className="runtime-banner__copy">
              已缓存的页面仍可访问。恢复网络连接后将自动同步新数据。
            </p>
          </div>
        </div>
      ) : null}

      {installEvent ? (
        <div className="runtime-banner">
          <div>
            <strong>安装 Bescuit 成本追踪</strong>
            <p className="runtime-banner__copy">
              将应用添加到主屏幕，加快启动速度并支持离线使用。
            </p>
          </div>
          <button type="button" className="button button-secondary" onClick={() => void handleInstall()}>
            安装应用
          </button>
        </div>
      ) : null}

      {waitingWorker ? (
        <div className="runtime-banner runtime-banner--success">
          <div>
            <strong>新版本已就绪</strong>
            <p className="runtime-banner__copy">
              刷新以启用最新的缓存资源和运行时修复。
            </p>
          </div>
          <button type="button" className="button button-secondary" onClick={handleRefresh}>
            立即刷新
          </button>
        </div>
      ) : null}
    </div>
  )
}

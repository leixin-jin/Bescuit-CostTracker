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
    typeof navigator === 'undefined' ? false : !navigator.onLine,
  )
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [waitingWorker, setWaitingWorker] =
    useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false)
    }

    function handleOffline() {
      setIsOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
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
            <strong>Offline mode is active.</strong>
            <p className="runtime-banner__copy">
              Cached pages remain available. New data sync resumes when the
              connection returns.
            </p>
          </div>
        </div>
      ) : null}

      {installEvent ? (
        <div className="runtime-banner">
          <div>
            <strong>Install Bescuit CostTracker.</strong>
            <p className="runtime-banner__copy">
              Add the app to the home screen for faster launch and offline
              fallback support.
            </p>
          </div>
          <button type="button" className="button button-secondary" onClick={() => void handleInstall()}>
            Install app
          </button>
        </div>
      ) : null}

      {waitingWorker ? (
        <div className="runtime-banner runtime-banner--success">
          <div>
            <strong>An updated release is ready.</strong>
            <p className="runtime-banner__copy">
              Refresh to activate the latest cached assets and runtime fixes.
            </p>
          </div>
          <button type="button" className="button button-secondary" onClick={handleRefresh}>
            Refresh now
          </button>
        </div>
      ) : null}
    </div>
  )
}

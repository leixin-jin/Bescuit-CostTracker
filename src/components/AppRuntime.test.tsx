import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppRuntime } from './AppRuntime'

function setOnlineStatus(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  })
}

afterEach(() => {
  setOnlineStatus(true)
})

describe('AppRuntime', () => {
  it('shows offline feedback when the browser loses connectivity', () => {
    setOnlineStatus(false)

    render(<AppRuntime />)

    expect(screen.getByText('Offline mode is active.')).toBeTruthy()
    expect(screen.getByText(/cached pages remain available/i)).toBeTruthy()
  })

  it('clears stale offline feedback when the page is shown again online', async () => {
    setOnlineStatus(false)

    render(<AppRuntime />)

    expect(screen.getByText('Offline mode is active.')).toBeTruthy()

    setOnlineStatus(true)
    window.dispatchEvent(new Event('pageshow'))

    await waitFor(() => {
      expect(screen.queryByText('Offline mode is active.')).toBeNull()
    })
  })

  it('captures the install prompt and forwards the install action', async () => {
    setOnlineStatus(true)

    const prompt = vi.fn().mockResolvedValue(undefined)
    const event = new Event('beforeinstallprompt') as Event & {
      preventDefault: () => void
      prompt: () => Promise<void>
      userChoice: Promise<{
        outcome: 'accepted' | 'dismissed'
        platform: string
      }>
    }

    event.preventDefault = vi.fn()
    event.prompt = prompt
    event.userChoice = Promise.resolve({
      outcome: 'accepted',
      platform: 'web',
    })

    render(<AppRuntime />)

    window.dispatchEvent(event)

    const installButton = await screen.findByRole('button', {
      name: 'Install app',
    })

    fireEvent.click(installButton)

    await waitFor(() => {
      expect(prompt).toHaveBeenCalledTimes(1)
    })
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
  })
})

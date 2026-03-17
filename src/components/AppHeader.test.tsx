import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AppHeader } from './AppHeader'

type MockLinkProps = {
  children?: ReactNode
  className?: string
  search?: unknown
  to: string
}

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className, to }: MockLinkProps) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}))

describe('AppHeader', () => {
  it('renders the brand, primary navigation, and current phase status', () => {
    render(<AppHeader />)

    expect(screen.getByText('Bescuit CostTracker')).toBeTruthy()
    expect(
      screen.getByRole('heading', {
        name: 'Bar purchasing control from invoice to insight',
      }),
    ).toBeTruthy()
    expect(screen.getByText('Phase 1 verified')).toBeTruthy()

    const navigation = screen.getByRole('navigation', { name: 'Primary' })
    const links = within(navigation).getAllByRole('link')

    expect(links).toHaveLength(6)
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/',
      '/upload',
      '/invoices',
      '/analytics',
      '/compare',
      '/suppliers',
    ])
  })
})

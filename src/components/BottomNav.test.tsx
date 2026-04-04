import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { BottomNav } from './BottomNav'

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

describe('BottomNav', () => {
  it('renders all route shortcuts for the mobile shell', () => {
    render(<BottomNav />)

    const navigation = screen.getByRole('navigation', {
      name: '底部导航',
    })
    const links = within(navigation).getAllByRole('link')

    expect(links).toHaveLength(6)
    expect(links.map((link) => link.textContent)).toEqual([
      '首页',
      '上传',
      '发票',
      '分析',
      '比价',
      '供应商',
    ])
  })
})

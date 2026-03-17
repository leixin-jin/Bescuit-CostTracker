import { describe, expect, it } from 'vitest'
import { formatCurrency, formatShortDate } from './utils'

describe('formatCurrency', () => {
  it('formats euro amounts for the Spanish locale', () => {
    const formatted = formatCurrency(12.5)

    expect(formatted).toMatch(/12,50/u)
    expect(formatted).toContain('€')
  })

  it('keeps two fraction digits for zero values', () => {
    const formatted = formatCurrency(0)

    expect(formatted).toMatch(/0,00/u)
    expect(formatted).toContain('€')
  })
})

describe('formatShortDate', () => {
  it('formats ISO dates into a short Spanish label', () => {
    expect(formatShortDate('2026-03-16')).toBe('16 mar')
  })

  it('handles end-of-year dates without losing the month label', () => {
    expect(formatShortDate('2026-12-01')).toBe('01 dic')
  })
})

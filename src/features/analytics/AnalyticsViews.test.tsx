import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  AnalyticsPageContent,
  ComparePageContent,
  DashboardOverview,
} from './AnalyticsViews'

describe('AnalyticsViews', () => {
  it('renders dashboard empty-state copy when no invoices exist', () => {
    render(
      <DashboardOverview
        metrics={{
          totalSpend: 0,
          activeSuppliers: 0,
          recentInvoiceCount: 0,
          recentCategoryCount: 0,
          totalInvoiceCount: 0,
          latestInvoiceDate: null,
          recentWindowDays: 30,
        }}
      />,
    )

    expect(screen.getByText('No invoices imported yet.')).toBeTruthy()
    expect(screen.getByText('Supplier count will appear after the first import.')).toBeTruthy()
  })

  it('shows a unit conflict warning on analytics pages until the user picks a unit', () => {
    const onSelectUnit = vi.fn()

    render(
      <AnalyticsPageContent
        data={{
          suggestions: [],
          selectedProduct: {
            productKey: 'tomate pera',
            displayName: 'Tomate pera',
            totalSamples: 3,
            lastPurchasedAt: '2026-03-20',
            unitOptions: [
              { unit: 'kg', sampleCount: 2, lastPurchasedAt: '2026-03-20' },
              { unit: 'ud', sampleCount: 1, lastPurchasedAt: '2026-03-20' },
            ],
            selectedUnit: null,
            conflictWarning:
              'This product has samples with multiple units. Select a unit before reading quantity trends.',
          },
          trend: [],
        }}
        query="Tomate pera"
        months="6"
        onQueryChange={() => undefined}
        onMonthsChange={() => undefined}
        onSelectProduct={() => undefined}
        onSelectUnit={onSelectUnit}
      />,
    )

    expect(screen.getByText(/multiple units/i)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /kg · 2/i }))

    expect(onSelectUnit).toHaveBeenCalledWith('kg')
  })

  it('renders the compare empty state when no rows match the filter', () => {
    render(
      <ComparePageContent
        data={{
          suggestions: [],
          rows: [],
          page: 1,
          pageSize: 8,
          totalRows: 0,
          totalPages: 1,
        }}
        query=""
        sort="best-price"
        onQueryChange={() => undefined}
        onSortChange={() => undefined}
        onSelectProduct={() => undefined}
        onPageChange={() => undefined}
      />,
    )

    expect(screen.getByText('No comparison rows match the filter')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Previous' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'Next' }).hasAttribute('disabled')).toBe(true)
  })
})

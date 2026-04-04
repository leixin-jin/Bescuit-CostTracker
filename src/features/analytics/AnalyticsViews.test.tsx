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

    expect(screen.getByText('尚未导入发票。')).toBeTruthy()
    expect(screen.getByText('第一次导入后将显示供应商数量。')).toBeTruthy()
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
              '该商品在样本中包含多个单位。选择一个单位后再查看数量趋势。',
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

    expect(screen.getByText(/多个单位/i)).toBeTruthy()

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

    expect(screen.getByText('没有找到匹配的比价数据')).toBeTruthy()
    expect(screen.getByRole('button', { name: '上一页' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: '下一页' }).hasAttribute('disabled')).toBe(true)
  })
})

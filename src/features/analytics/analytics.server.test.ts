import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { env } from '../../test/cloudflare-workers'
import { TestD1Database } from '../../test/d1'
import type { InvoiceDraft, InvoiceItemDraft } from '../invoices/schema'
import { saveImportedInvoice } from '../invoices/invoice.server'
import {
  explainAnalyticsQueries,
  getAnalyticsPageData,
  getComparePageData,
  getDashboardMetrics,
  listProductSuggestions,
} from './analytics.server'
import { normalizeProductName } from './product'

function isoDate(daysOffset = 0) {
  const value = new Date()
  value.setUTCDate(value.getUTCDate() + daysOffset)
  return value.toISOString().slice(0, 10)
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

function createItemDraft(
  overrides: Partial<InvoiceItemDraft> = {},
): InvoiceItemDraft {
  const quantity = overrides.quantity ?? 1
  const unitPrice = overrides.unitPrice ?? 1
  const taxRate = overrides.taxRate ?? 0.1

  return {
    id: overrides.id ?? crypto.randomUUID(),
    productName: overrides.productName ?? 'Producto base',
    categoryName: overrides.categoryName ?? 'Otros',
    quantity,
    unit: overrides.unit ?? 'ud',
    unitPrice,
    taxRate,
    totalPrice:
      overrides.totalPrice ??
      roundCurrency(quantity * unitPrice * (1 + taxRate)),
    itemDate: overrides.itemDate ?? isoDate(-2),
  }
}

function createInvoiceDraft(
  overrides: Partial<InvoiceDraft> = {},
): InvoiceDraft {
  const items = overrides.items ?? [createItemDraft()]

  return {
    supplierName: overrides.supplierName ?? 'Makro',
    supplierContact: overrides.supplierContact ?? '',
    supplierNotes: overrides.supplierNotes ?? '',
    invoiceNumber: overrides.invoiceNumber ?? `INV-${crypto.randomUUID()}`,
    invoiceDate: overrides.invoiceDate ?? items[0].itemDate,
    totalAmount:
      overrides.totalAmount ??
      roundCurrency(items.reduce((sum, item) => sum + item.totalPrice, 0)),
    status: overrides.status ?? 'verified',
    notes: overrides.notes ?? '',
    items,
  }
}

describe('analytics.server', () => {
  let testDb: TestD1Database | null = null

  beforeEach(() => {
    testDb = new TestD1Database()
    env.DB = testDb as unknown as D1Database
  })

  afterEach(() => {
    env.DB = undefined
    testDb?.close()
    testDb = null
  })

  it('computes dashboard metrics and product suggestions from imported invoice items', async () => {
    await saveImportedInvoice({
      draft: createInvoiceDraft({
        supplierName: 'Makro',
        invoiceNumber: 'INV-001',
        items: [
          createItemDraft({
            productName: 'Tomate pera',
            categoryName: 'Verdura',
            quantity: 12,
            unit: 'kg',
            unitPrice: 2.4,
            itemDate: isoDate(-4),
          }),
          createItemDraft({
            productName: 'Aceite de oliva 5L',
            categoryName: 'Aceite',
            quantity: 3,
            unit: 'ud',
            unitPrice: 8.8,
            itemDate: isoDate(-4),
          }),
        ],
      }),
      rawJson: '{"supplier":"Makro"}',
    })

    await saveImportedInvoice({
      draft: createInvoiceDraft({
        supplierName: 'Mercabarna',
        invoiceNumber: 'INV-002',
        items: [
          createItemDraft({
            productName: 'Tomate  pera',
            categoryName: 'Verdura',
            quantity: 8,
            unit: 'kg',
            unitPrice: 2.2,
            itemDate: isoDate(-9),
          }),
        ],
      }),
      rawJson: '{"supplier":"Mercabarna"}',
    })

    const metrics = await getDashboardMetrics()
    const suggestions = await listProductSuggestions('tom')

    expect(metrics).toMatchObject({
      activeSuppliers: 2,
      recentInvoiceCount: 2,
      recentCategoryCount: 2,
      totalInvoiceCount: 2,
    })
    expect(metrics.totalSpend).toBeGreaterThan(0)
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]).toMatchObject({
      productKey: normalizeProductName('Tomate pera'),
      sampleCount: 2,
      variantCount: 1,
    })
  })

  it('blocks mixed-unit trends until a unit is selected and then aggregates monthly values', async () => {
    const productName = 'Tomate pera'
    const productKey = normalizeProductName(productName)

    await saveImportedInvoice({
      draft: createInvoiceDraft({
        supplierName: 'Makro',
        invoiceNumber: 'INV-101',
        items: [
          createItemDraft({
            productName,
            categoryName: 'Verdura',
            quantity: 10,
            unit: 'kg',
            unitPrice: 2.5,
            itemDate: isoDate(-35),
          }),
        ],
      }),
      rawJson: '{"supplier":"Makro"}',
    })

    await saveImportedInvoice({
      draft: createInvoiceDraft({
        supplierName: 'Makro Fresh',
        invoiceNumber: 'INV-102',
        items: [
          createItemDraft({
            productName,
            categoryName: 'Verdura',
            quantity: 12,
            unit: 'kg',
            unitPrice: 2.1,
            itemDate: isoDate(-5),
          }),
          createItemDraft({
            productName,
            categoryName: 'Verdura',
            quantity: 24,
            unit: 'ud',
            unitPrice: 0.4,
            itemDate: isoDate(-5),
          }),
        ],
      }),
      rawJson: '{"supplier":"Makro Fresh"}',
    })

    const unresolved = await getAnalyticsPageData({
      query: productName,
      product: productKey,
      unit: '',
      months: '6',
    })

    expect(unresolved.selectedProduct?.selectedUnit).toBeNull()
    expect(unresolved.selectedProduct?.conflictWarning).toContain('multiple units')
    expect(unresolved.trend).toEqual([])

    const resolved = await getAnalyticsPageData({
      query: productName,
      product: productKey,
      unit: 'kg',
      months: '6',
    })

    expect(resolved.selectedProduct?.selectedUnit).toBe('kg')
    expect(resolved.trend).toHaveLength(2)
    expect(resolved.trend.map((point) => point.unit)).toEqual(['kg', 'kg'])
    expect(resolved.trend.reduce((sum, point) => sum + point.sampleCount, 0)).toBe(2)
  })

  it('keeps only each supplier latest sample and ranks current comparison offers', async () => {
    const productName = 'Aceite de oliva 5L'
    const productKey = normalizeProductName(productName)

    await saveImportedInvoice({
      draft: createInvoiceDraft({
        supplierName: 'Makro',
        invoiceNumber: 'INV-201',
        items: [
          createItemDraft({
            productName,
            categoryName: 'Aceite',
            quantity: 3,
            unit: 'ud',
            unitPrice: 8.1,
            itemDate: isoDate(-12),
          }),
        ],
      }),
      rawJson: '{"supplier":"Makro"}',
    })

    await saveImportedInvoice({
      draft: createInvoiceDraft({
        supplierName: 'Makro',
        invoiceNumber: 'INV-202',
        items: [
          createItemDraft({
            productName,
            categoryName: 'Aceite',
            quantity: 3,
            unit: 'ud',
            unitPrice: 8.7,
            itemDate: isoDate(-3),
          }),
        ],
      }),
      rawJson: '{"supplier":"Makro"}',
    })

    await saveImportedInvoice({
      draft: createInvoiceDraft({
        supplierName: 'Mercabarna',
        invoiceNumber: 'INV-203',
        items: [
          createItemDraft({
            productName,
            categoryName: 'Aceite',
            quantity: 3,
            unit: 'ud',
            unitPrice: 8.4,
            itemDate: isoDate(-2),
          }),
        ],
      }),
      rawJson: '{"supplier":"Mercabarna"}',
    })

    const comparison = await getComparePageData({
      query: productName,
      product: productKey,
      sort: 'best-price',
      page: 1,
    })

    expect(comparison.rows).toHaveLength(1)
    expect(comparison.rows[0]).toMatchObject({
      productKey,
      supplierCount: 2,
      bestPrice: 8.4,
      highestPrice: 8.7,
    })
    expect(comparison.rows[0]?.offers.map((offer) => [offer.supplierName, offer.unitPrice, offer.priceRank])).toEqual([
      ['Mercabarna', 8.4, 1],
      ['Makro', 8.7, 2],
    ])
  })

  it('exposes explain plans that reference the analytics indexes', async () => {
    const plans = await explainAnalyticsQueries()

    expect(plans.search.some((detail) => detail.includes('idx_items_product_normalized'))).toBe(true)
    expect(plans.trend.some((detail) => detail.includes('idx_items_product_unit_date'))).toBe(true)
    expect(
      plans.compare.some((detail) =>
        detail.includes('idx_items_product_supplier_date'),
      ),
    ).toBe(true)
  })
})

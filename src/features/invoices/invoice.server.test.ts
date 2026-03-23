import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { getDb } from '../../db'
import {
  invoiceItems,
  invoices,
  suppliers,
} from '../../db/schema'
import { env } from '../../test/cloudflare-workers'
import { TestD1Database } from '../../test/d1'
import type { InvoiceDraft, InvoiceItemDraft } from './schema'
import {
  deleteInvoiceById,
  getInvoiceDetail,
  listInvoices,
  listSupplierDirectory,
  saveImportedInvoice,
  updateInvoiceById,
} from './invoice.server'

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

function createItemDraft(
  overrides: Partial<InvoiceItemDraft> = {},
): InvoiceItemDraft {
  const quantity = overrides.quantity ?? 2
  const unitPrice = overrides.unitPrice ?? 8
  const taxRate = overrides.taxRate ?? 0.1

  return {
    id: overrides.id ?? crypto.randomUUID(),
    productName: overrides.productName ?? 'Aceite de oliva virgen extra',
    categoryName: overrides.categoryName ?? 'Aceite',
    quantity,
    unit: overrides.unit ?? 'ud',
    unitPrice,
    taxRate,
    totalPrice:
      overrides.totalPrice ??
      roundCurrency(quantity * unitPrice * (1 + taxRate)),
    itemDate: overrides.itemDate ?? '2026-03-20',
  }
}

function createInvoiceDraft(
  overrides: Partial<InvoiceDraft> = {},
): InvoiceDraft {
  const items = overrides.items ?? [createItemDraft()]

  return {
    supplierName: overrides.supplierName ?? 'Makro',
    supplierContact: overrides.supplierContact ?? 'compras@makro.es',
    supplierNotes: overrides.supplierNotes ?? 'Pago a 30 dias',
    invoiceNumber: overrides.invoiceNumber ?? 'ALB-2026-0001',
    invoiceDate: overrides.invoiceDate ?? '2026-03-20',
    totalAmount:
      overrides.totalAmount ??
      roundCurrency(items.reduce((sum, item) => sum + item.totalPrice, 0)),
    status: overrides.status ?? 'draft',
    notes: overrides.notes ?? 'Recepcion de cocina',
    items,
  }
}

describe('invoice.server', () => {
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

  it('saves imported invoices with raw JSON and auto-creates the supplier record', async () => {
    const rawJson = JSON.stringify({
      proveedor: 'Makro',
      fecha: '2026-03-20',
    })
    const draft = createInvoiceDraft({
      items: [
        createItemDraft(),
        createItemDraft({
          productName: 'Pollo entero',
          categoryName: 'Carne',
          quantity: 5,
          unit: 'kg',
          unitPrice: 4.2,
          totalPrice: 23.1,
        }),
      ],
      totalAmount: 40.7,
    })

    const result = await saveImportedInvoice({ draft, rawJson })
    const db = getDb(env.DB!)

    const supplierRecord = await db.select().from(suppliers).get()
    const invoiceRecord = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, result.invoiceId))
      .get()
    const itemRecords = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, result.invoiceId))

    expect(result.warnings).toEqual([])
    expect(supplierRecord).toMatchObject({
      name: 'Makro',
      contact: 'compras@makro.es',
      notes: 'Pago a 30 dias',
    })
    expect(invoiceRecord).toMatchObject({
      id: result.invoiceId,
      invoiceNumber: 'ALB-2026-0001',
      rawJson,
      status: 'draft',
      totalAmount: 40.7,
    })
    expect(itemRecords).toHaveLength(2)
    expect(itemRecords.map((item) => item.productName)).toEqual([
      'Aceite de oliva virgen extra',
      'Pollo entero',
    ])
    expect(new Set(itemRecords.map((item) => item.supplierId))).toEqual(
      new Set([supplierRecord?.id]),
    )
  })

  it('reuses existing suppliers and supports invoice search and status filters', async () => {
    await saveImportedInvoice({
      draft: createInvoiceDraft({
        invoiceNumber: 'ALB-2026-0101',
        invoiceDate: '2026-03-19',
      }),
      rawJson: '{"source":"draft"}',
    })

    await saveImportedInvoice({
      draft: createInvoiceDraft({
        invoiceNumber: 'FAC-2026-0202',
        invoiceDate: '2026-03-21',
        status: 'verified',
        items: [
          createItemDraft({
            productName: 'Vino tinto reserva',
            categoryName: 'Bebida',
            quantity: 12,
            unitPrice: 6,
            totalPrice: 79.2,
          }),
        ],
        totalAmount: 79.2,
      }),
      rawJson: '{"source":"verified"}',
    })

    const db = getDb(env.DB!)
    const supplierRecords = await db.select().from(suppliers)
    const verifiedMatches = await listInvoices({
      query: 'vino',
      status: 'verified',
    })
    const draftMatches = await listInvoices({
      query: '',
      status: 'draft',
    })
    const allInvoices = await listInvoices({
      query: '',
      status: 'all',
    })

    expect(supplierRecords).toHaveLength(1)
    expect(verifiedMatches).toHaveLength(1)
    expect(verifiedMatches[0]).toMatchObject({
      invoiceNumber: 'FAC-2026-0202',
      supplierName: 'Makro',
      status: 'verified',
    })
    expect(draftMatches).toHaveLength(1)
    expect(draftMatches[0]?.invoiceNumber).toBe('ALB-2026-0101')
    expect(allInvoices.map((invoice) => invoice.invoiceNumber)).toEqual([
      'FAC-2026-0202',
      'ALB-2026-0101',
    ])
  })

  it('updates invoice records, rewrites line items, and preserves the stored raw JSON', async () => {
    const savedInvoice = await saveImportedInvoice({
      draft: createInvoiceDraft(),
      rawJson: '{"source":"original"}',
    })

    await updateInvoiceById({
      invoiceId: savedInvoice.invoiceId,
      draft: createInvoiceDraft({
        supplierName: 'Makro Fresh',
        supplierContact: 'fresh@makro.es',
        supplierNotes: 'Urgente por la manana',
        invoiceNumber: 'ALB-2026-0001-REV',
        status: 'verified',
        items: [
          createItemDraft({
            productName: 'Agua mineral',
            categoryName: 'Bebida',
            quantity: 6,
            unitPrice: 1.5,
            totalPrice: 9.9,
          }),
          createItemDraft({
            productName: 'Pan rustico',
            categoryName: 'Panadería',
            quantity: 8,
            unitPrice: 1.2,
            totalPrice: 10.56,
          }),
        ],
        totalAmount: 20.46,
      }),
    })

    const detail = await getInvoiceDetail(savedInvoice.invoiceId)
    const db = getDb(env.DB!)
    const itemRecords = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, savedInvoice.invoiceId))
    const invoiceRecord = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, savedInvoice.invoiceId))
      .get()
    const supplierRecord = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.name, 'Makro Fresh'))
      .get()

    expect(invoiceRecord).toMatchObject({
      supplierId: expect.any(String),
      invoiceNumber: 'ALB-2026-0001-REV',
      status: 'verified',
      rawJson: '{"source":"original"}',
      totalAmount: 20.46,
    })
    expect(supplierRecord).toMatchObject({
      name: 'Makro Fresh',
      contact: 'fresh@makro.es',
      notes: 'Urgente por la manana',
    })
    expect(itemRecords).toHaveLength(2)
    expect(detail).toMatchObject({
      id: savedInvoice.invoiceId,
      rawJson: '{"source":"original"}',
      draft: expect.objectContaining({
        supplierName: 'Makro Fresh',
        supplierContact: 'fresh@makro.es',
        supplierNotes: 'Urgente por la manana',
        invoiceNumber: 'ALB-2026-0001-REV',
        status: 'verified',
        totalAmount: 20.46,
      }),
    })
    expect(detail?.draft.items.map((item) => item.productName)).toEqual([
      'Agua mineral',
      'Pan rustico',
    ])
  })

  it('deletes invoices with cascading line cleanup and refreshes supplier summaries', async () => {
    const savedInvoice = await saveImportedInvoice({
      draft: createInvoiceDraft({
        supplierName: 'Frutas Sol',
        supplierContact: 'pedidos@frutassol.es',
        invoiceNumber: 'FS-2026-003',
        items: [
          createItemDraft({
            productName: 'Naranja valenciana',
            categoryName: 'Fruta',
            quantity: 10,
            unit: 'kg',
            unitPrice: 2.5,
            totalPrice: 27.5,
          }),
        ],
        totalAmount: 27.5,
      }),
      rawJson: '{"source":"delete-me"}',
    })

    const beforeDelete = await listSupplierDirectory()
    await deleteInvoiceById(savedInvoice.invoiceId)

    const db = getDb(env.DB!)
    const deletedInvoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, savedInvoice.invoiceId))
      .get()
    const orphanedItems = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, savedInvoice.invoiceId))
    const afterDelete = await listSupplierDirectory()

    expect(beforeDelete).toEqual([
      expect.objectContaining({
        name: 'Frutas Sol',
        invoiceCount: 1,
        totalAmount: 27.5,
        lastPurchaseDate: '2026-03-20',
      }),
    ])
    expect(deletedInvoice).toBeUndefined()
    expect(orphanedItems).toEqual([])
    expect(afterDelete).toEqual([
      expect.objectContaining({
        name: 'Frutas Sol',
        contact: 'pedidos@frutassol.es',
        invoiceCount: 0,
        totalAmount: 0,
        lastPurchaseDate: null,
      }),
    ])
  })
})

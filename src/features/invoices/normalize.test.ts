import { describe, expect, it } from 'vitest'
import {
  getFallbackCategories,
  parseImportedInvoiceText,
  sanitizeInvoiceDraft,
} from './normalize'
import type { InvoiceDraft } from './schema'

const categories = getFallbackCategories()

describe('invoice normalization', () => {
  it('parses spanish invoice payloads into the shared draft contract', () => {
    const result = parseImportedInvoiceText(
      JSON.stringify({
        fecha: '16/03/2026',
        proveedor: 'Makro',
        num_albaran: 'ALB-2026-0001',
        items: [
          {
            producto: 'Pollo entero',
            categoria: 'Polleria',
            cantidad: '10',
            unidad: 'kg',
            precio_unitario: '3,20',
            iva: '10%',
            precio_total: '35,20',
          },
        ],
        total_factura: '35,20',
      }),
      categories,
    )

    expect(result.success).toBe(true)

    if (!result.success) {
      return
    }

    expect(result.draft.invoiceDate).toBe('2026-03-16')
    expect(result.draft.supplierName).toBe('Makro')
    expect(result.draft.items[0]).toMatchObject({
      productName: 'Pollo entero',
      categoryName: 'Carne',
      quantity: 10,
      unit: 'kg',
      unitPrice: 3.2,
      taxRate: 0.1,
    })
    expect(result.warnings).toContain(
      '行项 "Pollo entero" 已自动映射到分类 "Carne"。',
    )
  })

  it('sanitizes edited drafts and warns when totals diverge from line totals', () => {
    const draft: InvoiceDraft = {
      supplierName: 'Limpiezas Costa',
      supplierContact: '',
      supplierNotes: '',
      invoiceNumber: 'LC-12',
      invoiceDate: '2026-03-17',
      totalAmount: 99,
      status: 'draft',
      notes: '',
      items: [
        {
          id: 'line-1',
          productName: 'Detergente cocina',
          categoryName: '',
          quantity: 2,
          unit: 'uds',
          unitPrice: 4.5,
          taxRate: 0.21,
          totalPrice: 10.89,
          itemDate: '2026-03-17',
        },
      ],
    }

    const result = sanitizeInvoiceDraft(draft, categories)

    expect(result.success).toBe(true)

    if (!result.success) {
      return
    }

    expect(result.draft.items[0]).toMatchObject({
      categoryName: 'Limpieza',
      unit: 'ud',
      totalPrice: 10.89,
    })
    expect(result.warnings[0]).toContain('申报总额')
  })

  it('reports invalid JSON before trying to normalize fields', () => {
    const result = parseImportedInvoiceText('{invalid', categories)

    expect(result.success).toBe(false)

    if (result.success) {
      return
    }

    expect(result.errors).toEqual([
      {
        path: 'json',
        message: 'JSON 格式无效。请修正语法后重新解析。',
      },
    ])
  })
})

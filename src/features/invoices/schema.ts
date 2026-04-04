import { z } from 'zod'

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

const requiredText = z.string().trim().min(1)
const optionalText = z.string().trim().optional().catch(undefined)
const optionalLongText = z.string().trim().max(2_000).optional().catch(undefined)
const nonNegativeNumber = z.number().finite().min(0)

export const invoiceStatusSchema = z.enum(['draft', 'verified'])

export const categoryOptionSchema = z.object({
  id: requiredText,
  name: requiredText,
  icon: z.string().trim().nullable().optional().catch(null),
  sortOrder: z.number().int(),
})

export const invoiceSearchSchema = z.object({
  query: z
    .preprocess(
      (value) => (typeof value === 'string' ? value : ''),
      z.string(),
    )
    .catch(''),
  status: z
    .preprocess(
      (value) => (typeof value === 'string' ? value : 'all'),
      z.enum(['all', 'draft', 'verified']),
    )
    .catch('all'),
})

export const invoiceItemDraftSchema = z.object({
  id: z.string().trim().optional(),
  productName: requiredText,
  categoryName: requiredText,
  quantity: nonNegativeNumber.positive(),
  unit: requiredText,
  unitPrice: nonNegativeNumber,
  taxRate: z.number().finite().min(0).max(1),
  totalPrice: nonNegativeNumber,
  itemDate: z
    .string()
    .trim()
    .regex(isoDatePattern, 'Use YYYY-MM-DD format'),
})

export const invoiceDraftSchema = z.object({
  supplierName: requiredText,
  supplierContact: optionalText.default(''),
  supplierNotes: optionalLongText.default(''),
  invoiceNumber: optionalText.default(''),
  invoiceDate: z
    .string()
    .trim()
    .regex(isoDatePattern, 'Use YYYY-MM-DD format'),
  totalAmount: nonNegativeNumber,
  status: invoiceStatusSchema.default('draft'),
  notes: optionalLongText.default(''),
  items: z.array(invoiceItemDraftSchema).min(1, 'Add at least one invoice line'),
})

export const saveImportedInvoiceInputSchema = z.object({
  draft: invoiceDraftSchema,
  rawJson: z.string().trim().min(1),
})

export const updateInvoiceInputSchema = z.object({
  invoiceId: requiredText,
  draft: invoiceDraftSchema,
})

export const deleteInvoiceInputSchema = z.object({
  invoiceId: requiredText,
})

export const invoiceIdInputSchema = z.object({
  invoiceId: requiredText,
})

export const supplierMutationSchema = z.object({
  id: z.string().trim().optional(),
  name: requiredText,
  contact: optionalText.default(''),
  notes: optionalLongText.default(''),
})

export type CategoryOption = z.infer<typeof categoryOptionSchema>
export type InvoiceSearch = z.infer<typeof invoiceSearchSchema>
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>
export type InvoiceItemDraft = z.infer<typeof invoiceItemDraftSchema>
export type InvoiceDraft = z.infer<typeof invoiceDraftSchema>
export type SaveImportedInvoiceInput = z.infer<
  typeof saveImportedInvoiceInputSchema
>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceInputSchema>
export type SupplierMutationInput = z.infer<typeof supplierMutationSchema>

export const defaultInvoiceSearch: InvoiceSearch = {
  query: '',
  status: 'all',
}

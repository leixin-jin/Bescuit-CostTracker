import { createServerFn } from '@tanstack/react-start'
import {
  deleteInvoiceInputSchema,
  invoiceIdInputSchema,
  invoiceSearchSchema,
  saveImportedInvoiceInputSchema,
  supplierMutationSchema,
  updateInvoiceInputSchema,
} from './schema'
import {
  deleteInvoiceById,
  getInvoiceDetail,
  listCategoryCatalog,
  listInvoices,
  listSupplierDirectory,
  saveImportedInvoice,
  updateInvoiceById,
  upsertSupplierDetails,
} from './invoice.server'

export const getCategoryCatalog = createServerFn({ method: 'GET' }).handler(
  async () => listCategoryCatalog(),
)

export const saveImportedInvoiceAction = createServerFn({ method: 'POST' })
  .inputValidator(saveImportedInvoiceInputSchema)
  .handler(async ({ data }) => saveImportedInvoice(data))

export const listInvoicesQuery = createServerFn({ method: 'GET' })
  .inputValidator(invoiceSearchSchema)
  .handler(async ({ data }) => listInvoices(data))

export const getInvoiceDetailQuery = createServerFn({ method: 'GET' })
  .inputValidator(invoiceIdInputSchema)
  .handler(async ({ data }) => getInvoiceDetail(data.invoiceId))

export const updateInvoiceAction = createServerFn({ method: 'POST' })
  .inputValidator(updateInvoiceInputSchema)
  .handler(async ({ data }) => updateInvoiceById(data))

export const deleteInvoiceAction = createServerFn({ method: 'POST' })
  .inputValidator(deleteInvoiceInputSchema)
  .handler(async ({ data }) => {
    await deleteInvoiceById(data.invoiceId)
    return { success: true }
  })

export const listSuppliersQuery = createServerFn({ method: 'GET' }).handler(
  async () => listSupplierDirectory(),
)

export const upsertSupplierAction = createServerFn({ method: 'POST' })
  .inputValidator(supplierMutationSchema)
  .handler(async ({ data }) => ({
    supplierId: await upsertSupplierDetails(data),
  }))

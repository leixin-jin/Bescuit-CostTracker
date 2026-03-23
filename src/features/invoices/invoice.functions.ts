import { createServerFn } from '@tanstack/react-start'
import { observeServerOperation } from '../../lib/observability'
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
  async () =>
    observeServerOperation('catalog.list', {}, async () => listCategoryCatalog()),
)

export const saveImportedInvoiceAction = createServerFn({ method: 'POST' })
  .inputValidator(saveImportedInvoiceInputSchema)
  .handler(async ({ data }) =>
    observeServerOperation(
      'invoice.save',
      {
        supplierName: data.draft.supplierName,
        itemCount: data.draft.items.length,
      },
      async () => saveImportedInvoice(data),
    ),
  )

export const listInvoicesQuery = createServerFn({ method: 'GET' })
  .inputValidator(invoiceSearchSchema)
  .handler(async ({ data }) =>
    observeServerOperation('invoice.list', data, async () => listInvoices(data)),
  )

export const getInvoiceDetailQuery = createServerFn({ method: 'GET' })
  .inputValidator(invoiceIdInputSchema)
  .handler(async ({ data }) =>
    observeServerOperation(
      'invoice.detail',
      { invoiceId: data.invoiceId },
      async () => getInvoiceDetail(data.invoiceId),
    ),
  )

export const updateInvoiceAction = createServerFn({ method: 'POST' })
  .inputValidator(updateInvoiceInputSchema)
  .handler(async ({ data }) =>
    observeServerOperation(
      'invoice.update',
      {
        invoiceId: data.invoiceId,
        supplierName: data.draft.supplierName,
        itemCount: data.draft.items.length,
      },
      async () => updateInvoiceById(data),
    ),
  )

export const deleteInvoiceAction = createServerFn({ method: 'POST' })
  .inputValidator(deleteInvoiceInputSchema)
  .handler(async ({ data }) =>
    observeServerOperation(
      'invoice.delete',
      { invoiceId: data.invoiceId },
      async () => {
        await deleteInvoiceById(data.invoiceId)
        return { success: true }
      },
    ),
  )

export const listSuppliersQuery = createServerFn({ method: 'GET' }).handler(
  async () =>
    observeServerOperation('supplier.list', {}, async () => listSupplierDirectory()),
)

export const upsertSupplierAction = createServerFn({ method: 'POST' })
  .inputValidator(supplierMutationSchema)
  .handler(async ({ data }) =>
    observeServerOperation(
      'supplier.upsert',
      {
        supplierId: data.id ?? null,
        supplierName: data.name,
      },
      async () => ({
        supplierId: await upsertSupplierDetails(data),
      }),
    ),
  )

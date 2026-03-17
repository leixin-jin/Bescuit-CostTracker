import '@tanstack/react-start/server-only'
import { env } from 'cloudflare:workers'
import {
  and,
  asc,
  desc,
  eq,
  ne,
  sql,
} from 'drizzle-orm'
import { getDb } from '../../db'
import {
  categories,
  invoiceItems,
  invoices,
  suppliers,
} from '../../db/schema'
import { sanitizeInvoiceDraft } from './normalize'
import type {
  CategoryOption,
  InvoiceDraft,
  InvoiceSearch,
  SupplierMutationInput,
} from './schema'

export type InvoiceListEntry = {
  id: string
  supplierName: string
  invoiceNumber: string
  invoiceDate: string
  totalAmount: number
  itemCount: number
  status: string
}

export type InvoiceDetailRecord = {
  id: string
  createdAt: string
  updatedAt: string
  rawJson: string | null
  draft: InvoiceDraft
}

export type SupplierDirectoryEntry = {
  id: string
  name: string
  contact: string
  notes: string
  invoiceCount: number
  totalAmount: number
  lastPurchaseDate: string | null
}

function db() {
  return getDb(env.DB)
}

export async function listCategoryCatalog(): Promise<CategoryOption[]> {
  return db()
    .select({
      id: categories.id,
      name: categories.name,
      icon: categories.icon,
      sortOrder: categories.sortOrder,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name))
}

export async function saveImportedInvoice(input: {
  draft: InvoiceDraft
  rawJson: string
}) {
  const categoryCatalog = await listCategoryCatalog()
  const sanitized = sanitizeInvoiceDraft(input.draft, categoryCatalog)

  if (!sanitized.success) {
    throw new Error(sanitized.errors.map((issue) => issue.message).join(' '))
  }

  const connection = db()
  const supplierIdSql = buildSupplierIdSql(sanitized.draft.supplierName)
  const invoiceId = crypto.randomUUID()

  await connection.batch([
    buildSupplierUpsertStatement(connection, {
      name: sanitized.draft.supplierName,
      contact: sanitized.draft.supplierContact,
      notes: sanitized.draft.supplierNotes,
    }),
    connection.insert(invoices).values({
      id: invoiceId,
      supplierId: supplierIdSql,
      invoiceNumber: sanitized.draft.invoiceNumber || null,
      invoiceDate: sanitized.draft.invoiceDate,
      totalAmount: sanitized.draft.totalAmount,
      status: sanitized.draft.status,
      notes: sanitized.draft.notes || null,
      rawJson: input.rawJson,
    }),
    ...sanitized.draft.items.map((item) =>
      connection.insert(invoiceItems).values({
        id: crypto.randomUUID(),
        invoiceId,
        supplierId: supplierIdSql,
        categoryId: resolveCategoryId(item.categoryName, categoryCatalog),
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        totalPrice: item.totalPrice,
        itemDate: item.itemDate,
      }),
    ),
  ])

  return {
    invoiceId,
    warnings: sanitized.warnings,
  }
}

export async function listInvoices(
  filters: InvoiceSearch,
): Promise<InvoiceListEntry[]> {
  const searchTerm = filters.query.trim().toLowerCase()
  const searchPattern = `%${searchTerm}%`
  const conditions = []

  if (filters.status !== 'all') {
    conditions.push(eq(invoices.status, filters.status))
  }

  if (searchTerm) {
    conditions.push(
      sql<boolean>`(
        lower(${suppliers.name}) like ${searchPattern}
        or lower(coalesce(${invoices.invoiceNumber}, '')) like ${searchPattern}
        or lower(coalesce(${invoiceItems.productName}, '')) like ${searchPattern}
      )`,
    )
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined

  const rows = await db()
    .select({
      id: invoices.id,
      supplierName: suppliers.name,
      invoiceNumber: sql<string>`coalesce(${invoices.invoiceNumber}, '')`,
      invoiceDate: invoices.invoiceDate,
      totalAmount: sql<number>`coalesce(${invoices.totalAmount}, 0)`,
      itemCount: sql<number>`count(distinct ${invoiceItems.id})`,
      status: invoices.status,
    })
    .from(invoices)
    .innerJoin(suppliers, eq(invoices.supplierId, suppliers.id))
    .leftJoin(invoiceItems, eq(invoiceItems.invoiceId, invoices.id))
    .where(whereClause)
    .groupBy(
      invoices.id,
      suppliers.name,
      invoices.invoiceNumber,
      invoices.invoiceDate,
      invoices.totalAmount,
      invoices.status,
      invoices.createdAt,
    )
    .orderBy(desc(invoices.invoiceDate), desc(invoices.createdAt))

  return rows.map((row) => ({
    ...row,
    totalAmount: Number(row.totalAmount),
    itemCount: Number(row.itemCount),
  }))
}

export async function getInvoiceDetail(
  invoiceId: string,
): Promise<InvoiceDetailRecord | null> {
  const invoiceRecord = await db()
    .select({
      id: invoices.id,
      supplierName: suppliers.name,
      supplierContact: suppliers.contact,
      supplierNotes: suppliers.notes,
      invoiceNumber: invoices.invoiceNumber,
      invoiceDate: invoices.invoiceDate,
      totalAmount: invoices.totalAmount,
      status: invoices.status,
      notes: invoices.notes,
      rawJson: invoices.rawJson,
      createdAt: invoices.createdAt,
      updatedAt: invoices.updatedAt,
    })
    .from(invoices)
    .innerJoin(suppliers, eq(invoices.supplierId, suppliers.id))
    .where(eq(invoices.id, invoiceId))
    .get()

  if (!invoiceRecord) {
    return null
  }

  const items = await db()
    .select({
      id: invoiceItems.id,
      productName: invoiceItems.productName,
      categoryName: categories.name,
      quantity: invoiceItems.quantity,
      unit: invoiceItems.unit,
      unitPrice: invoiceItems.unitPrice,
      taxRate: invoiceItems.taxRate,
      totalPrice: invoiceItems.totalPrice,
      itemDate: invoiceItems.itemDate,
    })
    .from(invoiceItems)
    .leftJoin(categories, eq(invoiceItems.categoryId, categories.id))
    .where(eq(invoiceItems.invoiceId, invoiceId))
    .orderBy(asc(invoiceItems.itemDate), asc(invoiceItems.productName))

  return {
    id: invoiceRecord.id,
    createdAt: invoiceRecord.createdAt,
    updatedAt: invoiceRecord.updatedAt,
    rawJson: invoiceRecord.rawJson,
    draft: {
      supplierName: invoiceRecord.supplierName,
      supplierContact: invoiceRecord.supplierContact ?? '',
      supplierNotes: invoiceRecord.supplierNotes ?? '',
      invoiceNumber: invoiceRecord.invoiceNumber ?? '',
      invoiceDate: invoiceRecord.invoiceDate,
      totalAmount: Number(invoiceRecord.totalAmount ?? 0),
      status:
        invoiceRecord.status === 'verified' ? 'verified' : 'draft',
      notes: invoiceRecord.notes ?? '',
      items: items.map((item) => ({
        id: item.id,
        productName: item.productName,
        categoryName: item.categoryName ?? 'Otros',
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate),
        totalPrice: Number(item.totalPrice),
        itemDate: item.itemDate,
      })),
    },
  }
}

export async function updateInvoiceById(input: {
  invoiceId: string
  draft: InvoiceDraft
}) {
  const existingInvoice = await db()
    .select({
      id: invoices.id,
      rawJson: invoices.rawJson,
    })
    .from(invoices)
    .where(eq(invoices.id, input.invoiceId))
    .get()

  if (!existingInvoice) {
    throw new Error('Invoice not found.')
  }

  const categoryCatalog = await listCategoryCatalog()
  const sanitized = sanitizeInvoiceDraft(input.draft, categoryCatalog)

  if (!sanitized.success) {
    throw new Error(sanitized.errors.map((issue) => issue.message).join(' '))
  }

  const connection = db()
  const supplierIdSql = buildSupplierIdSql(sanitized.draft.supplierName)

  await connection.batch([
    buildSupplierUpsertStatement(connection, {
      name: sanitized.draft.supplierName,
      contact: sanitized.draft.supplierContact,
      notes: sanitized.draft.supplierNotes,
    }),
    connection
      .update(invoices)
      .set({
        supplierId: supplierIdSql,
        invoiceNumber: sanitized.draft.invoiceNumber || null,
        invoiceDate: sanitized.draft.invoiceDate,
        totalAmount: sanitized.draft.totalAmount,
        status: sanitized.draft.status,
        notes: sanitized.draft.notes || null,
        updatedAt: sql`(datetime('now'))`,
      })
      .where(eq(invoices.id, input.invoiceId)),
    connection.delete(invoiceItems).where(eq(invoiceItems.invoiceId, input.invoiceId)),
    ...sanitized.draft.items.map((item) =>
      connection.insert(invoiceItems).values({
        id: crypto.randomUUID(),
        invoiceId: input.invoiceId,
        supplierId: supplierIdSql,
        categoryId: resolveCategoryId(item.categoryName, categoryCatalog),
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        totalPrice: item.totalPrice,
        itemDate: item.itemDate,
      }),
    ),
  ])

  return {
    invoiceId: input.invoiceId,
    rawJson: existingInvoice.rawJson,
    warnings: sanitized.warnings,
  }
}

export async function deleteInvoiceById(invoiceId: string) {
  await db().delete(invoices).where(eq(invoices.id, invoiceId))
}

export async function listSupplierDirectory(): Promise<SupplierDirectoryEntry[]> {
  const rows = await db()
    .select({
      id: suppliers.id,
      name: suppliers.name,
      contact: suppliers.contact,
      notes: suppliers.notes,
      invoiceCount: sql<number>`count(distinct ${invoices.id})`,
      totalAmount: sql<number>`coalesce(sum(${invoices.totalAmount}), 0)`,
      lastPurchaseDate: sql<string | null>`max(${invoices.invoiceDate})`,
    })
    .from(suppliers)
    .leftJoin(invoices, eq(invoices.supplierId, suppliers.id))
    .groupBy(suppliers.id, suppliers.name, suppliers.contact, suppliers.notes)
    .orderBy(asc(suppliers.name))

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    contact: row.contact ?? '',
    notes: row.notes ?? '',
    invoiceCount: Number(row.invoiceCount),
    totalAmount: Number(row.totalAmount),
    lastPurchaseDate: row.lastPurchaseDate,
  }))
}

export async function upsertSupplierDetails(input: SupplierMutationInput) {
  const existingByName = await db()
    .select({
      id: suppliers.id,
    })
    .from(suppliers)
    .where(
      input.id
        ? and(
            sql<boolean>`lower(${suppliers.name}) = ${normalizeText(input.name)}`,
            ne(suppliers.id, input.id),
          )
        : sql<boolean>`lower(${suppliers.name}) = ${normalizeText(input.name)}`,
    )
    .get()

  if (existingByName) {
    throw new Error('Supplier name already exists.')
  }

  if (input.id) {
    await db()
      .update(suppliers)
      .set({
        name: input.name,
        contact: input.contact || null,
        notes: input.notes || null,
        updatedAt: sql`(datetime('now'))`,
      })
      .where(eq(suppliers.id, input.id))

    return input.id
  }

  const supplierId = crypto.randomUUID()

  await db().insert(suppliers).values({
    id: supplierId,
    name: input.name,
    contact: input.contact || null,
    notes: input.notes || null,
  })

  return supplierId
}

function resolveCategoryId(categoryName: string, catalog: CategoryOption[]) {
  const normalizedName = normalizeText(categoryName)
  const exactMatch = catalog.find(
    (category) => normalizeText(category.name) === normalizedName,
  )

  if (exactMatch) {
    return exactMatch.id
  }

  return (
    catalog.find((category) => normalizeText(category.name) === 'otros')?.id ??
    catalog.at(-1)?.id ??
    null
  )
}

function buildSupplierUpsertStatement(
  connection: ReturnType<typeof db>,
  input: {
    name: string
    contact?: string
    notes?: string
  },
) {
  return connection
    .insert(suppliers)
    .values({
      id: crypto.randomUUID(),
      name: input.name,
      contact: input.contact?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .onConflictDoUpdate({
      target: suppliers.name,
      set: {
        contact: sql`coalesce(nullif(excluded.contact, ''), ${suppliers.contact})`,
        notes: sql`coalesce(nullif(excluded.notes, ''), ${suppliers.notes})`,
        updatedAt: sql`(datetime('now'))`,
      },
    })
}

function buildSupplierIdSql(name: string) {
  return sql<string>`(
    select ${suppliers.id}
    from ${suppliers}
    where lower(${suppliers.name}) = ${normalizeSqlText(name)}
    limit 1
  )`
}

function normalizeSqlText(value: string) {
  return value.toLowerCase().trim()
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'

const now = sql`datetime('now')`

export const suppliers = sqliteTable('suppliers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  contact: text('contact'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(now),
  updatedAt: text('updated_at').notNull().default(now),
})

export const categories = sqliteTable('categories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  icon: text('icon'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(now),
})

export const invoices = sqliteTable(
  'invoices',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    supplierId: text('supplier_id')
      .notNull()
      .references(() => suppliers.id),
    invoiceNumber: text('invoice_number'),
    invoiceDate: text('invoice_date').notNull(),
    totalAmount: real('total_amount'),
    status: text('status').notNull().default('verified'),
    notes: text('notes'),
    rawJson: text('raw_json'),
    createdAt: text('created_at').notNull().default(now),
    updatedAt: text('updated_at').notNull().default(now),
  },
  (table) => [
    index('idx_invoices_supplier').on(table.supplierId),
    index('idx_invoices_date').on(table.invoiceDate),
  ],
)

export const invoiceItems = sqliteTable(
  'invoice_items',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    invoiceId: text('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    supplierId: text('supplier_id')
      .notNull()
      .references(() => suppliers.id),
    categoryId: text('category_id').references(() => categories.id),
    productName: text('product_name').notNull(),
    quantity: real('quantity').notNull(),
    unit: text('unit').notNull().default('ud'),
    unitPrice: real('unit_price').notNull(),
    taxRate: real('tax_rate').notNull().default(0.1),
    totalPrice: real('total_price').notNull(),
    itemDate: text('item_date').notNull(),
    createdAt: text('created_at').notNull().default(now),
  },
  (table) => [
    index('idx_items_product').on(table.productName),
    index('idx_items_supplier').on(table.supplierId),
    index('idx_items_date').on(table.itemDate),
    index('idx_items_category').on(table.categoryId),
  ],
)

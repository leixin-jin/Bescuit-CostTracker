import { z } from 'zod'
import { defaultCategories } from '../../db/seed'
import { invoiceDraftSchema } from './schema'
import type { CategoryOption, InvoiceDraft, InvoiceItemDraft } from './schema'

const itemAliases = ['items', 'lineas', 'line_items', 'detalle', 'detalles']
const supplierAliases = ['proveedor', 'supplier', 'supplier_name', 'nombre_proveedor']
const invoiceDateAliases = ['fecha', 'invoice_date', 'fecha_factura', 'date']
const invoiceNumberAliases = [
  'num_albaran',
  'numero_albaran',
  'invoice_number',
  'numero_factura',
  'albaran',
]
const totalAmountAliases = [
  'total_factura',
  'importe_total',
  'total',
  'invoice_total',
]
const notesAliases = ['notas', 'notes', 'comentarios']

const productAliases = ['producto', 'product', 'descripcion', 'description', 'nombre']
const categoryAliases = ['categoria', 'category', 'familia']
const quantityAliases = ['cantidad', 'quantity', 'qty', 'unidades']
const unitAliases = ['unidad', 'unit', 'uom']
const unitPriceAliases = [
  'precio_unitario',
  'unit_price',
  'precio',
  'importe_unitario',
]
const taxRateAliases = ['iva', 'tax_rate', 'impuesto']
const totalPriceAliases = ['precio_total', 'total_price', 'importe_total', 'total']
const itemDateAliases = ['fecha', 'item_date', 'date']

const unitAliasMap = new Map<string, string>([
  ['ud', 'ud'],
  ['uds', 'ud'],
  ['ud.', 'ud'],
  ['unidad', 'ud'],
  ['unidades', 'ud'],
  ['pieza', 'ud'],
  ['piezas', 'ud'],
  ['kg', 'kg'],
  ['kgs', 'kg'],
  ['kilo', 'kg'],
  ['kilos', 'kg'],
  ['kilogramo', 'kg'],
  ['kilogramos', 'kg'],
  ['g', 'g'],
  ['gr', 'g'],
  ['gramo', 'g'],
  ['gramos', 'g'],
  ['l', 'l'],
  ['lt', 'l'],
  ['litro', 'l'],
  ['litros', 'l'],
  ['ml', 'ml'],
  ['caja', 'caja'],
  ['cajas', 'caja'],
  ['pack', 'pack'],
  ['packs', 'pack'],
  ['botella', 'botella'],
  ['botellas', 'botella'],
])

const categoryKeywordMap = new Map<string, string>([
  ['aceite', 'Aceite'],
  ['oliva', 'Aceite'],
  ['carne', 'Carne'],
  ['pollo', 'Carne'],
  ['ternera', 'Carne'],
  ['cerdo', 'Carne'],
  ['pavo', 'Carne'],
  ['jamon', 'Carne'],
  ['pescado', 'Pescado'],
  ['salmon', 'Pescado'],
  ['atun', 'Pescado'],
  ['gamba', 'Pescado'],
  ['marisco', 'Pescado'],
  ['verdura', 'Verdura'],
  ['lechuga', 'Verdura'],
  ['tomate', 'Verdura'],
  ['cebolla', 'Verdura'],
  ['pimiento', 'Verdura'],
  ['patata', 'Verdura'],
  ['fruta', 'Fruta'],
  ['manzana', 'Fruta'],
  ['naranja', 'Fruta'],
  ['limon', 'Fruta'],
  ['platano', 'Fruta'],
  ['aguacate', 'Fruta'],
  ['lacteo', 'Lácteo'],
  ['leche', 'Lácteo'],
  ['queso', 'Lácteo'],
  ['yogur', 'Lácteo'],
  ['mantequilla', 'Lácteo'],
  ['bebida', 'Bebida'],
  ['vino', 'Bebida'],
  ['cerveza', 'Bebida'],
  ['agua', 'Bebida'],
  ['refresco', 'Bebida'],
  ['zumo', 'Bebida'],
  ['pan', 'Panadería'],
  ['harina', 'Panadería'],
  ['bolleria', 'Panadería'],
  ['masa', 'Panadería'],
  ['conserva', 'Conservas'],
  ['enlatado', 'Conservas'],
  ['lata', 'Conservas'],
  ['limpieza', 'Limpieza'],
  ['detergente', 'Limpieza'],
  ['lejia', 'Limpieza'],
  ['jabon', 'Limpieza'],
])

const categoryAliasMap = new Map<string, string>([
  ['aceites', 'Aceite'],
  ['meat', 'Carne'],
  ['carnes', 'Carne'],
  ['fish', 'Pescado'],
  ['verduras', 'Verdura'],
  ['vegetales', 'Verdura'],
  ['frutas', 'Fruta'],
  ['lacteos', 'Lácteo'],
  ['lácteos', 'Lácteo'],
  ['beverage', 'Bebida'],
  ['bebidas', 'Bebida'],
  ['panaderia', 'Panadería'],
  ['panadería', 'Panadería'],
  ['bakery', 'Panadería'],
  ['cleaning', 'Limpieza'],
  ['otros', 'Otros'],
  ['other', 'Otros'],
])

const requiredText = z.string().trim().min(1)
const normalizedDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')

const numberLikeSchema = z.preprocess(coerceNumber, z.number().finite())
const positiveNumberLikeSchema = z.preprocess(
  coerceNumber,
  z.number().finite().positive(),
)
const optionalNumberLikeSchema = z.preprocess(
  (value) => (value === undefined || value === null || value === '' ? undefined : coerceNumber(value)),
  z.number().finite().optional(),
)
const taxRateLikeSchema = z.preprocess(coerceTaxRate, z.number().finite().min(0).max(1))
const unitLikeSchema = z.preprocess(
  (value) => normalizeUnit(typeof value === 'string' ? value : String(value ?? '')),
  requiredText,
)
const optionalTextSchema = z.preprocess(
  (value) => normalizeOptionalText(value),
  z.string().trim().optional(),
)

const importedInvoiceItemSchema = z.object({
  product: requiredText,
  category: optionalTextSchema.default(''),
  quantity: positiveNumberLikeSchema,
  unit: unitLikeSchema.default('ud'),
  unitPrice: numberLikeSchema,
  taxRate: taxRateLikeSchema.default(0.1),
  totalPrice: optionalNumberLikeSchema,
  itemDate: z.preprocess((value) => normalizeDate(value), normalizedDateSchema.optional()),
})

const importedInvoiceSchema = z.object({
  supplier: requiredText,
  invoiceDate: z.preprocess((value) => normalizeDate(value), normalizedDateSchema),
  invoiceNumber: optionalTextSchema.default(''),
  totalAmount: optionalNumberLikeSchema,
  notes: optionalTextSchema.default(''),
  items: z.array(importedInvoiceItemSchema).min(1, 'Invoice must include at least one line'),
})

export const sampleInvoiceJson = `{
  "fecha": "2026-03-16",
  "proveedor": "Makro",
  "num_albaran": "ALB-2026-0342",
  "items": [
    {
      "producto": "Aceite de oliva virgen extra 5L",
      "categoria": "Aceite",
      "cantidad": 3,
      "unidad": "ud",
      "precio_unitario": 8.5,
      "iva": 0.1,
      "precio_total": 28.05
    },
    {
      "producto": "Pollo entero",
      "categoria": "Carne",
      "cantidad": 10,
      "unidad": "kg",
      "precio_unitario": 3.2,
      "iva": 0.1,
      "precio_total": 35.2
    }
  ],
  "total_factura": 63.25
}`

export type InvoiceValidationIssue = {
  path: string
  message: string
}

export type ImportPreviewResult =
  | {
      success: true
      draft: InvoiceDraft
      warnings: string[]
      errors: InvoiceValidationIssue[]
    }
  | {
      success: false
      warnings: string[]
      errors: InvoiceValidationIssue[]
    }

type ImportedInvoice = z.infer<typeof importedInvoiceSchema>

export function createEmptyInvoiceItemDraft(itemDate: string): InvoiceItemDraft {
  return {
    id: crypto.randomUUID(),
    productName: '',
    categoryName: 'Otros',
    quantity: 1,
    unit: 'ud',
    unitPrice: 0,
    taxRate: 0.1,
    totalPrice: 0,
    itemDate,
  }
}

export function calculateItemTotal(item: Pick<InvoiceItemDraft, 'quantity' | 'unitPrice' | 'taxRate'>) {
  return roundCurrency(item.quantity * item.unitPrice * (1 + item.taxRate))
}

export function calculateInvoiceTotal(items: Array<Pick<InvoiceItemDraft, 'totalPrice'>>) {
  return roundCurrency(items.reduce((sum, item) => sum + item.totalPrice, 0))
}

export function parseImportedInvoiceText(
  rawText: string,
  categories: CategoryOption[],
): ImportPreviewResult {
  if (!rawText.trim()) {
    return {
      success: false,
      warnings: [],
      errors: [{ path: 'json', message: 'Paste the Gemini JSON first.' }],
    }
  }

  try {
    const parsedJson = JSON.parse(rawText)
    return normalizeImportedInvoice(parsedJson, categories)
  } catch {
    return {
      success: false,
      warnings: [],
      errors: [
        {
          path: 'json',
          message: 'JSON is invalid. Fix the syntax and parse again.',
        },
      ],
    }
  }
}

export function normalizeImportedInvoice(
  value: unknown,
  categories: CategoryOption[],
): ImportPreviewResult {
  const candidate = extractImportedInvoiceCandidate(value)
  const parsed = importedInvoiceSchema.safeParse(candidate)

  if (!parsed.success) {
    return {
      success: false,
      warnings: [],
      errors: formatZodIssues(parsed.error.issues),
    }
  }

  const normalized = sanitizeImportedInvoice(parsed.data, categories)
  const validatedDraft = invoiceDraftSchema.safeParse(normalized.draft)

  if (!validatedDraft.success) {
    return {
      success: false,
      warnings: normalized.warnings,
      errors: formatZodIssues(validatedDraft.error.issues),
    }
  }

  return {
    success: true,
    draft: validatedDraft.data,
    warnings: normalized.warnings,
    errors: [],
  }
}

export function sanitizeInvoiceDraft(
  draft: InvoiceDraft,
  categories: CategoryOption[],
): { success: true; draft: InvoiceDraft; warnings: string[] } | { success: false; errors: InvoiceValidationIssue[] } {
  const sanitizedDraft = {
    ...draft,
    supplierName: draft.supplierName.trim(),
    supplierContact: draft.supplierContact.trim(),
    supplierNotes: draft.supplierNotes.trim(),
    invoiceNumber: draft.invoiceNumber.trim(),
    notes: draft.notes.trim(),
    items: draft.items.map((item) => {
      const categoryMatch = matchCategoryName(
        item.categoryName,
        item.productName,
        categories,
      )

      return {
        ...item,
        productName: item.productName.trim(),
        categoryName: categoryMatch.name,
        unit: normalizeUnit(item.unit),
        totalPrice: roundCurrency(item.totalPrice),
        unitPrice: roundCurrency(item.unitPrice),
      }
    }),
  }

  const validation = invoiceDraftSchema.safeParse({
    ...sanitizedDraft,
    totalAmount: roundCurrency(sanitizedDraft.totalAmount),
    items: sanitizedDraft.items.map((item) => ({
      ...item,
      totalPrice:
        item.totalPrice > 0 ? roundCurrency(item.totalPrice) : calculateItemTotal(item),
    })),
  })

  if (!validation.success) {
    return { success: false, errors: formatZodIssues(validation.error.issues) }
  }

  const normalizedWarnings: string[] = []
  const lineTotal = calculateInvoiceTotal(validation.data.items)

  if (Math.abs(validation.data.totalAmount - lineTotal) > 0.05) {
    normalizedWarnings.push(
      `Declared total (${formatAmount(validation.data.totalAmount)}) does not match line total (${formatAmount(lineTotal)}).`,
    )
  }

  return {
    success: true,
    draft: validation.data,
    warnings: normalizedWarnings,
  }
}

export function groupIssuesByPath(issues: InvoiceValidationIssue[]) {
  return issues.reduce<Partial<Record<string, string[]>>>(
    (accumulator, issue) => {
      const messages = accumulator[issue.path] ?? []
      messages.push(issue.message)
      accumulator[issue.path] = messages
      return accumulator
    },
    {},
  )
}

export function formatIssuePath(path: string) {
  if (path === 'json') {
    return 'JSON'
  }

  if (!path.startsWith('items.')) {
    return path
  }

  const [, index, field] = path.split('.')
  return `Line ${Number(index) + 1} · ${field}`
}

function sanitizeImportedInvoice(
  data: ImportedInvoice,
  categories: CategoryOption[],
) {
  const warnings: string[] = []

  const items = data.items.map((item) => {
    const categoryMatch = matchCategoryName(item.category, item.product, categories)
    const computedTotal = calculateItemTotal({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
    })
    const totalPrice = item.totalPrice ?? computedTotal

    if (
      item.totalPrice !== undefined &&
      Math.abs(item.totalPrice - computedTotal) > 0.05
    ) {
      warnings.push(
        `Line "${item.product}" total was normalized from ${formatAmount(item.totalPrice)} to ${formatAmount(computedTotal)}.`,
      )
    }

    if (categoryMatch.reason !== 'exact' && categoryMatch.reason !== 'alias') {
      warnings.push(
        `Line "${item.product}" was mapped to "${categoryMatch.name}" automatically.`,
      )
    }

    return {
      id: crypto.randomUUID(),
      productName: item.product,
      categoryName: categoryMatch.name,
      quantity: roundCurrency(item.quantity),
      unit: item.unit,
      unitPrice: roundCurrency(item.unitPrice),
      taxRate: item.taxRate,
      totalPrice: roundCurrency(totalPrice),
      itemDate: item.itemDate ?? data.invoiceDate,
    }
  })

  const computedInvoiceTotal = calculateInvoiceTotal(items)
  const totalAmount = roundCurrency(data.totalAmount ?? computedInvoiceTotal)

  if (
    data.totalAmount !== undefined &&
    Math.abs(data.totalAmount - computedInvoiceTotal) > 0.05
  ) {
    warnings.push(
      `Invoice total was normalized from ${formatAmount(data.totalAmount)} to ${formatAmount(computedInvoiceTotal)}.`,
    )
  }

  return {
    warnings: dedupeStrings(warnings),
    draft: {
      supplierName: data.supplier,
      supplierContact: '',
      supplierNotes: '',
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      totalAmount,
      status: 'draft' as const,
      notes: data.notes,
      items,
    },
  }
}

function extractImportedInvoiceCandidate(value: unknown) {
  if (!isRecord(value)) {
    return value
  }

  const rawItems = pickFirst(value, itemAliases)

  return {
    supplier: pickFirst(value, supplierAliases),
    invoiceDate: pickFirst(value, invoiceDateAliases),
    invoiceNumber: pickFirst(value, invoiceNumberAliases),
    totalAmount: pickFirst(value, totalAmountAliases),
    notes: pickFirst(value, notesAliases),
    items: Array.isArray(rawItems) ? rawItems.map(extractImportedItemCandidate) : rawItems,
  }
}

function extractImportedItemCandidate(value: unknown) {
  if (!isRecord(value)) {
    return value
  }

  return {
    product: pickFirst(value, productAliases),
    category: pickFirst(value, categoryAliases),
    quantity: pickFirst(value, quantityAliases),
    unit: pickFirst(value, unitAliases),
    unitPrice: pickFirst(value, unitPriceAliases),
    taxRate: pickFirst(value, taxRateAliases),
    totalPrice: pickFirst(value, totalPriceAliases),
    itemDate: pickFirst(value, itemDateAliases),
  }
}

function pickFirst(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (key in record) {
      return record[key]
    }
  }

  return undefined
}

function normalizeOptionalText(value: unknown) {
  if (value === undefined || value === null) {
    return undefined
  }

  const text = String(value).trim()
  return text.length > 0 ? text : undefined
}

function normalizeDate(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const text = String(value).trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text
  }

  const slashMatch = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (slashMatch) {
    const [, day, month, year] = slashMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const date = new Date(text)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString().slice(0, 10)
}

function coerceNumber(value: unknown) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value !== 'string') {
    return value
  }

  const normalized = value
    .trim()
    .replace(/[€\s]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.')
    .replace('%', '')

  return normalized.length > 0 ? Number(normalized) : undefined
}

function coerceTaxRate(value: unknown) {
  const numeric = coerceNumber(value)

  if (typeof numeric !== 'number' || Number.isNaN(numeric)) {
    return undefined
  }

  if (numeric > 1) {
    return numeric / 100
  }

  return numeric
}

export function normalizeUnit(value: string) {
  const normalizedValue = normalizeForMatching(value)

  if (!normalizedValue) {
    return 'ud'
  }

  return unitAliasMap.get(normalizedValue) ?? value.trim().toLowerCase()
}

export function getFallbackCategories() {
  return defaultCategories.map((category) => ({
    id: category.name,
    name: category.name,
    icon: category.icon,
    sortOrder: category.sortOrder,
  }))
}

function matchCategoryName(
  rawCategory: string,
  productName: string,
  categories: CategoryOption[],
) {
  const catalog = categories.length > 0 ? categories : getFallbackCategories()
  const byNormalizedName = new Map(
    catalog.map((category) => [normalizeForMatching(category.name), category.name]),
  )

  const normalizedCategory = normalizeForMatching(rawCategory)
  const normalizedProduct = normalizeForMatching(productName)

  if (normalizedCategory && byNormalizedName.has(normalizedCategory)) {
    return { name: byNormalizedName.get(normalizedCategory) ?? 'Otros', reason: 'exact' as const }
  }

  const aliasedCategory = normalizedCategory
    ? categoryAliasMap.get(normalizedCategory)
    : undefined
  if (aliasedCategory && byNormalizedName.has(normalizeForMatching(aliasedCategory))) {
    return { name: aliasedCategory, reason: 'alias' as const }
  }

  for (const [keyword, categoryName] of categoryKeywordMap) {
    if (normalizedCategory.includes(keyword) || normalizedProduct.includes(keyword)) {
      if (byNormalizedName.has(normalizeForMatching(categoryName))) {
        return { name: categoryName, reason: 'keyword' as const }
      }
    }
  }

  const fallback = catalog.find(
    (category) => normalizeForMatching(category.name) === 'otros',
  )

  return { name: fallback?.name ?? catalog.at(-1)?.name ?? 'Otros', reason: 'fallback' as const }
}

function normalizeForMatching(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function formatZodIssues(issues: z.ZodIssue[]): InvoiceValidationIssue[] {
  return issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join('.') : 'form',
    message: issue.message,
  }))
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2))
}

function formatAmount(value: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value)
}

function dedupeStrings(values: string[]) {
  return [...new Set(values)]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

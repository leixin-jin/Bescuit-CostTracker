import '@tanstack/react-start/server-only'
import { env } from 'cloudflare:workers'
import { normalizeProductName } from './product'
import type {
  AnalyticsSearch,
  AnalyticsWindow,
  CompareSearch,
  CompareSort,
} from './schema'

const PRODUCT_SUGGESTION_LIMIT = 8
const COMPARISON_PAGE_SIZE = 8

type SqlitePlanRow = {
  detail: string
}

type DashboardMetricRow = {
  totalSpend: number | string | null
  activeSuppliers: number | string | null
  recentInvoiceCount: number | string | null
  recentCategoryCount: number | string | null
  totalInvoiceCount: number | string | null
  latestInvoiceDate: string | null
}

type ProductSuggestionRow = {
  productKey: string
  displayName: string
  sampleCount: number | string
  lastPurchasedAt: string | null
  variantCount: number | string
}

type ProductUnitRow = {
  unit: string
  sampleCount: number | string
  lastPurchasedAt: string | null
}

type TrendRow = {
  month: string
  averageUnitPrice: number | string
  minimumUnitPrice: number | string
  maximumUnitPrice: number | string
  totalQuantity: number | string
  sampleCount: number | string
}

type CompareSummaryRow = {
  productKey: string
  unit: string
  displayName: string
  supplierCount: number | string
  bestPrice: number | string
  highestPrice: number | string
  lastObservedAt: string | null
}

type CompareOfferRow = {
  productKey: string
  unit: string
  displayName: string
  supplierName: string
  unitPrice: number | string
  itemDate: string
  priceRank: number | string
}

export type DashboardMetrics = {
  totalSpend: number
  activeSuppliers: number
  recentInvoiceCount: number
  recentCategoryCount: number
  totalInvoiceCount: number
  latestInvoiceDate: string | null
  recentWindowDays: number
}

export type ProductSuggestion = {
  productKey: string
  displayName: string
  sampleCount: number
  lastPurchasedAt: string | null
  variantCount: number
}

export type ProductUnitOption = {
  unit: string
  sampleCount: number
  lastPurchasedAt: string | null
}

export type ProductTrendPoint = {
  month: string
  averageUnitPrice: number
  minimumUnitPrice: number
  maximumUnitPrice: number
  totalQuantity: number
  sampleCount: number
  unit: string
}

export type ProductAnalyticsView = {
  productKey: string
  displayName: string
  totalSamples: number
  lastPurchasedAt: string | null
  unitOptions: ProductUnitOption[]
  selectedUnit: string | null
  conflictWarning: string | null
}

export type AnalyticsPageData = {
  suggestions: ProductSuggestion[]
  selectedProduct: ProductAnalyticsView | null
  trend: ProductTrendPoint[]
}

export type SupplierPriceOffer = {
  supplierName: string
  unitPrice: number
  itemDate: string
  priceRank: number
  isBest: boolean
}

export type SupplierComparisonRow = {
  productKey: string
  displayName: string
  unit: string
  supplierCount: number
  bestPrice: number
  highestPrice: number
  priceSpread: number
  lastObservedAt: string | null
  offers: SupplierPriceOffer[]
}

export type ComparePageData = {
  suggestions: ProductSuggestion[]
  rows: SupplierComparisonRow[]
  page: number
  pageSize: number
  totalRows: number
  totalPages: number
}

export type AnalyticsExplainPlans = {
  search: string[]
  trend: string[]
  compare: string[]
}

function db() {
  return env.DB
}

async function queryRows<T>(statement: string, params: unknown[] = []) {
  const prepared = params.length > 0 ? db().prepare(statement).bind(...params) : db().prepare(statement)
  const result = await prepared.all<T>()
  return result.results
}

async function queryFirst<T>(statement: string, params: unknown[] = []) {
  const rows = await queryRows<T>(statement, params)
  return rows[0] ?? null
}

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0)
}

function getWindowStartModifier(months: AnalyticsWindow) {
  return `-${Number(months) - 1} months`
}

function buildProductFilterClause(input: {
  productKey?: string
  query?: string
}) {
  if (input.productKey) {
    return {
      sql: 'and ii.product_name_normalized = ?',
      params: [input.productKey],
    }
  }

  const normalizedQuery = normalizeProductName(input.query ?? '')

  if (normalizedQuery.length < 2) {
    return {
      sql: '',
      params: [],
    }
  }

  return {
    sql: 'and ii.product_name_normalized like ?',
    params: [`${normalizedQuery}%`],
  }
}

function getComparisonOrder(sort: CompareSort) {
  switch (sort) {
    case 'supplier-count':
      return 'supplierCount desc, bestPrice asc, lastObservedAt desc, displayName asc'
    case 'recent':
      return 'lastObservedAt desc, bestPrice asc, displayName asc'
    case 'best-price':
    default:
      return 'bestPrice asc, supplierCount desc, lastObservedAt desc, displayName asc'
  }
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const row = await queryFirst<DashboardMetricRow>(
    `
      select
        coalesce(sum(i.total_amount), 0) as totalSpend,
        count(distinct i.supplier_id) as activeSuppliers,
        sum(case when i.invoice_date >= date('now', '-30 day') then 1 else 0 end) as recentInvoiceCount,
        (
          select count(distinct coalesce(ii.category_id, 'uncategorized'))
          from invoice_items ii
          where ii.item_date >= date('now', '-30 day')
        ) as recentCategoryCount,
        count(*) as totalInvoiceCount,
        max(i.invoice_date) as latestInvoiceDate
      from invoices i
    `,
  )

  return {
    totalSpend: toNumber(row?.totalSpend),
    activeSuppliers: toNumber(row?.activeSuppliers),
    recentInvoiceCount: toNumber(row?.recentInvoiceCount),
    recentCategoryCount: toNumber(row?.recentCategoryCount),
    totalInvoiceCount: toNumber(row?.totalInvoiceCount),
    latestInvoiceDate: row?.latestInvoiceDate ?? null,
    recentWindowDays: 30,
  }
}

export async function listProductSuggestions(query: string) {
  const normalizedQuery = normalizeProductName(query)

  if (normalizedQuery.length < 2) {
    return [] satisfies ProductSuggestion[]
  }

  const rows = await queryRows<ProductSuggestionRow>(
    `
      with filtered as (
        select *
        from invoice_items
        where product_name_normalized like ?
          and product_name_normalized <> ''
          and quantity > 0
          and unit_price > 0
      )
      select
        filtered.product_name_normalized as productKey,
        (
          select candidate.product_name
          from filtered candidate
          where candidate.product_name_normalized = filtered.product_name_normalized
          order by candidate.item_date desc, candidate.created_at desc, candidate.id desc
          limit 1
        ) as displayName,
        count(*) as sampleCount,
        max(filtered.item_date) as lastPurchasedAt,
        count(distinct filtered.product_name) as variantCount
      from filtered
      group by filtered.product_name_normalized
      order by sampleCount desc, lastPurchasedAt desc, displayName asc
      limit ?
    `,
    [`${normalizedQuery}%`, PRODUCT_SUGGESTION_LIMIT],
  )

  return rows.map((row) => ({
    productKey: row.productKey,
    displayName: row.displayName,
    sampleCount: toNumber(row.sampleCount),
    lastPurchasedAt: row.lastPurchasedAt,
    variantCount: toNumber(row.variantCount),
  }))
}

async function getProductUnitOptions(productKey: string) {
  const rows = await queryRows<ProductUnitRow>(
    `
      select
        unit,
        count(*) as sampleCount,
        max(item_date) as lastPurchasedAt
      from invoice_items
      where product_name_normalized = ?
        and product_name_normalized <> ''
        and quantity > 0
        and unit_price > 0
      group by unit
      order by sampleCount desc, unit asc
    `,
    [productKey],
  )

  return rows.map((row) => ({
    unit: row.unit,
    sampleCount: toNumber(row.sampleCount),
    lastPurchasedAt: row.lastPurchasedAt,
  }))
}

async function getSelectedProductView(
  productKey: string,
  requestedUnit: string,
): Promise<ProductAnalyticsView | null> {
  const row = await queryFirst<{
    displayName: string
    totalSamples: number | string
    lastPurchasedAt: string | null
  }>(
    `
      select
        (
          select ii.product_name
          from invoice_items ii
          where ii.product_name_normalized = source.product_name_normalized
          order by ii.item_date desc, ii.created_at desc, ii.id desc
          limit 1
        ) as displayName,
        count(*) as totalSamples,
        max(source.item_date) as lastPurchasedAt
      from invoice_items source
      where source.product_name_normalized = ?
        and source.product_name_normalized <> ''
        and source.quantity > 0
        and source.unit_price > 0
      group by source.product_name_normalized
    `,
    [productKey],
  )

  if (!row) {
    return null
  }

  const unitOptions = await getProductUnitOptions(productKey)
  const selectedUnit = unitOptions.some((option) => option.unit === requestedUnit)
    ? requestedUnit
    : unitOptions.length === 1
      ? unitOptions[0].unit
      : null

  return {
    productKey,
    displayName: row.displayName,
    totalSamples: toNumber(row.totalSamples),
    lastPurchasedAt: row.lastPurchasedAt,
    unitOptions,
    selectedUnit,
    conflictWarning:
      selectedUnit || unitOptions.length <= 1
        ? null
        : 'This product has samples with multiple units. Select a unit before reading quantity trends.',
  }
}

async function getMonthlyTrend(input: {
  productKey: string
  unit: string
  months: AnalyticsWindow
}) {
  const rows = await queryRows<TrendRow>(
    `
      select
        substr(item_date, 1, 7) as month,
        avg(unit_price) as averageUnitPrice,
        min(unit_price) as minimumUnitPrice,
        max(unit_price) as maximumUnitPrice,
        sum(quantity) as totalQuantity,
        count(*) as sampleCount
      from invoice_items
      where product_name_normalized = ?
        and unit = ?
        and item_date >= date('now', 'start of month', ?)
        and quantity > 0
        and unit_price > 0
      group by substr(item_date, 1, 7)
      order by month asc
    `,
    [input.productKey, input.unit, getWindowStartModifier(input.months)],
  )

  return rows.map((row) => ({
    month: row.month,
    averageUnitPrice: toNumber(row.averageUnitPrice),
    minimumUnitPrice: toNumber(row.minimumUnitPrice),
    maximumUnitPrice: toNumber(row.maximumUnitPrice),
    totalQuantity: toNumber(row.totalQuantity),
    sampleCount: toNumber(row.sampleCount),
    unit: input.unit,
  }))
}

export async function getAnalyticsPageData(
  filters: AnalyticsSearch,
): Promise<AnalyticsPageData> {
  const suggestions = await listProductSuggestions(filters.query)
  const selectedProduct = filters.product
    ? await getSelectedProductView(filters.product, filters.unit)
    : null
  const trend =
    selectedProduct?.selectedUnit && selectedProduct.productKey
      ? await getMonthlyTrend({
          productKey: selectedProduct.productKey,
          unit: selectedProduct.selectedUnit,
          months: filters.months,
        })
      : []

  return {
    suggestions,
    selectedProduct,
    trend,
  }
}

function buildLatestSupplierPricesCte(productFilterSql: string) {
  return `
    with latest_supplier_prices as (
      select
        ii.product_name_normalized as productKey,
        ii.unit as unit,
        ii.product_name as displayName,
        s.name as supplierName,
        ii.unit_price as unitPrice,
        ii.item_date as itemDate,
        row_number() over (
          partition by ii.product_name_normalized, ii.unit, ii.supplier_id
          order by ii.item_date desc, ii.created_at desc, ii.id desc
        ) as latestSampleRow
      from invoice_items ii
      inner join suppliers s on s.id = ii.supplier_id
      where ii.product_name_normalized <> ''
        and ii.quantity > 0
        and ii.unit_price > 0
        ${productFilterSql}
    ),
    latest_rows as (
      select *
      from latest_supplier_prices
      where latestSampleRow = 1
    )
  `
}

export async function getComparePageData(
  filters: CompareSearch,
): Promise<ComparePageData> {
  const suggestions = await listProductSuggestions(filters.query)
  const productFilter = buildProductFilterClause({
    productKey: filters.product,
    query: filters.query,
  })
  const offset = (filters.page - 1) * COMPARISON_PAGE_SIZE
  const cte = buildLatestSupplierPricesCte(productFilter.sql)

  const totalRow = await queryFirst<{ totalRows: number | string }>(
    `
      ${cte}
      select count(*) as totalRows
      from (
        select productKey, unit
        from latest_rows
        group by productKey, unit
      )
    `,
    productFilter.params,
  )

  const totalRows = toNumber(totalRow?.totalRows)
  const totalPages = Math.max(1, Math.ceil(totalRows / COMPARISON_PAGE_SIZE))
  const page = Math.min(filters.page, totalPages)

  const summaries = await queryRows<CompareSummaryRow>(
    `
      ${cte}
      select
        latest_rows.productKey as productKey,
        latest_rows.unit as unit,
        (
          select candidate.displayName
          from latest_rows candidate
          where candidate.productKey = latest_rows.productKey
            and candidate.unit = latest_rows.unit
          order by candidate.itemDate desc, candidate.displayName asc
          limit 1
        ) as displayName,
        count(*) as supplierCount,
        min(latest_rows.unitPrice) as bestPrice,
        max(latest_rows.unitPrice) as highestPrice,
        max(latest_rows.itemDate) as lastObservedAt
      from latest_rows
      group by latest_rows.productKey, latest_rows.unit
      order by ${getComparisonOrder(filters.sort)}
      limit ?
      offset ?
    `,
    [...productFilter.params, COMPARISON_PAGE_SIZE, (page - 1) * COMPARISON_PAGE_SIZE],
  )

  if (summaries.length === 0) {
    return {
      suggestions,
      rows: [],
      page,
      pageSize: COMPARISON_PAGE_SIZE,
      totalRows,
      totalPages,
    }
  }

  const summaryParams: unknown[] = [...productFilter.params]
  const summaryWhereClauses = summaries.map((summary) => {
    summaryParams.push(summary.productKey, summary.unit)
    return '(productKey = ? and unit = ?)'
  })

  const offers = await queryRows<CompareOfferRow>(
    `
      ${cte}
      select
        latest_rows.productKey as productKey,
        latest_rows.unit as unit,
        latest_rows.displayName as displayName,
        latest_rows.supplierName as supplierName,
        latest_rows.unitPrice as unitPrice,
        latest_rows.itemDate as itemDate,
        rank() over (
          partition by latest_rows.productKey, latest_rows.unit
          order by latest_rows.unitPrice asc, latest_rows.itemDate desc, latest_rows.supplierName asc
        ) as priceRank
      from latest_rows
      where ${summaryWhereClauses.join(' or ')}
      order by latest_rows.productKey asc, latest_rows.unit asc, priceRank asc, latest_rows.supplierName asc
    `,
    summaryParams,
  )

  const rows = summaries.map((summary) => {
    const summaryOffers = offers
      .filter(
        (offer) =>
          offer.productKey === summary.productKey && offer.unit === summary.unit,
      )
      .map((offer) => ({
        supplierName: offer.supplierName,
        unitPrice: toNumber(offer.unitPrice),
        itemDate: offer.itemDate,
        priceRank: toNumber(offer.priceRank),
        isBest: toNumber(offer.priceRank) === 1,
      }))

    const bestPrice = toNumber(summary.bestPrice)
    const highestPrice = toNumber(summary.highestPrice)

    return {
      productKey: summary.productKey,
      displayName: summary.displayName,
      unit: summary.unit,
      supplierCount: toNumber(summary.supplierCount),
      bestPrice,
      highestPrice,
      priceSpread: highestPrice - bestPrice,
      lastObservedAt: summary.lastObservedAt,
      offers: summaryOffers,
    }
  })

  return {
    suggestions,
    rows,
    page,
    pageSize: COMPARISON_PAGE_SIZE,
    totalRows,
    totalPages,
  }
}

async function explain(statement: string, params: unknown[]) {
  const rows = await queryRows<SqlitePlanRow>(`explain query plan ${statement}`, params)
  return rows.map((row) => row.detail)
}

export async function explainAnalyticsQueries(): Promise<AnalyticsExplainPlans> {
  const productKey = 'aceite de oliva virgen extra 5l'

  return {
    search: await explain(
      `
        select product_name_normalized
        from invoice_items
        where product_name_normalized like ?
        order by product_name_normalized asc
        limit 8
      `,
      ['aceite%'],
    ),
    trend: await explain(
      `
        select substr(item_date, 1, 7)
        from invoice_items
        where product_name_normalized = ?
          and unit = ?
          and item_date >= date('now', 'start of month', '-5 months')
        group by substr(item_date, 1, 7)
      `,
      [productKey, 'ud'],
    ),
    compare: await explain(
      `
        with latest_supplier_prices as (
          select
            ii.product_name_normalized,
            ii.unit,
            ii.supplier_id,
            ii.unit_price,
            ii.item_date,
            row_number() over (
              partition by ii.product_name_normalized, ii.unit, ii.supplier_id
              order by ii.item_date desc, ii.created_at desc, ii.id desc
            ) as latestSampleRow
          from invoice_items ii
          where ii.product_name_normalized = ?
            and ii.unit = ?
        )
        select product_name_normalized, unit
        from latest_supplier_prices
        where latestSampleRow = 1
      `,
      [productKey, 'ud'],
    ),
  }
}

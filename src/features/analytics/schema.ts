import { z } from 'zod'

const searchText = z
  .preprocess((value) => (typeof value === 'string' ? value : ''), z.string())
  .catch('')

export const analyticsWindowSchema = z.enum(['3', '6', '12']).catch('6')

export const analyticsSearchSchema = z.object({
  query: searchText,
  product: searchText,
  unit: searchText,
  months: analyticsWindowSchema,
})

export const compareSortSchema = z.enum([
  'best-price',
  'supplier-count',
  'recent',
])

export const compareSearchSchema = z.object({
  query: searchText,
  product: searchText,
  sort: z
    .preprocess(
      (value) => (typeof value === 'string' ? value : 'best-price'),
      compareSortSchema,
    )
    .catch('best-price'),
  page: z
    .preprocess((value) => {
      if (typeof value === 'number') {
        return value
      }

      if (typeof value === 'string' && value.trim()) {
        return Number(value)
      }

      return 1
    }, z.number().int().min(1))
    .catch(1),
})

export type AnalyticsSearch = z.infer<typeof analyticsSearchSchema>
export type AnalyticsWindow = z.infer<typeof analyticsWindowSchema>
export type CompareSearch = z.infer<typeof compareSearchSchema>
export type CompareSort = z.infer<typeof compareSortSchema>

export const defaultAnalyticsSearch: AnalyticsSearch = {
  query: '',
  product: '',
  unit: '',
  months: '6',
}

export const defaultCompareSearch: CompareSearch = {
  query: '',
  product: '',
  sort: 'best-price',
  page: 1,
}

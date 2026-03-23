import { createServerFn } from '@tanstack/react-start'
import {
  explainAnalyticsQueries,
  getAnalyticsPageData,
  getComparePageData,
  getDashboardMetrics,
} from './analytics.server'
import {
  analyticsSearchSchema,
  compareSearchSchema,
} from './schema'

export const getDashboardMetricsQuery = createServerFn({ method: 'GET' }).handler(
  async () => getDashboardMetrics(),
)

export const getAnalyticsPageQuery = createServerFn({ method: 'GET' })
  .inputValidator(analyticsSearchSchema)
  .handler(async ({ data }) => getAnalyticsPageData(data))

export const getComparePageQuery = createServerFn({ method: 'GET' })
  .inputValidator(compareSearchSchema)
  .handler(async ({ data }) => getComparePageData(data))

export const explainAnalyticsQueriesQuery = createServerFn({ method: 'GET' }).handler(
  async () => explainAnalyticsQueries(),
)

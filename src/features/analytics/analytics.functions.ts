import { createServerFn } from '@tanstack/react-start'
import { observeServerOperation } from '../../lib/observability'
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
  async () =>
    observeServerOperation('analytics.dashboard', {}, async () =>
      getDashboardMetrics(),
    ),
)

export const getAnalyticsPageQuery = createServerFn({ method: 'GET' })
  .inputValidator(analyticsSearchSchema)
  .handler(async ({ data }) =>
    observeServerOperation(
      'analytics.trend',
      data,
      async () => getAnalyticsPageData(data),
    ),
  )

export const getComparePageQuery = createServerFn({ method: 'GET' })
  .inputValidator(compareSearchSchema)
  .handler(async ({ data }) =>
    observeServerOperation(
      'analytics.compare',
      data,
      async () => getComparePageData(data),
    ),
  )

export const explainAnalyticsQueriesQuery = createServerFn({ method: 'GET' }).handler(
  async () =>
    observeServerOperation('analytics.explain', {}, async () =>
      explainAnalyticsQueries(),
    ),
)

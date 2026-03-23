import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AnalyticsPageContent } from '../features/analytics/AnalyticsViews'
import { getAnalyticsPageQuery } from '../features/analytics/analytics.functions'
import {
  analyticsSearchSchema,
  defaultAnalyticsSearch,
} from '../features/analytics/schema'

export const Route = createFileRoute('/analytics')({
  validateSearch: (search) => analyticsSearchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getAnalyticsPageQuery({ data: deps }),
  component: AnalyticsPage,
})

function AnalyticsPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const search = Route.useSearch()
  const data = Route.useLoaderData()

  return (
    <div className="page-shell page-fade">
      <AnalyticsPageContent
        data={data}
        query={search.query}
        months={search.months}
        onQueryChange={(value) =>
          navigate({
            search: (previous) => ({
              ...previous,
              query: value,
              product: '',
              unit: '',
            }),
          })
        }
        onMonthsChange={(value) =>
          navigate({
            search: (previous) => ({
              ...previous,
              months:
                value === '3' || value === '6' || value === '12'
                  ? value
                  : defaultAnalyticsSearch.months,
            }),
          })
        }
        onSelectProduct={(suggestion) =>
          navigate({
            search: (previous) => ({
              ...previous,
              query: suggestion.displayName,
              product: suggestion.productKey,
              unit: '',
            }),
          })
        }
        onSelectUnit={(unit) =>
          navigate({
            search: (previous) => ({
              ...previous,
              unit,
            }),
          })
        }
      />
    </div>
  )
}

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ComparePageContent } from '../features/analytics/AnalyticsViews'
import { getComparePageQuery } from '../features/analytics/analytics.functions'
import {
  compareSearchSchema,
  defaultCompareSearch,
} from '../features/analytics/schema'

export const Route = createFileRoute('/compare')({
  validateSearch: (search) => compareSearchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getComparePageQuery({ data: deps }),
  component: ComparePage,
})

function ComparePage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const search = Route.useSearch()
  const data = Route.useLoaderData()

  return (
    <div className="page-shell page-fade">
      <ComparePageContent
        data={data}
        query={search.query}
        sort={search.sort}
        onQueryChange={(value) =>
          navigate({
            search: (previous) => ({
              ...previous,
              query: value,
              product: '',
              page: 1,
            }),
          })
        }
        onSortChange={(value) =>
          navigate({
            search: (previous) => ({
              ...previous,
              sort:
                value === 'best-price' ||
                value === 'supplier-count' ||
                value === 'recent'
                  ? value
                  : defaultCompareSearch.sort,
              page: 1,
            }),
          })
        }
        onSelectProduct={(suggestion) =>
          navigate({
            search: (previous) => ({
              ...previous,
              query: suggestion.displayName,
              product: suggestion.productKey,
              page: 1,
            }),
          })
        }
        onPageChange={(page) =>
          navigate({
            search: (previous) => ({
              ...previous,
              page,
            }),
          })
        }
      />
    </div>
  )
}

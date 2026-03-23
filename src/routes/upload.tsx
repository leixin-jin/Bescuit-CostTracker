import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { PageNotice } from '../components/AppStates'
import { UploadWorkflow } from '../features/invoices/UploadWorkflow'
import {
  getCategoryCatalog,
  saveImportedInvoiceAction,
} from '../features/invoices/invoice.functions'

export const Route = createFileRoute('/upload')({
  loader: () => getCategoryCatalog(),
  component: UploadPage,
})

function UploadPage() {
  const categories = Route.useLoaderData()
  const navigate = useNavigate()
  const saveInvoice = useServerFn(saveImportedInvoiceAction)

  if (categories.length === 0) {
    return (
      <div className="page-shell page-fade">
        <PageNotice
          eyebrow="Upload blocked"
          title="No category catalog is available."
          copy="Run the seeded migrations first so imported invoice lines can map to a stable category list."
        />
      </div>
    )
  }

  return (
    <UploadWorkflow
      categories={categories}
      onSave={({ draft, rawJson }) => saveInvoice({ data: { draft, rawJson } })}
      onSaved={(invoiceId) =>
        navigate({
          to: '/invoices/$invoiceId',
          params: { invoiceId },
        })
      }
    />
  )
}

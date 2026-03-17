import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
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

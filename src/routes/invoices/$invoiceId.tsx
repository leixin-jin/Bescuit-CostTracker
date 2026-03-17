import { useEffect, useState } from 'react'
import {
  Link,
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { InvoiceEditor } from '../../features/invoices/InvoiceEditor'
import {
  deleteInvoiceAction,
  getCategoryCatalog,
  getInvoiceDetailQuery,
  updateInvoiceAction,
} from '../../features/invoices/invoice.functions'
import {
  formatIssuePath,
  sanitizeInvoiceDraft,
} from '../../features/invoices/normalize'
import type { InvoiceValidationIssue } from '../../features/invoices/normalize'
import { formatCurrency } from '../../lib/utils'
import { defaultInvoiceSearch } from '../../features/invoices/schema'
import type { InvoiceDraft } from '../../features/invoices/schema'

export const Route = createFileRoute('/invoices/$invoiceId')({
  loader: async ({ params }) => {
    const [categories, detail] = await Promise.all([
      getCategoryCatalog(),
      getInvoiceDetailQuery({ data: { invoiceId: params.invoiceId } }),
    ])

    return { categories, detail }
  },
  component: InvoiceDetailPage,
})

function InvoiceDetailPage() {
  const { categories, detail } = Route.useLoaderData()
  const navigate = useNavigate()
  const router = useRouter()
  const updateInvoice = useServerFn(updateInvoiceAction)
  const deleteInvoice = useServerFn(deleteInvoiceAction)
  const [draft, setDraft] = useState<InvoiceDraft | null>(detail?.draft ?? null)
  const [issues, setIssues] = useState<InvoiceValidationIssue[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(detail?.draft ?? null)
    setIssues([])
    setWarnings([])
    setSaveError(null)
  }, [detail])

  if (!detail || !draft) {
    return (
      <div className="page-shell page-fade">
        <section className="surface-panel hero-panel">
          <p className="eyebrow">Invoice detail</p>
          <h2 className="page-title">Invoice not found.</h2>
          <p className="page-copy">
            The record may have been deleted or the link is stale.
          </p>
          <div className="hero-actions" style={{ marginTop: '1rem' }}>
            <Link
              to="/invoices"
              search={defaultInvoiceSearch}
              className="button button-secondary"
            >
              Back to invoices
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const invoice = detail

  async function handleSave() {
    if (!draft) {
      return
    }

    const sanitized = sanitizeInvoiceDraft(draft, categories)

    if (!sanitized.success) {
      setIssues(sanitized.errors)
      return
    }

    setDraft(sanitized.draft)
    setWarnings(sanitized.warnings)
    setIssues([])
    setSaveError(null)
    setIsSaving(true)

    try {
      await updateInvoice({
        data: {
          invoiceId: invoice.id,
          draft: sanitized.draft,
        },
      })

      await router.invalidate()
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Invoice update failed.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!draft) {
      return
    }

    const confirmed = window.confirm(
      'Delete this invoice? Invoice items will be removed as well.',
    )

    if (!confirmed) {
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      await deleteInvoice({ data: { invoiceId: invoice.id } })
      navigate({ to: '/invoices', search: defaultInvoiceSearch })
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Invoice deletion failed.',
      )
      setIsSaving(false)
    }
  }

  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <p className="eyebrow">Invoice detail</p>
        <h2 className="page-title">
          {draft.invoiceNumber || 'Sin numero'} · {draft.supplierName}
        </h2>
        <p className="page-copy">
          Update the invoice header, supplier metadata, or line items. Deletes
          cascade through `invoice_items`, so the registry and supplier summary
          stay clean.
        </p>
        <div className="hero-actions" style={{ marginTop: '1rem' }}>
          <Link
            to="/invoices"
            search={defaultInvoiceSearch}
            className="button button-secondary"
          >
            Back to invoices
          </Link>
          <button
            type="button"
            className="button"
            disabled={isSaving}
            onClick={() => void handleSave()}
          >
            {isSaving ? 'Working…' : 'Save changes'}
          </button>
          <button
            type="button"
            className="button button-secondary"
            disabled={isSaving}
            onClick={() => void handleDelete()}
          >
            Delete invoice
          </button>
        </div>
        <div className="pill-row" style={{ marginTop: '1rem' }}>
          <span className="badge badge-info">{draft.supplierName}</span>
          <span
            className={`badge ${
              draft.status === 'verified' ? 'badge-success' : 'badge-warning'
            }`}
          >
            {draft.status}
          </span>
          <span className="badge badge-info">{formatCurrency(draft.totalAmount)}</span>
        </div>
      </section>

      <section className="content-grid">
        <article className="surface-panel section-card">
          {issues.length > 0 ? (
            <div className="feedback-block feedback-block--danger">
              <p className="feedback-title">Validation errors</p>
              <ul className="feedback-list">
                {issues.map((issue) => (
                  <li key={`${issue.path}-${issue.message}`}>
                    <strong>{formatIssuePath(issue.path)}:</strong> {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {warnings.length > 0 ? (
            <div className="feedback-block feedback-block--warning">
              <p className="feedback-title">Draft warnings</p>
              <ul className="feedback-list">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {saveError ? (
            <p className="feedback-inline feedback-inline--danger">{saveError}</p>
          ) : null}

          <InvoiceEditor
            categories={categories}
            draft={draft}
            issues={issues}
            disabled={isSaving}
            onChange={setDraft}
          />
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">Audit trail</p>
          <h3 className="section-heading">Stored source payload</h3>
          <p className="section-copy">
            The original JSON is preserved on the invoice record for traceability.
          </p>
          <div className="stack-list" style={{ marginTop: '1rem' }}>
            <div className="stack-item">
              <span>Created at</span>
              <span className="stack-item__value">{invoice.createdAt}</span>
            </div>
            <div className="stack-item">
              <span>Updated at</span>
              <span className="stack-item__value">{invoice.updatedAt}</span>
            </div>
          </div>
          <pre className="code-preview" style={{ marginTop: '1rem' }}>
            {invoice.rawJson ?? 'No raw JSON stored for this invoice.'}
          </pre>
        </article>
      </section>
    </div>
  )
}

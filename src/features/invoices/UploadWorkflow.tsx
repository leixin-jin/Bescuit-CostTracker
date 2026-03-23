import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { EmptyStateCard } from '../../components/AppStates'
import { InvoiceEditor } from './InvoiceEditor'
import {
  formatIssuePath,
  parseImportedInvoiceText,
  sampleInvoiceJson,
  sanitizeInvoiceDraft,
} from './normalize'
import type { InvoiceValidationIssue } from './normalize'
import { defaultInvoiceSearch } from './schema'
import type { CategoryOption, InvoiceDraft } from './schema'

type UploadWorkflowProps = {
  categories: CategoryOption[]
  onSave: (input: {
    draft: InvoiceDraft
    rawJson: string
  }) => Promise<{ invoiceId: string }>
  onSaved: (invoiceId: string) => void
}

export function UploadWorkflow({
  categories,
  onSave,
  onSaved,
}: UploadWorkflowProps) {
  const [jsonInput, setJsonInput] = useState(sampleInvoiceJson)
  const [draft, setDraft] = useState<InvoiceDraft | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [issues, setIssues] = useState<InvoiceValidationIssue[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function handleParse() {
    const result = parseImportedInvoiceText(jsonInput, categories)

    setWarnings(result.warnings)
    setIssues(result.errors)
    setSaveError(null)

    if (result.success) {
      setDraft(result.draft)
      return
    }

    setDraft(null)
  }

  async function handleSave() {
    if (!draft) {
      setIssues([
        {
          path: 'form',
          message: 'Parse and review the invoice before saving.',
        },
      ])
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
      const result = await onSave({
        draft: sanitized.draft,
        rawJson: jsonInput,
      })

      onSaved(result.invoiceId)
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Invoice could not be saved.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <p className="eyebrow">Phase 2 importer</p>
        <h2 className="page-title">Paste, validate, correct, and save invoices.</h2>
        <p className="page-copy">
          The preview uses the same normalized invoice contract that the save
          flow persists into D1. Category mismatches fall back automatically and
          warnings stay visible before commit.
        </p>
      </section>

      <section className="route-grid">
        <article className="surface-panel section-card">
          <div className="field">
            <label htmlFor="json-paste">Invoice JSON</label>
            <textarea
              id="json-paste"
              className="text-area"
              value={jsonInput}
              onChange={(event) => setJsonInput(event.target.value)}
            />
          </div>

          <div className="action-row" style={{ marginTop: '1rem' }}>
            <button type="button" className="button button-secondary" onClick={() => setJsonInput(sampleInvoiceJson)}>
              Load sample
            </button>
            <button type="button" className="button" onClick={handleParse}>
              Parse preview
            </button>
          </div>

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

          {saveError ? (
            <p className="feedback-inline feedback-inline--danger">{saveError}</p>
          ) : null}
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">Preview status</p>
          {draft ? (
            <>
              <h3 className="section-heading">
                {draft.supplierName} · {draft.invoiceDate}
                {draft.invoiceNumber ? ` · ${draft.invoiceNumber}` : ''}
              </h3>
              <p className="section-copy">
                Review the normalized payload, correct any field inline, then
                persist it as a draft invoice.
              </p>
            </>
          ) : (
            <>
              <h3 className="section-heading">Waiting for a valid parse</h3>
              <p className="section-copy">
                Paste the Gemini JSON and run the preview to unlock inline
                corrections.
              </p>
            </>
          )}

          {warnings.length > 0 ? (
            <div className="feedback-block feedback-block--warning">
              <p className="feedback-title">Normalization warnings</p>
              <ul className="feedback-list">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="pill-row" style={{ marginTop: '1rem' }}>
            <span className="badge badge-info">{categories.length} categories ready</span>
            <span className="badge badge-success">Auto-create supplier</span>
            <span className="badge badge-warning">Saves as draft</span>
          </div>
        </article>
      </section>

      {draft ? (
        <section className="surface-panel section-card">
          <div className="section-card__header">
            <div>
              <p className="eyebrow">Editable preview</p>
              <h3 className="section-heading">Finalize invoice fields</h3>
            </div>
            <div className="action-row">
              <button
                type="button"
                className="button"
                disabled={isSaving}
                onClick={() => void handleSave()}
              >
                {isSaving ? 'Saving…' : 'Save invoice'}
              </button>
              <Link
                to="/invoices"
                search={defaultInvoiceSearch}
                className="button button-secondary"
              >
                Open registry
              </Link>
            </div>
          </div>

          <InvoiceEditor
            categories={categories}
            draft={draft}
            issues={issues}
            disabled={isSaving}
            onChange={setDraft}
          />
        </section>
      ) : (
        <section className="surface-panel section-card surface-muted">
          <EmptyStateCard
            icon="1"
            title="Invoice preview will appear here"
            copy="Load the sample payload or paste a supplier JSON document, then run Parse preview to review the normalized draft."
          />
        </section>
      )}
    </div>
  )
}

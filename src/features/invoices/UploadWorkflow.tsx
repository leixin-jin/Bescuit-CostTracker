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
          message: '请先解析并检查发票后再保存。',
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
        error instanceof Error ? error.message : '发票保存失败。',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <p className="eyebrow">发票导入器</p>
        <h2 className="page-title">粘贴、验证、修正并保存发票</h2>
        <p className="page-copy">
          预览使用与保存流程相同的归一化发票格式写入 D1。分类不匹配时自动回退，提交前警告保持可见。
        </p>
      </section>

      <section className="route-grid">
        <article className="surface-panel section-card">
          <div className="field">
            <label htmlFor="json-paste">发票 JSON</label>
            <textarea
              id="json-paste"
              className="text-area"
              value={jsonInput}
              onChange={(event) => setJsonInput(event.target.value)}
            />
          </div>

          <div className="action-row" style={{ marginTop: '1rem' }}>
            <button type="button" className="button button-secondary" onClick={() => setJsonInput(sampleInvoiceJson)}>
              加载示例
            </button>
            <button type="button" className="button" onClick={handleParse}>
              解析预览
            </button>
          </div>

          {issues.length > 0 ? (
            <div className="feedback-block feedback-block--danger">
              <p className="feedback-title">验证错误</p>
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
          <p className="eyebrow">预览状态</p>
          {draft ? (
            <>
              <h3 className="section-heading">
                {draft.supplierName} · {draft.invoiceDate}
                {draft.invoiceNumber ? ` · ${draft.invoiceNumber}` : ''}
              </h3>
              <p className="section-copy">
                检查归一化后的数据，逐字段修正，然后保存为草稿发票。
              </p>
            </>
          ) : (
            <>
              <h3 className="section-heading">等待有效的解析结果</h3>
              <p className="section-copy">
                粘贴 Gemini JSON 并运行预览，以解锁逐行修正功能。
              </p>
            </>
          )}

          {warnings.length > 0 ? (
            <div className="feedback-block feedback-block--warning">
              <p className="feedback-title">归一化警告</p>
              <ul className="feedback-list">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="pill-row" style={{ marginTop: '1rem' }}>
            <span className="badge badge-info">{categories.length} 个分类就绪</span>
            <span className="badge badge-success">自动创建供应商</span>
            <span className="badge badge-warning">保存为草稿</span>
          </div>
        </article>
      </section>

      {draft ? (
        <section className="surface-panel section-card">
          <div className="section-card__header">
            <div>
              <p className="eyebrow">可编辑预览</p>
              <h3 className="section-heading">完善发票字段</h3>
            </div>
            <div className="action-row">
              <button
                type="button"
                className="button"
                disabled={isSaving}
                onClick={() => void handleSave()}
              >
                {isSaving ? '保存中…' : '保存发票'}
              </button>
              <Link
                to="/invoices"
                search={defaultInvoiceSearch}
                className="button button-secondary"
              >
                打开登记簿
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
            title="发票预览将在此处显示"
            copy="加载示例数据或粘贴供应商 JSON 文档，然后点击“解析预览”查看归一化后的草稿。"
          />
        </section>
      )}
    </div>
  )
}

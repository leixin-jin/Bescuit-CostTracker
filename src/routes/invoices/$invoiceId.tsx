import { useEffect, useState } from 'react'
import {
  Link,
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { PageNotice } from '../../components/AppStates'
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
        <PageNotice
          eyebrow="发票详情"
          title="发票未找到"
          copy="该记录可能已被删除，或链接已失效。"
          actions={
            <Link
              to="/invoices"
              search={defaultInvoiceSearch}
              className="button button-secondary"
            >
              返回发票列表
            </Link>
          }
        />
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
        error instanceof Error ? error.message : '发票更新失败。',
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
      '确定删除此发票？发票行项也将一并删除。',
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
        error instanceof Error ? error.message : '发票删除失败。',
      )
      setIsSaving(false)
    }
  }

  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <p className="eyebrow">发票详情</p>
        <h2 className="page-title">
          {draft.invoiceNumber || '无编号'} · {draft.supplierName}
        </h2>
        <p className="page-copy">
          更新发票表头、供应商信息或行项。删除操作会级联清除 invoice_items，保持登记簿和供应商汇总数据整洁。
        </p>
        <div className="hero-actions" style={{ marginTop: '1rem' }}>
          <Link
            to="/invoices"
            search={defaultInvoiceSearch}
            className="button button-secondary"
          >
            返回发票列表
          </Link>
          <button
            type="button"
            className="button"
            disabled={isSaving}
            onClick={() => void handleSave()}
          >
            {isSaving ? '处理中…' : '保存更改'}
          </button>
          <button
            type="button"
            className="button button-secondary"
            disabled={isSaving}
            onClick={() => void handleDelete()}
          >
            删除发票
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

          {warnings.length > 0 ? (
            <div className="feedback-block feedback-block--warning">
              <p className="feedback-title">草稿警告</p>
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
          <p className="eyebrow">审计追踪</p>
          <h3 className="section-heading">存储的原始数据</h3>
          <p className="section-copy">
            原始 JSON 保存在发票记录中，用于溯源追踪。
          </p>
          <div className="stack-list" style={{ marginTop: '1rem' }}>
            <div className="stack-item">
              <span>创建时间</span>
              <span className="stack-item__value">{invoice.createdAt}</span>
            </div>
            <div className="stack-item">
              <span>更新时间</span>
              <span className="stack-item__value">{invoice.updatedAt}</span>
            </div>
          </div>
          <pre className="code-preview" style={{ marginTop: '1rem' }}>
            {invoice.rawJson ?? '本发票无原始 JSON 存储。'}
          </pre>
        </article>
      </section>
    </div>
  )
}

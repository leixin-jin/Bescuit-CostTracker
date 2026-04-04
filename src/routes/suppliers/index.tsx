import { useEffect, useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { EmptyStateCard } from '../../components/AppStates'
import {
  listSuppliersQuery,
  upsertSupplierAction,
} from '../../features/invoices/invoice.functions'
import { formatCurrency, formatShortDate } from '../../lib/utils'
import { defaultInvoiceSearch } from '../../features/invoices/schema'

type SupplierFormState = {
  id?: string
  name: string
  contact: string
  notes: string
  invoiceCount: number
  totalAmount: number
  lastPurchaseDate: string | null
}

export const Route = createFileRoute('/suppliers/')({
  loader: () => listSuppliersQuery(),
  component: SuppliersPage,
})

function SuppliersPage() {
  const router = useRouter()
  const saveSupplier = useServerFn(upsertSupplierAction)
  const suppliers = Route.useLoaderData()
  const [records, setRecords] = useState<SupplierFormState[]>(suppliers)
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    notes: '',
  })
  const [savingId, setSavingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    setRecords(suppliers)
  }, [suppliers])

  async function handleSaveSupplier(record: SupplierFormState) {
    setSavingId(record.id ?? 'new')
    setFeedback(null)

    try {
      await saveSupplier({
        data: {
          id: record.id,
          name: record.name,
          contact: record.contact,
          notes: record.notes,
        },
      })

      await router.invalidate()
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : '供应商保存失败。',
      )
    } finally {
      setSavingId(null)
    }
  }

  async function handleCreateSupplier() {
    if (!newSupplier.name.trim()) {
      setFeedback('供应商名称不能为空。')
      return
    }

    setSavingId('new')
    setFeedback(null)

    try {
      await saveSupplier({
        data: {
          name: newSupplier.name,
          contact: newSupplier.contact,
          notes: newSupplier.notes,
        },
      })

      setNewSupplier({
        name: '',
        contact: '',
        notes: '',
      })

      await router.invalidate()
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : '供应商创建失败。',
      )
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <p className="eyebrow">供应商目录</p>
        <h2 className="page-title">维护实时供应商记录与支出情况</h2>
        <p className="page-copy">
          导入的发票现在自动建立供应商档案。联系方式、运营备注、发票计数和总支出均由 D1 驱动。
        </p>
      </section>

      <section className="route-grid">
        <article className="surface-panel section-card">
          <div className="section-card__header">
            <div>
              <p className="eyebrow">创建供应商</p>
              <h3 className="section-heading">手动添加供应商记录</h3>
            </div>
          </div>

          <div className="two-column-grid">
            <div className="field">
              <label htmlFor="new-supplier-name">供应商名称</label>
              <input
                id="new-supplier-name"
                className="text-input"
                value={newSupplier.name}
                onChange={(event) =>
                  setNewSupplier((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="new-supplier-contact">联系方式</label>
              <input
                id="new-supplier-contact"
                className="text-input"
                value={newSupplier.contact}
                onChange={(event) =>
                  setNewSupplier((previous) => ({
                    ...previous,
                    contact: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="new-supplier-notes">备注</label>
            <textarea
              id="new-supplier-notes"
              className="text-area text-area--compact"
              value={newSupplier.notes}
              onChange={(event) =>
                setNewSupplier((previous) => ({
                  ...previous,
                  notes: event.target.value,
                }))
              }
            />
          </div>

          <div className="action-row" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="button"
              disabled={savingId === 'new'}
              onClick={() => void handleCreateSupplier()}
            >
              {savingId === 'new' ? '保存中…' : '添加供应商'}
            </button>
          </div>

          {feedback ? (
            <p className="feedback-inline feedback-inline--danger">{feedback}</p>
          ) : null}
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">登记汇总</p>
          <h3 className="section-heading">当前供应商覆盖</h3>
          <ul className="stack-list" style={{ marginTop: '1rem' }}>
            <li className="stack-item">
              <span>供应商数</span>
              <span className="stack-item__value">{records.length}</span>
            </li>
            <li className="stack-item">
              <span>总支出</span>
              <span className="stack-item__value">
                {formatCurrency(
                  records.reduce((sum, record) => sum + record.totalAmount, 0),
                )}
              </span>
            </li>
            <li className="stack-item">
              <span>有发票的供应商</span>
              <span className="stack-item__value">
                {records.filter((record) => record.invoiceCount > 0).length}
              </span>
            </li>
          </ul>
        </article>
      </section>

      <section className="three-column-grid">
        {records.length > 0 ? (
          records.map((supplier, index) => (
            <article
              key={supplier.id ?? `${supplier.name}-${index}`}
              className="surface-panel section-card"
            >
              <div className="field">
                <label htmlFor={`supplier-name-${supplier.id}`}>供应商</label>
                <input
                  id={`supplier-name-${supplier.id}`}
                  className="text-input"
                  value={supplier.name}
                  onChange={(event) =>
                    setRecords((previous) =>
                      previous.map((record) =>
                        record.id === supplier.id
                          ? { ...record, name: event.target.value }
                          : record,
                      ),
                    )
                  }
                />
              </div>

              <div className="field">
                <label htmlFor={`supplier-contact-${supplier.id}`}>联系方式</label>
                <input
                  id={`supplier-contact-${supplier.id}`}
                  className="text-input"
                  value={supplier.contact}
                  onChange={(event) =>
                    setRecords((previous) =>
                      previous.map((record) =>
                        record.id === supplier.id
                          ? { ...record, contact: event.target.value }
                          : record,
                      ),
                    )
                  }
                />
              </div>

              <div className="field">
                <label htmlFor={`supplier-notes-${supplier.id}`}>备注</label>
                <textarea
                  id={`supplier-notes-${supplier.id}`}
                  className="text-area text-area--compact"
                  value={supplier.notes}
                  onChange={(event) =>
                    setRecords((previous) =>
                      previous.map((record) =>
                        record.id === supplier.id
                          ? { ...record, notes: event.target.value }
                          : record,
                      ),
                    )
                  }
                />
              </div>

              <ul className="stack-list" style={{ marginTop: '1rem' }}>
                <li className="stack-item">
                  <span>发票数</span>
                  <span className="stack-item__value">{supplier.invoiceCount}</span>
                </li>
                <li className="stack-item">
                  <span>总支出</span>
                  <span className="stack-item__value">
                    {formatCurrency(supplier.totalAmount)}
                  </span>
                </li>
                <li className="stack-item">
                  <span>最近采购</span>
                  <span className="stack-item__value">
                    {supplier.lastPurchaseDate
                      ? formatShortDate(supplier.lastPurchaseDate)
                      : 'N/A'}
                  </span>
                </li>
              </ul>

              <div className="action-row" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="button"
                  disabled={savingId === supplier.id}
                  onClick={() => void handleSaveSupplier(supplier)}
                >
                  {savingId === supplier.id ? '保存中…' : '保存供应商'}
                </button>
              </div>
            </article>
          ))
        ) : (
          <article className="surface-panel section-card supplier-empty-card">
            <EmptyStateCard
              title="暂无供应商数据"
              copy="手动创建供应商或导入第一张发票，以自动建立供应商目录及支出汇总。"
              action={
                <Link
                  to="/invoices"
                  search={defaultInvoiceSearch}
                  className="button button-secondary"
                >
                  查看发票
                </Link>
              }
            />
          </article>
        )}
      </section>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  listSuppliersQuery,
  upsertSupplierAction,
} from '../../features/invoices/invoice.functions'
import { formatCurrency, formatShortDate } from '../../lib/utils'

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
        error instanceof Error ? error.message : 'Supplier save failed.',
      )
    } finally {
      setSavingId(null)
    }
  }

  async function handleCreateSupplier() {
    if (!newSupplier.name.trim()) {
      setFeedback('Supplier name is required.')
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
        error instanceof Error ? error.message : 'Supplier creation failed.',
      )
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <p className="eyebrow">Supplier directory</p>
        <h2 className="page-title">Maintain live supplier records and spend context.</h2>
        <p className="page-copy">
          Imported invoices now bootstrap the supplier registry automatically.
          Contact fields, operational notes, invoice counts, and total spend are
          all driven by D1.
        </p>
      </section>

      <section className="route-grid">
        <article className="surface-panel section-card">
          <div className="section-card__header">
            <div>
              <p className="eyebrow">Create supplier</p>
              <h3 className="section-heading">Add a manual supplier record</h3>
            </div>
          </div>

          <div className="two-column-grid">
            <div className="field">
              <label htmlFor="new-supplier-name">Supplier name</label>
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
              <label htmlFor="new-supplier-contact">Contact</label>
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
            <label htmlFor="new-supplier-notes">Notes</label>
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
              {savingId === 'new' ? 'Saving…' : 'Add supplier'}
            </button>
          </div>

          {feedback ? (
            <p className="feedback-inline feedback-inline--danger">{feedback}</p>
          ) : null}
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">Registry totals</p>
          <h3 className="section-heading">Current supplier coverage</h3>
          <ul className="stack-list" style={{ marginTop: '1rem' }}>
            <li className="stack-item">
              <span>Suppliers</span>
              <span className="stack-item__value">{records.length}</span>
            </li>
            <li className="stack-item">
              <span>Total spend</span>
              <span className="stack-item__value">
                {formatCurrency(
                  records.reduce((sum, record) => sum + record.totalAmount, 0),
                )}
              </span>
            </li>
            <li className="stack-item">
              <span>Suppliers with invoices</span>
              <span className="stack-item__value">
                {records.filter((record) => record.invoiceCount > 0).length}
              </span>
            </li>
          </ul>
        </article>
      </section>

      <section className="three-column-grid">
        {records.map((supplier, index) => (
          <article
            key={supplier.id ?? `${supplier.name}-${index}`}
            className="surface-panel section-card"
          >
            <div className="field">
              <label htmlFor={`supplier-name-${supplier.id}`}>Supplier</label>
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
              <label htmlFor={`supplier-contact-${supplier.id}`}>Contact</label>
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
              <label htmlFor={`supplier-notes-${supplier.id}`}>Notes</label>
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
                <span>Invoices</span>
                <span className="stack-item__value">{supplier.invoiceCount}</span>
              </li>
              <li className="stack-item">
                <span>Total spend</span>
                <span className="stack-item__value">
                  {formatCurrency(supplier.totalAmount)}
                </span>
              </li>
              <li className="stack-item">
                <span>Last purchase</span>
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
                {savingId === supplier.id ? 'Saving…' : 'Save supplier'}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

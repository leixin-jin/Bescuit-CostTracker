import type { ReactNode } from 'react'
import { cn, formatCurrency } from '../../lib/utils'
import {
  calculateInvoiceTotal,
  calculateItemTotal,
  createEmptyInvoiceItemDraft,
  groupIssuesByPath,
} from './normalize'
import type { InvoiceValidationIssue } from './normalize'
import type { CategoryOption, InvoiceDraft, InvoiceStatus } from './schema'

type InvoiceEditorProps = {
  draft: InvoiceDraft
  categories: CategoryOption[]
  issues: InvoiceValidationIssue[]
  disabled?: boolean
  allowStatusEdit?: boolean
  onChange: (draft: InvoiceDraft) => void
}

export function InvoiceEditor({
  draft,
  categories,
  issues,
  disabled = false,
  allowStatusEdit = true,
  onChange,
}: InvoiceEditorProps) {
  const categoryNames = categories.map((category) => category.name)
  const issuesByPath = groupIssuesByPath(issues)
  const computedTotal = calculateInvoiceTotal(draft.items)

  function updateDraft<TField extends keyof InvoiceDraft>(
    field: TField,
    value: InvoiceDraft[TField],
  ) {
    onChange({
      ...draft,
      [field]: value,
    })
  }

  function updateItemString(
    index: number,
    field: 'productName' | 'categoryName' | 'unit' | 'itemDate',
    value: string,
  ) {
    const nextItems = draft.items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    )

    updateDraft('items', nextItems)
  }

  function updateItemNumber(
    index: number,
    field: 'quantity' | 'unitPrice' | 'taxRate',
    value: number,
  ) {
    const nextItems = draft.items.map((item, itemIndex) => {
      if (itemIndex !== index) {
        return item
      }

      const nextItem = {
        ...item,
        [field]: value,
      }

      return {
        ...nextItem,
        totalPrice: calculateItemTotal(nextItem),
      }
    })

    updateDraft('items', nextItems)
  }

  function addItem() {
    updateDraft('items', [...draft.items, createEmptyInvoiceItemDraft(draft.invoiceDate)])
  }

  function removeItem(index: number) {
    updateDraft(
      'items',
      draft.items.filter((_, itemIndex) => itemIndex !== index),
    )
  }

  function syncInvoiceTotal() {
    updateDraft('totalAmount', computedTotal)
  }

  return (
    <div className="field-grid">
      <div className="two-column-grid">
        <Field
          error={issuesByPath.supplierName?.[0]}
          label="Supplier"
          htmlFor="supplier-name"
        >
          <input
            id="supplier-name"
            className={cn('text-input', issuesByPath.supplierName && 'is-invalid')}
            disabled={disabled}
            value={draft.supplierName}
            onChange={(event) => updateDraft('supplierName', event.target.value)}
          />
        </Field>

        <Field
          error={issuesByPath.invoiceDate?.[0]}
          label="Invoice date"
          htmlFor="invoice-date"
        >
          <input
            id="invoice-date"
            className={cn('text-input', issuesByPath.invoiceDate && 'is-invalid')}
            disabled={disabled}
            type="date"
            value={draft.invoiceDate}
            onChange={(event) => updateDraft('invoiceDate', event.target.value)}
          />
        </Field>

        <Field
          error={issuesByPath.invoiceNumber?.[0]}
          label="Invoice number"
          htmlFor="invoice-number"
        >
          <input
            id="invoice-number"
            className={cn('text-input', issuesByPath.invoiceNumber && 'is-invalid')}
            disabled={disabled}
            placeholder="Optional"
            value={draft.invoiceNumber}
            onChange={(event) => updateDraft('invoiceNumber', event.target.value)}
          />
        </Field>

        <Field
          error={issuesByPath.status?.[0]}
          label="Status"
          htmlFor="invoice-status"
        >
          <select
            id="invoice-status"
            className={cn('select-input', issuesByPath.status && 'is-invalid')}
            disabled={disabled || !allowStatusEdit}
            value={draft.status}
            onChange={(event) =>
              updateDraft('status', event.target.value as InvoiceStatus)
            }
          >
            <option value="draft">draft</option>
            <option value="verified">verified</option>
          </select>
        </Field>

        <Field
          error={issuesByPath.supplierContact?.[0]}
          label="Supplier contact"
          htmlFor="supplier-contact"
        >
          <input
            id="supplier-contact"
            className={cn(
              'text-input',
              issuesByPath.supplierContact && 'is-invalid',
            )}
            disabled={disabled}
            placeholder="Optional"
            value={draft.supplierContact}
            onChange={(event) =>
              updateDraft('supplierContact', event.target.value)
            }
          />
        </Field>

        <Field
          error={issuesByPath.totalAmount?.[0]}
          label="Declared total"
          htmlFor="invoice-total"
        >
          <div className="field-inline">
            <input
              id="invoice-total"
              className={cn(
                'text-input',
                issuesByPath.totalAmount && 'is-invalid',
              )}
              disabled={disabled}
              type="number"
              min="0"
              step="0.01"
              value={draft.totalAmount}
              onChange={(event) =>
                updateDraft('totalAmount', readNumber(event.target.value))
              }
            />
            <button
              type="button"
              className="button button-secondary"
              disabled={disabled}
              onClick={syncInvoiceTotal}
            >
              Sync lines
            </button>
          </div>
        </Field>
      </div>

      <Field
        error={issuesByPath.supplierNotes?.[0]}
        label="Supplier notes"
        htmlFor="supplier-notes"
      >
        <textarea
          id="supplier-notes"
          className={cn(
            'text-area text-area--compact',
            issuesByPath.supplierNotes && 'is-invalid',
          )}
          disabled={disabled}
          placeholder="Negotiation notes, delivery caveats, payment behavior..."
          value={draft.supplierNotes}
          onChange={(event) => updateDraft('supplierNotes', event.target.value)}
        />
      </Field>

      <Field error={issuesByPath.notes?.[0]} label="Invoice notes" htmlFor="invoice-notes">
        <textarea
          id="invoice-notes"
          className={cn(
            'text-area text-area--compact',
            issuesByPath.notes && 'is-invalid',
          )}
          disabled={disabled}
          placeholder="Internal notes for this invoice"
          value={draft.notes}
          onChange={(event) => updateDraft('notes', event.target.value)}
        />
      </Field>

      <div className="summary-grid">
        <article className="surface-panel section-card surface-muted">
          <p className="metric-label">Lines</p>
          <p className="metric-value metric-value--compact">{draft.items.length}</p>
        </article>
        <article className="surface-panel section-card surface-muted">
          <p className="metric-label">Computed lines</p>
          <p className="metric-value metric-value--compact">
            {formatCurrency(computedTotal)}
          </p>
        </article>
        <article className="surface-panel section-card surface-muted">
          <p className="metric-label">Declared total</p>
          <p className="metric-value metric-value--compact">
            {formatCurrency(draft.totalAmount)}
          </p>
        </article>
      </div>

      <div className="table-shell">
        <table className="data-table invoice-editor-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoria</th>
              <th>Cantidad</th>
              <th>Unidad</th>
              <th>Unitario</th>
              <th>IVA</th>
              <th>Total</th>
              <th>Fecha</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {draft.items.map((item, index) => {
              const productPath = `items.${index}.productName`
              const categoryPath = `items.${index}.categoryName`
              const quantityPath = `items.${index}.quantity`
              const unitPath = `items.${index}.unit`
              const pricePath = `items.${index}.unitPrice`
              const taxPath = `items.${index}.taxRate`
              const datePath = `items.${index}.itemDate`

              return (
                <tr key={item.id ?? `${item.productName}-${index}`}>
                  <td>
                    <input
                      className={cn(
                        'table-input',
                        issuesByPath[productPath] && 'is-invalid',
                      )}
                      disabled={disabled}
                      value={item.productName}
                      onChange={(event) =>
                        updateItemString(index, 'productName', event.target.value)
                      }
                    />
                    <FieldError message={issuesByPath[productPath]?.[0]} />
                  </td>
                  <td>
                    <input
                      className={cn(
                        'table-input',
                        issuesByPath[categoryPath] && 'is-invalid',
                      )}
                      disabled={disabled}
                      list="invoice-categories"
                      value={item.categoryName}
                      onChange={(event) =>
                        updateItemString(index, 'categoryName', event.target.value)
                      }
                    />
                    <FieldError message={issuesByPath[categoryPath]?.[0]} />
                  </td>
                  <td>
                    <input
                      className={cn(
                        'table-input',
                        issuesByPath[quantityPath] && 'is-invalid',
                      )}
                      disabled={disabled}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItemNumber(index, 'quantity', readNumber(event.target.value))
                      }
                    />
                    <FieldError message={issuesByPath[quantityPath]?.[0]} />
                  </td>
                  <td>
                    <input
                      className={cn(
                        'table-input',
                        issuesByPath[unitPath] && 'is-invalid',
                      )}
                      disabled={disabled}
                      value={item.unit}
                      onChange={(event) =>
                        updateItemString(index, 'unit', event.target.value)
                      }
                    />
                    <FieldError message={issuesByPath[unitPath]?.[0]} />
                  </td>
                  <td>
                    <input
                      className={cn(
                        'table-input',
                        issuesByPath[pricePath] && 'is-invalid',
                      )}
                      disabled={disabled}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(event) =>
                        updateItemNumber(index, 'unitPrice', readNumber(event.target.value))
                      }
                    />
                    <FieldError message={issuesByPath[pricePath]?.[0]} />
                  </td>
                  <td>
                    <input
                      className={cn(
                        'table-input',
                        issuesByPath[taxPath] && 'is-invalid',
                      )}
                      disabled={disabled}
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={item.taxRate}
                      onChange={(event) =>
                        updateItemNumber(index, 'taxRate', readNumber(event.target.value))
                      }
                    />
                    <FieldError message={issuesByPath[taxPath]?.[0]} />
                  </td>
                  <td>
                    <div className="table-static">{formatCurrency(item.totalPrice)}</div>
                  </td>
                  <td>
                    <input
                      className={cn(
                        'table-input',
                        issuesByPath[datePath] && 'is-invalid',
                      )}
                      disabled={disabled}
                      type="date"
                      value={item.itemDate}
                      onChange={(event) =>
                        updateItemString(index, 'itemDate', event.target.value)
                      }
                    />
                    <FieldError message={issuesByPath[datePath]?.[0]} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="button button-secondary button-icon"
                      disabled={disabled || draft.items.length === 1}
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="action-row">
        <button
          type="button"
          className="button button-secondary"
          disabled={disabled}
          onClick={addItem}
        >
          Add line
        </button>
      </div>

      <datalist id="invoice-categories">
        {categoryNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </div>
  )
}

function Field({
  children,
  error,
  htmlFor,
  label,
}: {
  children: ReactNode
  error?: string
  htmlFor: string
  label: string
}) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      <FieldError message={error} />
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="field-error">{message}</p>
}

function readNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

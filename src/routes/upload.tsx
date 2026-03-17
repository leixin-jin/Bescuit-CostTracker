import { createFileRoute } from '@tanstack/react-router'

const sampleJson = `{
  "fecha": "2026-03-16",
  "proveedor": "Makro",
  "num_albaran": "ALB-2026-0342",
  "items": [
    {
      "producto": "Aceite de oliva virgen extra 5L",
      "categoria": "Aceite",
      "cantidad": 3,
      "unidad": "ud",
      "precio_unitario": 8.5,
      "iva": 0.1,
      "precio_total": 28.05
    },
    {
      "producto": "Pollo entero",
      "categoria": "Carne",
      "cantidad": 10,
      "unidad": "kg",
      "precio_unitario": 3.2,
      "iva": 0.1,
      "precio_total": 35.2
    }
  ],
  "total_factura": 63.25
}`

const previewItems = [
  {
    product: 'Aceite de oliva virgen extra 5L',
    qty: '3 ud',
    unitPrice: '8.50',
    total: '28.05',
  },
  { product: 'Pollo entero', qty: '10 kg', unitPrice: '3.20', total: '35.20' },
] as const

export const Route = createFileRoute('/upload')({ component: UploadPage })

function UploadPage() {
  return (
    <div className="page-shell page-fade">
      <section className="surface-panel hero-panel">
        <p className="eyebrow">Phase 2 target</p>
        <h2 className="page-title">
          Paste Gemini JSON and confirm before saving.
        </h2>
        <p className="page-copy">
          The route shell is ready. Phase 2 will connect textarea parsing, Zod
          validation, inline corrections, and the supplier auto-create save
          action.
        </p>
      </section>

      <section className="route-grid">
        <article className="surface-panel section-card">
          <div className="field">
            <label htmlFor="json-paste">Invoice JSON</label>
            <pre id="json-paste" className="code-preview">
              {sampleJson}
            </pre>
          </div>
          <div className="action-row" style={{ marginTop: '1rem' }}>
            <button type="button" className="button button-secondary" disabled>
              Paste JSON
            </button>
            <button type="button" className="button" disabled>
              Parse preview
            </button>
          </div>
        </article>

        <article className="surface-panel section-card surface-muted">
          <p className="eyebrow">Preview structure</p>
          <h3 className="section-heading">
            Makro · 2026-03-16 · ALB-2026-0342
          </h3>
          <div className="table-shell" style={{ marginTop: '1rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Unitario</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {previewItems.map((item) => (
                  <tr key={item.product}>
                    <td>{item.product}</td>
                    <td>{item.qty}</td>
                    <td>EUR {item.unitPrice}</td>
                    <td>EUR {item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pill-row" style={{ marginTop: '1rem' }}>
            <span className="badge badge-info">Validator pending</span>
            <span className="badge badge-warning">Editable cells next</span>
            <span className="badge badge-success">Schema prepared</span>
          </div>
        </article>
      </section>
    </div>
  )
}

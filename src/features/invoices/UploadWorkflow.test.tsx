import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { UploadWorkflow } from './UploadWorkflow'
import { getFallbackCategories } from './normalize'

type MockLinkProps = {
  children?: ReactNode
  className?: string
  search?: unknown
  to: string
}

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className, to }: MockLinkProps) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}))

describe('UploadWorkflow', () => {
  it('parses the sample payload and submits the sanitized draft', async () => {
    const onSave = vi.fn().mockResolvedValue({ invoiceId: 'inv-1' })
    const onSaved = vi.fn()

    render(
      <UploadWorkflow
        categories={getFallbackCategories()}
        onSave={onSave}
        onSaved={onSaved}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '解析预览' }))

    expect(
      await screen.findByRole('heading', { name: '完善发票字段' }),
    ).toBeTruthy()

    fireEvent.change(screen.getByLabelText('供应商'), {
      target: { value: 'Makro Barcelona' },
    })

    fireEvent.click(screen.getByRole('button', { name: '保存发票' }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1)
    })

    expect(onSave.mock.calls[0]?.[0]).toMatchObject({
      rawJson: expect.stringContaining('"proveedor": "Makro"'),
      draft: expect.objectContaining({
        supplierName: 'Makro Barcelona',
        invoiceDate: '2026-03-16',
        status: 'draft',
      }),
    })
    expect(onSaved).toHaveBeenCalledWith('inv-1')
  })

  it('surfaces validation feedback when the pasted JSON is invalid', async () => {
    const onSave = vi.fn().mockResolvedValue({ invoiceId: 'inv-1' })
    const onSaved = vi.fn()

    render(
      <UploadWorkflow
        categories={getFallbackCategories()}
        onSave={onSave}
        onSaved={onSaved}
      />,
    )

    fireEvent.change(screen.getByLabelText('发票 JSON'), {
      target: { value: '{broken' },
    })
    fireEvent.click(screen.getByRole('button', { name: '解析预览' }))

    expect(await screen.findByText('验证错误')).toBeTruthy()
    expect(
      screen.getByText('JSON:', { exact: false }).textContent,
    ).toContain('JSON')
    expect(onSave).not.toHaveBeenCalled()
  })
})

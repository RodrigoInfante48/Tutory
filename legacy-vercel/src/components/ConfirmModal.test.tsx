import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmModal from './ConfirmModal'

function renderModal(overrides: Partial<React.ComponentProps<typeof ConfirmModal>> = {}) {
  const props = {
    title: 'Eliminar elemento',
    description: '¿Estás seguro?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  }
  render(<ConfirmModal {...props} />)
  return props
}

describe('ConfirmModal', () => {
  it('renders title and description', () => {
    renderModal()
    expect(screen.getByText('Eliminar elemento')).toBeInTheDocument()
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
  })

  it('calls onConfirm when the confirm button is clicked', async () => {
    const user = userEvent.setup()
    const { onConfirm, onCancel } = renderModal({ confirmLabel: 'Confirmar' })

    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup()
    const { onConfirm, onCancel } = renderModal()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onCancel when the Escape key is pressed', () => {
    const { onCancel } = renderModal()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('does not call onCancel for other keys', () => {
    const { onCancel } = renderModal()

    fireEvent.keyDown(document, { key: 'Enter' })

    expect(onCancel).not.toHaveBeenCalled()
  })

  it('uses the danger style when danger=true', () => {
    renderModal({ danger: true, confirmLabel: 'Borrar' })
    const confirmBtn = screen.getByRole('button', { name: 'Borrar' })
    expect(confirmBtn.className).toMatch(/bg-red/)
  })
})

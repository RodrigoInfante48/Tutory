import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

function Bomb(): never {
  throw new Error('test error')
}

// Suppress React's error boundary console output during these tests
const consoleError = vi.spyOn(console, 'error')
beforeAll(() => consoleError.mockImplementation(() => {}))
afterAll(() => consoleError.mockRestore())

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary section="test">
        <p>hello</p>
      </ErrorBoundary>
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('renders the fallback UI when a child throws', () => {
    render(
      <ErrorBoundary section="dashboard">
        <Bomb />
      </ErrorBoundary>
    )
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
    expect(screen.getByText(/dashboard/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /recargar/i })).toBeInTheDocument()
  })

  it('does not show fallback when there is no error', () => {
    render(
      <ErrorBoundary section="test">
        <p>ok</p>
      </ErrorBoundary>
    )
    expect(screen.queryByText('Algo salió mal')).not.toBeInTheDocument()
  })
})

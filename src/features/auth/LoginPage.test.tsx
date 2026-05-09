import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import { useAuth } from './AuthContext'

vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockSignIn = vi.fn()

function makeAuthContext(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  return {
    appUser: null,
    session: null,
    loading: false,
    profileMissing: false,
    signIn: mockSignIn,
    signOut: vi.fn(),
    ...overrides,
  }
}

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useAuth).mockReturnValue(makeAuthContext())
})

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })

  it('submit button is disabled when fields are empty', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeDisabled()
  })

  it('submit button becomes enabled when both fields have values', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'secret')

    expect(screen.getByRole('button', { name: /ingresar/i })).not.toBeDisabled()
  })

  it('shows error message when signIn returns an error', async () => {
    mockSignIn.mockResolvedValueOnce({ error: 'Invalid credentials' })
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/correo electrónico/i), 'bad@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText(/correo o contraseña incorrectos/i)).toBeInTheDocument()
  })

  it('does not show error initially', () => {
    renderLoginPage()
    expect(screen.queryByText(/correo o contraseña incorrectos/i)).not.toBeInTheDocument()
  })

  it('calls signIn with trimmed email and password on submit', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null })
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/correo electrónico/i), '  user@example.com  ')
    await user.type(screen.getByLabelText(/contraseña/i), 'mypassword')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'mypassword')
  })
})

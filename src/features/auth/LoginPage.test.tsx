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

async function enterPin(user: ReturnType<typeof userEvent.setup>, pin: string) {
  for (const digit of pin) {
    await user.click(screen.getByRole('button', { name: digit }))
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useAuth).mockReturnValue(makeAuthContext())
})

describe('LoginPage', () => {
  it('renders email field and PIN keypad', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/teclado numérico/i)).toBeInTheDocument()
  })

  it('renders all 10 digit keys plus delete and confirm', () => {
    renderLoginPage()
    for (const digit of ['0','1','2','3','4','5','6','7','8','9']) {
      expect(screen.getByRole('button', { name: digit })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: /borrar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument()
  })

  it('keypad is visually disabled when email is empty', () => {
    renderLoginPage()
    const pad = screen.getByLabelText(/teclado numérico/i)
    expect(pad.className).toContain('pin-pad-disabled')
  })

  it('keypad becomes active after typing email', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com')

    const pad = screen.getByLabelText(/teclado numérico/i)
    expect(pad.className).not.toContain('pin-pad-disabled')
  })

  it('PIN dots fill as digits are entered', async () => {
    const user = userEvent.setup()
    renderLoginPage()
    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com')

    const dotsBefore = document.querySelectorAll('.pin-dot-filled')
    expect(dotsBefore).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: '1' }))
    expect(document.querySelectorAll('.pin-dot-filled')).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: '2' }))
    expect(document.querySelectorAll('.pin-dot-filled')).toHaveLength(2)
  })

  it('delete key removes last digit', async () => {
    const user = userEvent.setup()
    renderLoginPage()
    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com')

    await user.click(screen.getByRole('button', { name: '5' }))
    await user.click(screen.getByRole('button', { name: '3' }))
    expect(document.querySelectorAll('.pin-dot-filled')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: /borrar/i }))
    expect(document.querySelectorAll('.pin-dot-filled')).toHaveLength(1)
  })

  it('auto-submits when 4th digit is pressed', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null })
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/correo electrónico/i), 'user@example.com')
    await enterPin(user, '1234')

    expect(mockSignIn).toHaveBeenCalledWith('user@example.com', '1234')
  })

  it('confirm button also triggers submit with 4 digits', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null })
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/correo electrónico/i), 'user@example.com')
    await user.click(screen.getByRole('button', { name: '1' }))
    await user.click(screen.getByRole('button', { name: '2' }))
    await user.click(screen.getByRole('button', { name: '3' }))
    await user.click(screen.getByRole('button', { name: '4' }))

    expect(mockSignIn).toHaveBeenCalledWith('user@example.com', '1234')
  })

  it('shows error and clears PIN when signIn returns an error', async () => {
    mockSignIn.mockResolvedValueOnce({ error: 'Invalid credentials' })
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/correo electrónico/i), 'bad@example.com')
    await enterPin(user, '0000')

    expect(await screen.findByText(/correo o pin incorrectos/i)).toBeInTheDocument()
    expect(document.querySelectorAll('.pin-dot-filled')).toHaveLength(0)
  })

  it('does not show error initially', () => {
    renderLoginPage()
    expect(screen.queryByText(/correo o pin incorrectos/i)).not.toBeInTheDocument()
  })

  it('does not call signIn with fewer than 4 digits via confirm button', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/correo electrónico/i), 'user@example.com')
    await user.click(screen.getByRole('button', { name: '1' }))
    await user.click(screen.getByRole('button', { name: '2' }))
    await user.click(screen.getByRole('button', { name: /confirmar/i }))

    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('trims email before sending to signIn', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null })
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/correo electrónico/i), '  user@example.com  ')
    await enterPin(user, '9876')

    expect(mockSignIn).toHaveBeenCalledWith('user@example.com', '9876')
  })
})

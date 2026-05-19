import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth, type UserRole } from './AuthContext'

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
}

const PAD_KEYS = ['1','2','3','4','5','6','7','8','9','⌫','0','→'] as const

export default function LoginPage() {
  const { signIn, appUser, profileMissing } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const passwordResetSuccess = (location.state as { passwordReset?: boolean } | null)?.passwordReset === true

  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  useEffect(() => {
    if (appUser) {
      navigate(ROLE_HOME[appUser.role], { replace: true })
      return
    }
    if (submitted && profileMissing) {
      setLoading(false)
      setSubmitted(false)
      setError('Cuenta en configuración, contacta a tu profe')
      triggerShake()
    }
  }, [appUser, profileMissing, submitted, navigate])

  const submit = async (pinValue: string) => {
    if (!email.trim() || pinValue.length !== 4 || loading) return
    setError(null)
    setLoading(true)

    const { error: signInError } = await signIn(email.trim(), pinValue + '00')

    if (signInError) {
      setLoading(false)
      setPin('')
      setError('Correo o PIN incorrectos')
      triggerShake()
      return
    }

    setSubmitted(true)
  }

  const handleKey = (key: typeof PAD_KEYS[number]) => {
    if (loading) return
    if (key === '⌫') {
      setPin(p => p.slice(0, -1))
      return
    }
    if (key === '→') {
      if (pin.length === 4) submit(pin)
      return
    }
    if (pin.length >= 4) return
    const next = pin + key
    setPin(next)
    if (next.length === 4) submit(next)
  }

  const emailReady = email.trim().length > 0
  const padDisabled = !emailReady || loading

  return (
    <div className="login-page">
      <div className="login-blob login-blob-left" />
      <div className="login-blob login-blob-right" />

      <div className={`login-box${shake ? ' login-shake' : ''}`}>
        {/* Logo */}
        <div className="login-header">
          <Link to="/" className="login-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="#86ef86" fillOpacity="0.15" />
              <path d="M8 10h16M8 16h10M8 22h13" stroke="#86ef86" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="login-logo-text">Tutory</span>
          </Link>
          <p className="login-subtitle">Portal de gestión de clases</p>
          <Link to="/" className="login-back">← Volver al inicio</Link>
        </div>

        {passwordResetSuccess && (
          <div style={{
            margin: '0 26px',
            padding: '9px 12px',
            borderRadius: '10px',
            background: 'rgba(134,239,134,0.1)',
            border: '1px solid rgba(134,239,134,0.25)',
            fontSize: '13px',
            color: '#86ef86',
            textAlign: 'center',
          }}>
            PIN actualizado. Ya puedes ingresar.
          </div>
        )}

        <div className="login-body">
          {/* Email */}
          <div className="login-field">
            <label className="login-label" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setPin('') }}
              className="login-input"
              disabled={loading}
            />
          </div>

          {/* PIN dots */}
          <div className="pin-label-row">
            <span className="login-label">PIN de acceso</span>
          </div>
          <div className="pin-dots" aria-label={`PIN: ${pin.length} de 4 dígitos ingresados`}>
            {[0,1,2,3].map(i => (
              <div
                key={i}
                className={`pin-dot${pin.length > i ? ' pin-dot-filled' : ''}`}
              />
            ))}
          </div>

          {error && (
            <p className="login-error">{error}</p>
          )}

          {/* Numeric keypad */}
          <div className={`pin-pad${padDisabled ? ' pin-pad-disabled' : ''}`} aria-label="Teclado numérico">
            {PAD_KEYS.map(key => {
              const isConfirm = key === '→'
              const isDelete = key === '⌫'
              const confirmActive = isConfirm && pin.length === 4 && !padDisabled
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={isDelete ? 'Borrar' : isConfirm ? 'Confirmar' : key}
                  className={[
                    'pin-key',
                    isDelete ? 'pin-key-action' : '',
                    isConfirm ? 'pin-key-confirm' : '',
                    confirmActive ? 'pin-key-confirm-active' : '',
                  ].join(' ')}
                  onClick={() => handleKey(key)}
                  disabled={padDisabled || (isConfirm && pin.length !== 4)}
                  tabIndex={padDisabled ? -1 : 0}
                >
                  {loading && isConfirm ? (
                    <span className="login-spinner" />
                  ) : key}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #05070B;
          position: relative;
          overflow: hidden;
        }

        .login-blob {
          position: absolute;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(80px);
        }
        .login-blob-left {
          width: 600px; height: 400px;
          top: -100px; left: -200px;
          background: radial-gradient(ellipse, rgba(134,239,134,0.12) 0%, transparent 70%);
        }
        .login-blob-right {
          width: 500px; height: 400px;
          top: 0; right: -150px;
          background: radial-gradient(ellipse, rgba(134,239,134,0.10) 0%, transparent 70%);
        }

        .login-box {
          width: 100%;
          max-width: 360px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 26px;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.7);
          position: relative;
          z-index: 1;
        }
        .login-shake {
          animation: loginShake 0.4s ease;
        }
        @keyframes loginShake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .login-header {
          padding: 28px 26px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          text-align: center;
        }
        .login-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .login-logo:hover { opacity: 0.8; }
        .login-back {
          display: inline-block;
          margin-top: 10px;
          font-size: 11px;
          color: #7a8ba8;
          text-decoration: none;
          transition: color 0.15s;
          letter-spacing: 0.02em;
        }
        .login-back:hover { color: #86ef86; }
        .login-logo-text {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #F2F6FF;
          letter-spacing: -0.5px;
        }
        .login-subtitle {
          font-size: 12px;
          color: #7a8ba8;
          margin: 0;
          letter-spacing: 0.02em;
        }

        .login-body {
          padding: 24px 26px 28px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 10px;
        }
        .login-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #86ef86;
        }
        .login-input {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 11px 14px;
          color: #F2F6FF;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .login-input:focus { border-color: rgba(134,239,134,0.4); }
        .login-input::placeholder { color: #7a8ba8; }
        .login-input:disabled { opacity: 0.5; cursor: not-allowed; }

        /* PIN dots */
        .pin-label-row {
          margin-top: 6px;
          margin-bottom: 10px;
        }
        .pin-dots {
          display: flex;
          justify-content: center;
          gap: 18px;
          margin-bottom: 14px;
        }
        .pin-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(134,239,134,0.35);
          background: transparent;
          transition: background 0.15s, border-color 0.15s, transform 0.12s;
        }
        .pin-dot-filled {
          background: #86ef86;
          border-color: #86ef86;
          transform: scale(1.1);
        }

        /* Keypad */
        .pin-pad {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 4px;
          transition: opacity 0.2s;
        }
        .pin-pad-disabled {
          opacity: 0.35;
          pointer-events: none;
        }

        .pin-key {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          color: #F2F6FF;
          font-family: 'Sora', sans-serif;
          font-size: 20px;
          font-weight: 600;
          height: 58px;
          cursor: pointer;
          transition: background 0.12s, transform 0.1s, border-color 0.12s;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .pin-key:hover:not(:disabled) {
          background: rgba(134,239,134,0.10);
          border-color: rgba(134,239,134,0.2);
        }
        .pin-key:active:not(:disabled) {
          transform: scale(0.93);
          background: rgba(134,239,134,0.18);
        }
        .pin-key:disabled { opacity: 0.3; cursor: not-allowed; }

        .pin-key-action {
          color: #f87171;
          font-size: 22px;
        }
        .pin-key-confirm {
          color: #7a8ba8;
          font-size: 22px;
        }
        .pin-key-confirm-active {
          background: #86ef86;
          border-color: #86ef86;
          color: #031a03;
        }
        .pin-key-confirm-active:hover:not(:disabled) {
          background: #a3f5a3;
          border-color: #a3f5a3;
        }

        .login-error {
          font-size: 13px;
          color: #f87171;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          padding: 9px 12px;
          margin: 0 0 8px;
          text-align: center;
        }

        .login-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(3,26,3,0.3);
          border-top-color: #031a03;
          border-radius: 50%;
          animation: loginSpin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes loginSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, type UserRole } from './AuthContext'

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
}

export default function LoginPage() {
  const { signIn, appUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (appUser) {
      navigate(ROLE_HOME[appUser.role], { replace: true })
    }
  }, [appUser, navigate])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setError(null)
    setLoading(true)

    const { error: signInError } = await signIn(email.trim(), password)

    setLoading(false)

    if (signInError) {
      setError('Correo o contraseña incorrectos')
      triggerShake()
      return
    }

    // AuthGuard / router will redirect based on role after session updates
  }

  return (
    <div className="login-page">
      {/* Gradient blobs */}
      <div className="login-blob login-blob-left" />
      <div className="login-blob login-blob-right" />

      <div className={`login-box${shake ? ' login-shake' : ''}`}>
        {/* Logo */}
        <div className="login-header">
          <div className="login-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="#86ef86" fillOpacity="0.15" />
              <path d="M8 10h16M8 16h10M8 22h13" stroke="#86ef86" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="login-logo-text">Tutory</span>
          </div>
          <p className="login-subtitle">Portal de gestión de clases</p>
        </div>

        <form onSubmit={handleSubmit} className="login-body" noValidate>
          <div className="login-field">
            <label className="login-label" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="login-input"
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="login-input"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="login-error">{error}</p>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading || !email.trim() || !password}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
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
        .dark .login-page { background: #05070B; }

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
        }
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
          padding: 24px 26px 30px;
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
        }
        .login-input:focus {
          border-color: rgba(134,239,134,0.4);
        }
        .login-input::placeholder { color: #7a8ba8; }
        .login-input:disabled { opacity: 0.5; cursor: not-allowed; }

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

        .login-btn {
          width: 100%;
          padding: 13px;
          border-radius: 14px;
          border: none;
          background: #86ef86;
          color: #031a03;
          font-family: 'Sora', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s, opacity 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 6px;
          min-height: 48px;
        }
        .login-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .login-spinner {
          width: 18px; height: 18px;
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

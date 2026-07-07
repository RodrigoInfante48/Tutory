import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// SETUP REQUIRED — Supabase dashboard:
// Authentication → URL Configuration → Redirect URLs
// Add: https://tutory.vercel.app/reset-password  (and http://localhost:5173/reset-password for local dev)
// Without this, Supabase will reject the redirectTo URL and the reset email won't work.

type PageState = 'loading' | 'ready' | 'no-session' | 'success' | 'error'
type FlowType = 'recovery' | 'invite'

function getFlowType(): FlowType {
  const hash = window.location.hash.slice(1)
  const params = new URLSearchParams(hash)
  return params.get('type') === 'invite' ? 'invite' : 'recovery'
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [flowType] = useState<FlowType>(getFlowType)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // For invite links, Supabase fires SIGNED_IN; for recovery it fires PASSWORD_RECOVERY.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && flowType === 'invite')) {
        setPageState('ready')
      }
    })

    // If the user lands here without a valid token (e.g., navigates directly),
    // give Supabase a moment to fire the event before showing the error state.
    const timeout = setTimeout(() => {
      setPageState(prev => prev === 'loading' ? 'no-session' : prev)
    }, 2000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [flowType])

  const validate = (): string | null => {
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
    if (password !== confirm) return 'Las contraseñas no coinciden.'
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError(null)
    setSubmitting(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    setSubmitting(false)

    if (updateError) {
      setError('No pudimos actualizar la contraseña. El enlace puede haber expirado.')
      return
    }

    await supabase.auth.signOut()
    navigate('/login', { state: { passwordReset: true }, replace: true })
  }

  if (pageState === 'loading') {
    return (
      <div className="rp-page">
        <div className="rp-blob rp-blob-left" />
        <div className="rp-blob rp-blob-right" />
        <div className="rp-loader">
          <span className="rp-spinner-lg" />
        </div>
        <ResetStyles />
      </div>
    )
  }

  if (pageState === 'no-session') {
    return (
      <div className="rp-page">
        <div className="rp-blob rp-blob-left" />
        <div className="rp-blob rp-blob-right" />
        <div className="rp-box">
          <div className="rp-header">
            <Logo />
            <p className="rp-subtitle">Enlace inválido</p>
          </div>
          <div className="rp-body" style={{ textAlign: 'center' }}>
            <p className="rp-desc">
              Este enlace es inválido o ya expiró. Solicita uno nuevo desde la página de inicio de sesión.
            </p>
            <Link to="/forgot-password" className="rp-btn" style={{ textDecoration: 'none', display: 'flex' }}>
              Solicitar nuevo enlace
            </Link>
            <div className="rp-footer">
              <Link to="/login" className="rp-back-link">← Volver al inicio de sesión</Link>
            </div>
          </div>
        </div>
        <ResetStyles />
      </div>
    )
  }

  return (
    <div className="rp-page">
      <div className="rp-blob rp-blob-left" />
      <div className="rp-blob rp-blob-right" />

      <div className="rp-box">
        <div className="rp-header">
          <Logo />
          <p className="rp-subtitle">
            {flowType === 'invite' ? 'Bienvenido a Tutory' : 'Nueva contraseña'}
          </p>
        </div>

        <div className="rp-body">
          {flowType === 'invite' && (
            <p className="rp-desc">
              Crea tu contraseña para activar tu cuenta y empezar.
            </p>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="rp-field">
              <label className="rp-label" htmlFor="password">
                {flowType === 'invite' ? 'Crea tu contraseña' : 'Nueva contraseña'}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="rp-input"
                disabled={submitting}
              />
            </div>

            <div className="rp-field">
              <label className="rp-label" htmlFor="confirm">Confirmar contraseña</label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="rp-input"
                disabled={submitting}
              />
            </div>

            {error && <p className="rp-error">{error}</p>}

            <button
              type="submit"
              className="rp-btn"
              disabled={submitting || !password || !confirm}
            >
              {submitting
                ? <span className="rp-spinner" />
                : flowType === 'invite' ? 'Activar cuenta' : 'Guardar contraseña'
              }
            </button>

            <div className="rp-footer">
              <Link to="/login" className="rp-back-link">← Volver al inicio de sesión</Link>
            </div>
          </form>
        </div>
      </div>

      <ResetStyles />
    </div>
  )
}

function Logo() {
  return (
    <Link to="/" className="rp-logo">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="10" fill="#86ef86" fillOpacity="0.15" />
        <path d="M8 10h16M8 16h10M8 22h13" stroke="#86ef86" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <span className="rp-logo-text">Tutory</span>
    </Link>
  )
}

function ResetStyles() {
  return (
    <style>{`
      .rp-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: #05070B;
        position: relative;
        overflow: hidden;
      }

      .rp-blob {
        position: absolute;
        pointer-events: none;
        border-radius: 50%;
        filter: blur(80px);
      }
      .rp-blob-left {
        width: 600px; height: 400px;
        top: -100px; left: -200px;
        background: radial-gradient(ellipse, rgba(134,239,134,0.12) 0%, transparent 70%);
      }
      .rp-blob-right {
        width: 500px; height: 400px;
        top: 0; right: -150px;
        background: radial-gradient(ellipse, rgba(134,239,134,0.10) 0%, transparent 70%);
      }

      .rp-loader {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 1;
      }
      .rp-spinner-lg {
        width: 36px; height: 36px;
        border: 3px solid rgba(255,255,255,0.08);
        border-top-color: #86ef86;
        border-radius: 50%;
        animation: rpSpin 0.7s linear infinite;
        display: inline-block;
      }

      .rp-box {
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

      .rp-header {
        padding: 28px 26px 20px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        text-align: center;
      }
      .rp-logo {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 6px;
        text-decoration: none;
        transition: opacity 0.15s;
      }
      .rp-logo:hover { opacity: 0.8; }
      .rp-logo-text {
        font-family: 'Sora', sans-serif;
        font-size: 22px;
        font-weight: 800;
        color: #F2F6FF;
        letter-spacing: -0.5px;
      }
      .rp-subtitle {
        font-size: 12px;
        color: #7a8ba8;
        margin: 0;
        letter-spacing: 0.02em;
      }

      .rp-body {
        padding: 24px 26px 30px;
      }
      .rp-desc {
        font-size: 13px;
        color: #7a8ba8;
        margin: 0 0 18px;
        line-height: 1.55;
      }

      .rp-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 14px;
      }
      .rp-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #86ef86;
      }
      .rp-input {
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
      .rp-input:focus { border-color: rgba(134,239,134,0.4); }
      .rp-input::placeholder { color: #7a8ba8; }
      .rp-input:disabled { opacity: 0.5; cursor: not-allowed; }

      .rp-error {
        font-size: 13px;
        color: #f87171;
        background: rgba(239,68,68,0.1);
        border: 1px solid rgba(239,68,68,0.2);
        border-radius: 10px;
        padding: 9px 12px;
        margin: 0 0 12px;
        text-align: center;
      }

      .rp-btn {
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
        min-height: 48px;
        box-sizing: border-box;
      }
      .rp-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
      .rp-btn:active:not(:disabled) { transform: translateY(0); }
      .rp-btn:disabled { opacity: 0.4; cursor: not-allowed; }

      .rp-spinner {
        width: 18px; height: 18px;
        border: 2px solid rgba(3,26,3,0.3);
        border-top-color: #031a03;
        border-radius: 50%;
        animation: rpSpin 0.7s linear infinite;
        display: inline-block;
      }
      @keyframes rpSpin { to { transform: rotate(360deg); } }

      .rp-footer {
        margin-top: 18px;
        text-align: center;
      }
      .rp-back-link {
        font-size: 12px;
        color: #7a8ba8;
        text-decoration: none;
        transition: color 0.15s;
      }
      .rp-back-link:hover { color: #86ef86; }
    `}</style>
  )
}

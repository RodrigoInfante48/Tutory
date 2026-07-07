import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: window.location.origin + '/reset-password' },
    )

    setLoading(false)

    if (resetError) {
      setError('No pudimos enviar el enlace. Verifica el correo e intenta de nuevo.')
      return
    }

    setSent(true)
  }

  return (
    <div className="fp-page">
      <div className="fp-blob fp-blob-left" />
      <div className="fp-blob fp-blob-right" />

      <div className="fp-box">
        <div className="fp-header">
          <Link to="/" className="fp-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="#86ef86" fillOpacity="0.15" />
              <path d="M8 10h16M8 16h10M8 22h13" stroke="#86ef86" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="fp-logo-text">Tutory</span>
          </Link>
          <p className="fp-subtitle">Recuperar contraseña</p>
        </div>

        <div className="fp-body">
          {sent ? (
            <div className="fp-success">
              <div className="fp-success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#86ef86" strokeWidth="1.8"/>
                  <path d="M7.5 12.5l3 3 6-6" stroke="#86ef86" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="fp-success-title">Revisa tu correo</p>
              <p className="fp-success-text">
                Te enviamos un enlace para restablecer tu contraseña a <strong>{email}</strong>.
                El correo puede tardar unos minutos.
              </p>
              <Link to="/login" className="fp-back-link">← Volver al inicio de sesión</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p className="fp-desc">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <div className="fp-field">
                <label className="fp-label" htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="fp-input"
                  disabled={loading}
                />
              </div>

              {error && <p className="fp-error">{error}</p>}

              <button
                type="submit"
                className="fp-btn"
                disabled={loading || !email.trim()}
              >
                {loading ? <span className="fp-spinner" /> : 'Enviar enlace'}
              </button>

              <div className="fp-footer">
                <Link to="/login" className="fp-back-link">← Volver al inicio de sesión</Link>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .fp-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #05070B;
          position: relative;
          overflow: hidden;
        }

        .fp-blob {
          position: absolute;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(80px);
        }
        .fp-blob-left {
          width: 600px; height: 400px;
          top: -100px; left: -200px;
          background: radial-gradient(ellipse, rgba(134,239,134,0.12) 0%, transparent 70%);
        }
        .fp-blob-right {
          width: 500px; height: 400px;
          top: 0; right: -150px;
          background: radial-gradient(ellipse, rgba(134,239,134,0.10) 0%, transparent 70%);
        }

        .fp-box {
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

        .fp-header {
          padding: 28px 26px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          text-align: center;
        }
        .fp-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .fp-logo:hover { opacity: 0.8; }
        .fp-logo-text {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #F2F6FF;
          letter-spacing: -0.5px;
        }
        .fp-subtitle {
          font-size: 12px;
          color: #7a8ba8;
          margin: 0;
          letter-spacing: 0.02em;
        }

        .fp-body {
          padding: 24px 26px 30px;
        }
        .fp-desc {
          font-size: 13px;
          color: #7a8ba8;
          margin: 0 0 18px;
          line-height: 1.55;
        }

        .fp-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }
        .fp-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #86ef86;
        }
        .fp-input {
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
        .fp-input:focus { border-color: rgba(134,239,134,0.4); }
        .fp-input::placeholder { color: #7a8ba8; }
        .fp-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .fp-error {
          font-size: 13px;
          color: #f87171;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          padding: 9px 12px;
          margin: 0 0 12px;
          text-align: center;
        }

        .fp-btn {
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
        }
        .fp-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
        .fp-btn:active:not(:disabled) { transform: translateY(0); }
        .fp-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .fp-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(3,26,3,0.3);
          border-top-color: #031a03;
          border-radius: 50%;
          animation: fpSpin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes fpSpin { to { transform: rotate(360deg); } }

        .fp-footer {
          margin-top: 18px;
          text-align: center;
        }
        .fp-back-link {
          font-size: 12px;
          color: #7a8ba8;
          text-decoration: none;
          transition: color 0.15s;
        }
        .fp-back-link:hover { color: #86ef86; }

        .fp-success {
          text-align: center;
          padding: 8px 0 4px;
        }
        .fp-success-icon {
          margin-bottom: 14px;
        }
        .fp-success-title {
          font-family: 'Sora', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #F2F6FF;
          margin: 0 0 10px;
        }
        .fp-success-text {
          font-size: 13px;
          color: #7a8ba8;
          line-height: 1.6;
          margin: 0 0 20px;
        }
        .fp-success-text strong { color: #F2F6FF; }
      `}</style>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function SignUpPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
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
    if (!name.trim() || !email.trim() || !password) return
    setError(null)
    setLoading(true)

    // 1. Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    })

    if (signUpError) {
      setLoading(false)
      if (
        signUpError.message.toLowerCase().includes('already registered') ||
        signUpError.message.toLowerCase().includes('already been registered') ||
        signUpError.message.toLowerCase().includes('user already exists')
      ) {
        setError('Ya tienes cuenta, inicia sesión')
      } else if (signUpError.message.toLowerCase().includes('password')) {
        setError('La contraseña debe tener al menos 6 caracteres')
      } else {
        setError(signUpError.message)
      }
      triggerShake()
      return
    }

    const authUser = authData.user
    if (!authUser) {
      setLoading(false)
      setError('Error al crear la cuenta. Inténtalo de nuevo.')
      triggerShake()
      return
    }

    // Email confirmation required — no active session yet
    if (!authData.session) {
      setLoading(false)
      setError('Revisa tu email para confirmar tu cuenta antes de ingresar.')
      return
    }

    // 2. Insert into users table
    const { error: userInsertError } = await supabase.from('users').insert({
      id: authUser.id,
      email: authUser.email,
      role: 'student',
      name: name.trim(),
    })

    if (userInsertError) {
      console.error('[SignUp] users insert error:', userInsertError)
    }

    // 3. Find Demo study plan (best-effort — don't block signup if missing)
    let demoPlanId: string | null = null
    const { data: demoPlan } = await supabase
      .from('study_plans')
      .select('id')
      .eq('name', 'Demo')
      .maybeSingle()

    if (demoPlan) demoPlanId = demoPlan.id

    // 4. Insert into students table
    const { error: studentInsertError } = await supabase.from('students').insert({
      id: authUser.id,
      teacher_id: null,
      plan_id: demoPlanId,
      active: true,
    })

    if (studentInsertError) {
      console.error('[SignUp] students insert error:', studentInsertError)
    }

    // 5. Redirect with welcome flag
    navigate('/student', { replace: true, state: { welcome: true } })
  }

  return (
    <div className="signup-page">
      <div className="signup-blob signup-blob-left" />
      <div className="signup-blob signup-blob-right" />

      <div className={`signup-box${shake ? ' signup-shake' : ''}`}>
        <div className="signup-header">
          <Link to="/" className="signup-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="#86ef86" fillOpacity="0.15" />
              <path d="M8 10h16M8 16h10M8 22h13" stroke="#86ef86" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="signup-logo-text">Tutory</span>
          </Link>
          <p className="signup-subtitle">Crea tu cuenta de estudiante</p>
          <Link to="/" className="signup-back">← Volver al inicio</Link>
        </div>

        <form onSubmit={handleSubmit} className="signup-body" noValidate>
          <div className="signup-field">
            <label className="signup-label" htmlFor="name">Nombre completo</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Tu nombre"
              value={name}
              onChange={e => setName(e.target.value)}
              className="signup-input"
              disabled={loading}
            />
          </div>

          <div className="signup-field">
            <label className="signup-label" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="signup-input"
              disabled={loading}
            />
          </div>

          <div className="signup-field">
            <label className="signup-label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="signup-input"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="signup-error">
              {error}
              {error === 'Ya tienes cuenta, inicia sesión' && (
                <>
                  {' '}
                  <Link to="/login" className="signup-error-link">Ingresar</Link>
                </>
              )}
            </p>
          )}

          <button
            type="submit"
            className="signup-btn"
            disabled={loading || !name.trim() || !email.trim() || !password}
          >
            {loading ? <span className="signup-spinner" /> : 'Crear cuenta gratis'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <Link
              to="/login"
              style={{
                fontSize: '12px',
                color: '#86ef86',
                textDecoration: 'none',
                opacity: 0.8,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </form>
      </div>

      <style>{`
        .signup-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #05070B;
          position: relative;
          overflow: hidden;
        }

        .signup-blob {
          position: absolute;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(80px);
        }
        .signup-blob-left {
          width: 600px; height: 400px;
          top: -100px; left: -200px;
          background: radial-gradient(ellipse, rgba(134,239,134,0.12) 0%, transparent 70%);
        }
        .signup-blob-right {
          width: 500px; height: 400px;
          top: 0; right: -150px;
          background: radial-gradient(ellipse, rgba(134,239,134,0.10) 0%, transparent 70%);
        }

        .signup-box {
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
        .signup-shake {
          animation: signupShake 0.4s ease;
        }
        @keyframes signupShake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .signup-header {
          padding: 28px 26px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          text-align: center;
        }
        .signup-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .signup-logo:hover { opacity: 0.8; }
        .signup-logo-text {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #F2F6FF;
          letter-spacing: -0.5px;
        }
        .signup-subtitle {
          font-size: 12px;
          color: #7a8ba8;
          margin: 0;
          letter-spacing: 0.02em;
        }
        .signup-back {
          display: inline-block;
          margin-top: 10px;
          font-size: 11px;
          color: #7a8ba8;
          text-decoration: none;
          transition: color 0.15s;
          letter-spacing: 0.02em;
        }
        .signup-back:hover { color: #86ef86; }

        .signup-body {
          padding: 24px 26px 30px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .signup-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 10px;
        }
        .signup-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #86ef86;
        }
        .signup-input {
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
        .signup-input:focus { border-color: rgba(134,239,134,0.4); }
        .signup-input::placeholder { color: #7a8ba8; }
        .signup-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .signup-error {
          font-size: 13px;
          color: #f87171;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          padding: 9px 12px;
          margin: 0 0 8px;
          text-align: center;
        }
        .signup-error-link {
          color: #f87171;
          font-weight: 700;
          text-decoration: underline;
        }

        .signup-btn {
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
        .signup-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
        .signup-btn:active:not(:disabled) { transform: translateY(0); }
        .signup-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .signup-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(3,26,3,0.3);
          border-top-color: #031a03;
          border-radius: 50%;
          animation: signupSpin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes signupSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

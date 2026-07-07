import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/globals.css'
import { configError } from './lib/supabase'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary section="la aplicación">
      {configError ? (
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#f0fdf4',
          fontFamily: 'DM Sans, sans-serif',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '14px', color: '#9ca3af', maxWidth: '360px' }}>{configError}</p>
        </div>
      ) : (
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )}
    </ErrorBoundary>
  </React.StrictMode>
)

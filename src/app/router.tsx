import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from '../components/AuthGuard'
import ErrorBoundary from '../components/ErrorBoundary'
import LoginPage from '../features/auth/LoginPage'
import SignUpPage from '../features/auth/SignUpPage'
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage'
import ResetPasswordPage from '../features/auth/ResetPasswordPage'
import LandingPage from '../features/landing/LandingPage'
import TeacherDashboard from '../features/teachers/TeacherDashboard'
import StudentDashboard from '../features/students/StudentDashboard'
import StudentVault from '../features/students/StudentVault'
import TopicReader from '../features/study-plans/TopicReader'
import AdminDashboard from '../features/admin/AdminDashboard'
import ClassesPage from '../features/classes/ClassesPage'
import ResourcesPage from '../features/resources/ResourcesPage'
import MessagesPage from '../features/messages/MessagesPage'
import RoleRedirect from './RoleRedirect'
import { useAuth } from '../features/auth/AuthContext'

function RootRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: '3px solid rgba(255,255,255,0.08)',
          borderTop: '3px solid #86ef86',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!session) return <LandingPage />

  return (
    <AuthGuard>
      <RoleRedirect />
    </AuthGuard>
  )
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<ErrorBoundary section="Login"><LoginPage /></ErrorBoundary>} />
      <Route path="/signup" element={<ErrorBoundary section="Registro"><SignUpPage /></ErrorBoundary>} />
      <Route path="/forgot-password" element={<ErrorBoundary section="Recuperar contraseña"><ForgotPasswordPage /></ErrorBoundary>} />
      <Route path="/reset-password" element={<ErrorBoundary section="Resetear contraseña"><ResetPasswordPage /></ErrorBoundary>} />

      {/* Root: landing page for guests, role redirect for authenticated users */}
      <Route path="/" element={<ErrorBoundary section="Inicio"><RootRoute /></ErrorBoundary>} />

      <Route
        path="/teacher"
        element={
          <ErrorBoundary section="Dashboard del docente">
            <AuthGuard allowedRole="teacher">
              <TeacherDashboard />
            </AuthGuard>
          </ErrorBoundary>
        }
      />
      <Route
        path="/student"
        element={
          <ErrorBoundary section="Portal del estudiante">
            <AuthGuard allowedRole="student">
              <StudentDashboard />
            </AuthGuard>
          </ErrorBoundary>
        }
      />
      <Route
        path="/student/vault"
        element={
          <ErrorBoundary section="Mi Vault">
            <AuthGuard allowedRole="student">
              <StudentVault />
            </AuthGuard>
          </ErrorBoundary>
        }
      />
      <Route
        path="/student/topic/:topicId"
        element={
          <ErrorBoundary section="Lector de tema">
            <AuthGuard allowedRole="student">
              <TopicReader />
            </AuthGuard>
          </ErrorBoundary>
        }
      />
      <Route
        path="/teacher/classes"
        element={
          <ErrorBoundary section="Clases">
            <AuthGuard allowedRole="teacher">
              <ClassesPage />
            </AuthGuard>
          </ErrorBoundary>
        }
      />
      <Route
        path="/teacher/resources"
        element={
          <ErrorBoundary section="Recursos">
            <AuthGuard allowedRole="teacher">
              <ResourcesPage />
            </AuthGuard>
          </ErrorBoundary>
        }
      />
      <Route
        path="/teacher/messages"
        element={
          <ErrorBoundary section="Mensajes">
            <AuthGuard allowedRole="teacher">
              <MessagesPage />
            </AuthGuard>
          </ErrorBoundary>
        }
      />
      <Route
        path="/admin"
        element={
          <ErrorBoundary section="Panel de administración">
            <AuthGuard allowedRole="admin">
              <AdminDashboard />
            </AuthGuard>
          </ErrorBoundary>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

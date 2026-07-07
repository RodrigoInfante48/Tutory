import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from '../components/AuthGuard'
import ErrorBoundary from '../components/ErrorBoundary'
import LoginPage from '../features/auth/LoginPage'
import LandingPage from '../features/landing/LandingPage'
import TeacherDashboard from '../features/teachers/TeacherDashboard'
import StudentDashboard from '../features/students/StudentDashboard'
import AdminDashboard from '../features/admin/AdminDashboard'
import RoleRedirect from './RoleRedirect'
import { useAuth } from '../features/auth/AuthContext'

function RootRoute() {
  const { firebaseUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-9 h-9 rounded-full border-[3px] border-white/10 border-t-primary animate-spin" />
      </div>
    )
  }

  if (!firebaseUser) return <LandingPage />

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

      {/* Root: landing para invitados, redirect por rol para autenticados */}
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
        path="/admin"
        element={
          <ErrorBoundary section="Panel de administración">
            <AuthGuard allowedRole="admin">
              <AdminDashboard />
            </AuthGuard>
          </ErrorBoundary>
        }
      />

      {/*
        Rutas pendientes (ver FIREBASE_MIGRATION_PROMPTS.md sesiones 5-9):
        /student/topic/:topicId, /teacher/classes, /teacher/resources,
        /teacher/messages, /teacher/quizzes, /teacher/groups,
        /admin/plans, /admin/plans/:planId
      */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

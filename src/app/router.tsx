import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from '../components/AuthGuard'
import LoginPage from '../features/auth/LoginPage'
import LandingPage from '../features/landing/LandingPage'
import TeacherDashboard from '../features/teachers/TeacherDashboard'
import StudentDashboard from '../features/students/StudentDashboard'
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
      <Route path="/login" element={<LoginPage />} />

      {/* Root: landing page for guests, role redirect for authenticated users */}
      <Route path="/" element={<RootRoute />} />

      <Route
        path="/teacher"
        element={
          <AuthGuard allowedRole="teacher">
            <TeacherDashboard />
          </AuthGuard>
        }
      />
      <Route
        path="/student"
        element={
          <AuthGuard allowedRole="student">
            <StudentDashboard />
          </AuthGuard>
        }
      />
      <Route
        path="/student/topic/:topicId"
        element={
          <AuthGuard allowedRole="student">
            <TopicReader />
          </AuthGuard>
        }
      />
      <Route
        path="/teacher/classes"
        element={
          <AuthGuard allowedRole="teacher">
            <ClassesPage />
          </AuthGuard>
        }
      />
      <Route
        path="/teacher/resources"
        element={
          <AuthGuard allowedRole="teacher">
            <ResourcesPage />
          </AuthGuard>
        }
      />
      <Route
        path="/teacher/messages"
        element={
          <AuthGuard allowedRole="teacher">
            <MessagesPage />
          </AuthGuard>
        }
      />
      <Route
        path="/admin"
        element={
          <AuthGuard allowedRole="admin">
            <AdminDashboard />
          </AuthGuard>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

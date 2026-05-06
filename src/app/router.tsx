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
  const { session, appUser, loading } = useAuth()

  if (loading) return null

  // Authenticated: go to role dashboard
  if (session && appUser) return <RoleRedirect />

  // Public: show landing page
  return <LandingPage />
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Root: landing for guests, role dashboard for authenticated users */}
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

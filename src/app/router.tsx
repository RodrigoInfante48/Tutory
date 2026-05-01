import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from '../components/AuthGuard'
import LoginPage from '../features/auth/LoginPage'
import TeacherDashboard from '../features/teachers/TeacherDashboard'
import StudentDashboard from '../features/students/StudentDashboard'
import TopicReader from '../features/study-plans/TopicReader'
import AdminDashboard from '../features/admin/AdminDashboard'
import ClassesPage from '../features/classes/ClassesPage'
import RoleRedirect from './RoleRedirect'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Root: redirect based on authenticated user's role */}
      <Route
        path="/"
        element={
          <AuthGuard>
            <RoleRedirect />
          </AuthGuard>
        }
      />

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

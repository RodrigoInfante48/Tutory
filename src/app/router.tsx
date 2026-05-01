import { Routes, Route, Navigate } from 'react-router-dom'
import TeacherDashboard from '../features/teachers/TeacherDashboard'
import StudentDashboard from '../features/students/StudentDashboard'
import AdminDashboard from '../features/admin/AdminDashboard'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/teacher" replace />} />
      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}

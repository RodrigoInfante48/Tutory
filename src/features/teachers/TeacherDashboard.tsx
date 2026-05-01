import { useState } from 'react'
import AppLayout from '../../app/AppLayout'
import { useAuth } from '../auth/AuthContext'
import { useTeacherStudents, type StudentSummary } from '../../hooks/useTeacherStudents'
import StudentCard from '../students/StudentCard'
import StudentProfile from '../students/StudentProfile'

export default function TeacherDashboard() {
  const { appUser } = useAuth()
  const { students, loading, error } = useTeacherStudents()
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null)

  const firstName = appUser?.name?.split(' ')[0] ?? 'Docente'

  return (
    <AppLayout title="Mis estudiantes">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            Bienvenida, {firstName}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {loading
              ? 'Cargando tus estudiantes…'
              : `${students.length} estudiante${students.length !== 1 ? 's' : ''} activo${students.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">No tienes estudiantes asignados</p>
              <p className="text-sm text-gray-400 mt-1">Pide al administrador que te asigne estudiantes.</p>
            </div>
          </div>
        )}

        {/* Student grid */}
        {!loading && students.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                onClick={() => setSelectedStudent(student)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Student profile slide-over */}
      {selectedStudent && (
        <StudentProfile
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </AppLayout>
  )
}

import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useClassSessions } from '../../hooks/useClassSessions'
import { useTeacherStudents } from '../../hooks/useTeacherStudents'
import { useTeacherCycleAlerts } from '../../hooks/useCycles'
import CalendarView from './CalendarView'

export default function ClassesPage() {
  const { appUser } = useAuth()
  const teacherId = appUser?.id ?? null

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const { sessions, loading, reload } = useClassSessions({ teacherId, year, month })
  const { students } = useTeacherStudents()
  const { atRiskCount } = useTeacherCycleAlerts(teacherId)

  const studentList = students.map(s => ({ id: s.id, name: s.name }))

  // Stats for this month
  const taken = sessions.filter(s => s.status === 'taken').length
  const scheduled = sessions.filter(s => s.status === 'scheduled').length
  const noShow = sessions.filter(s => s.status === 'no_show').length
  const cancelled = sessions.filter(s => s.status === 'cancelled' || s.status === 'holiday').length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            Calendario de clases
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona y registra las sesiones con tus estudiantes
          </p>
        </div>
      </div>

      {/* Cycle alert banner */}
      {atRiskCount > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              {atRiskCount} estudiante{atRiskCount !== 1 ? 's' : ''} en riesgo de no completar el ciclo
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
              El ciclo terminará antes de alcanzar el mínimo de clases requeridas.
            </p>
          </div>
        </div>
      )}

      {/* Month stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Tomadas" value={taken} color="text-primary" />
        <StatCard label="Programadas" value={scheduled} color="text-blue-500" />
        <StatCard label="No show" value={noShow} color="text-red-500" />
        <StatCard label="Canceladas" value={cancelled} color="text-gray-400" />
      </div>

      {/* Calendar */}
      <CalendarView
        sessions={sessions}
        loading={loading}
        year={year}
        month={month}
        teacherId={teacherId ?? ''}
        students={studentList}
        onMonthChange={(y, m) => { setYear(y); setMonth(m) }}
        onReload={reload}
      />
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

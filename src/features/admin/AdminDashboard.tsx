import { useState } from 'react'
import AppLayout from '../../app/AppLayout'
import { useAuth } from '../auth/AuthContext'
import { useAdminMetrics } from '../../hooks/useAdminMetrics'
import { useAdminUsers, type AdminTeacher, type AdminStudent, type AdminAlert } from '../../hooks/useAdminUsers'
import MetricCard from '../../components/MetricCard'

type Tab = 'teachers' | 'students' | 'alerts'

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full object-cover" />
  }
  return (
    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-dark dark:text-primary flex-shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function TeachersTable({ teachers, loading }: { teachers: AdminTeacher[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (teachers.length === 0) {
    return (
      <p className="text-center py-12 text-gray-400 dark:text-gray-600 text-sm">
        No hay docentes registrados.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="text-left pb-3 pr-4 font-medium text-gray-500 dark:text-gray-400">Docente</th>
            <th className="text-left pb-3 pr-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
            <th className="text-right pb-3 font-medium text-gray-500 dark:text-gray-400">Estudiantes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {teachers.map(t => (
            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <Avatar name={t.name} avatarUrl={t.avatar_url} />
                  <span className="font-medium text-gray-900 dark:text-white">{t.name}</span>
                </div>
              </td>
              <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{t.email}</td>
              <td className="py-3 text-right">
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary-dark dark:text-primary">
                  {t.studentCount}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StudentsTable({ students, loading }: { students: AdminStudent[]; loading: boolean }) {
  const [showInactive, setShowInactive] = useState(false)
  const filtered = showInactive ? students : students.filter(s => s.active)

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} estudiante{filtered.length !== 1 ? 's' : ''}
        </span>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={e => setShowInactive(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary"
          />
          Mostrar inactivos
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 text-gray-400 dark:text-gray-600 text-sm">
          No hay estudiantes registrados.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left pb-3 pr-4 font-medium text-gray-500 dark:text-gray-400">Estudiante</th>
                <th className="text-left pb-3 pr-4 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Docente</th>
                <th className="text-left pb-3 pr-4 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Plan</th>
                <th className="text-right pb-3 font-medium text-gray-500 dark:text-gray-400">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} avatarUrl={s.avatar_url} />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{s.name}</p>
                        <p className="text-xs text-gray-400 truncate">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                    {s.teacherName ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                  </td>
                  <td className="py-3 pr-4 text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    {s.planName ?? <span className="text-gray-300 dark:text-gray-600">Sin plan</span>}
                  </td>
                  <td className="py-3 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      s.active
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'
                    }`}>
                      {s.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

const alertTypeLabel: Record<string, string> = {
  cycle_at_risk: 'Ciclo en riesgo',
  missed_class: 'Clase perdida',
  task_overdue: 'Tarea vencida',
  low_score: 'Score bajo',
}

function AlertsPanel({ alerts, loading }: { alerts: AdminAlert[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sin alertas pendientes</p>
        <p className="text-xs text-gray-400">El sistema está en orden.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            alert.resolved
              ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
              : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
          }`}
        >
          <div className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${
            alert.resolved ? 'bg-gray-400' : 'bg-yellow-500'
          }`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {alertTypeLabel[alert.type] ?? alert.type}
            </p>
            {alert.data && Object.keys(alert.data).length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {JSON.stringify(alert.data)}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {new Date(alert.created_at).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          {alert.resolved && (
            <span className="text-xs text-gray-400 flex-shrink-0">Resuelta</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const { appUser } = useAuth()
  const { metrics, loading: metricsLoading } = useAdminMetrics()
  const { teachers, students, alerts, loading: usersLoading } = useAdminUsers()
  const [activeTab, setActiveTab] = useState<Tab>('teachers')

  const firstName = appUser?.name?.split(' ')[0] ?? 'Admin'
  const now = new Date()
  const monthName = now.toLocaleDateString('es-CO', { month: 'long' })

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'teachers', label: 'Docentes', count: teachers.length },
    { key: 'students', label: 'Estudiantes', count: students.filter(s => s.active).length },
    { key: 'alerts', label: 'Alertas', count: alerts.filter(a => !a.resolved).length },
  ]

  return (
    <AppLayout title="Panel de Administración">
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            Bienvenido, {firstName}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 capitalize">
            Resumen de {monthName} {now.getFullYear()}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Clases este mes"
            value={metrics?.classesThisMonth ?? 0}
            loading={metricsLoading}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <MetricCard
            label="Tareas pendientes"
            value={metrics?.pendingTasks ?? 0}
            loading={metricsLoading}
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <MetricCard
            label="Quizzes este mes"
            value={metrics?.completedQuizzes ?? 0}
            loading={metricsLoading}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />
          <MetricCard
            label="Estudiantes activos"
            value={metrics?.activeStudents ?? 0}
            loading={metricsLoading}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <MetricCard
            label="Alertas activas"
            value={metrics?.unresolvedAlerts ?? 0}
            loading={metricsLoading}
            color="red"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
          />
        </div>

        {/* Users & alerts table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          {/* Tabs */}
          <div className="flex gap-1 px-4 pt-4 border-b border-gray-200 dark:border-gray-800">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                    tab.key === 'alerts'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-primary/20 text-primary-dark dark:text-primary'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'teachers' && (
              <TeachersTable teachers={teachers} loading={usersLoading} />
            )}
            {activeTab === 'students' && (
              <StudentsTable students={students} loading={usersLoading} />
            )}
            {activeTab === 'alerts' && (
              <AlertsPanel alerts={alerts} loading={usersLoading} />
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  )
}

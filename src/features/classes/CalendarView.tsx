import { useState, useMemo } from 'react'
import type { ClassSession, SessionStatus } from '../../hooks/useClassSessions'
import { updateSessionStatus, createSession } from '../../hooks/useClassSessions'
import { isColombianHoliday, getHolidayName } from '../../lib/colombianHolidays'

const STATUS_COLORS: Record<SessionStatus, string> = {
  scheduled:   'bg-blue-500',
  taken:       'bg-primary',
  no_show:     'bg-red-500',
  cancelled:   'bg-gray-400',
  rescheduled: 'bg-orange-400',
  holiday:     'bg-purple-400',
}

const STATUS_LABELS: Record<SessionStatus, string> = {
  scheduled:   'Programada',
  taken:       'Tomada',
  no_show:     'No show',
  cancelled:   'Cancelada',
  rescheduled: 'Reagendada',
  holiday:     'Festivo',
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function toLocalDate(iso: string): Date {
  return new Date(iso)
}

interface SessionModalProps {
  session: ClassSession
  teacherId: string
  onClose: () => void
  onUpdated: () => void
}

function SessionModal({ session, teacherId, onClose, onUpdated }: SessionModalProps) {
  const [status, setStatus] = useState<SessionStatus>(session.status)
  const [notes, setNotes] = useState(session.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reschedule form
  const [showReschedule, setShowReschedule] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('09:00')
  const [rescheduling, setRescheduling] = useState(false)

  const sessionDate = toLocalDate(session.scheduled_date)
  const holiday = getHolidayName(sessionDate)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateSessionStatus(session.id, status, notes || undefined)
      onUpdated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleReschedule() {
    if (!rescheduleDate) return
    setRescheduling(true)
    setError(null)
    try {
      // Mark original as cancelled/holiday then create new scheduled session
      const newStatus: SessionStatus = holiday ? 'holiday' : 'cancelled'
      await updateSessionStatus(session.id, newStatus, notes || undefined)
      const datetime = `${rescheduleDate}T${rescheduleTime}:00`
      await createSession({
        teacherId,
        studentId: session.student_id,
        scheduledDate: datetime,
        rescheduledFrom: session.id,
      })
      onUpdated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reagendar')
    } finally {
      setRescheduling(false)
    }
  }

  const canReschedule = status === 'cancelled' || status === 'no_show' || holiday != null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Sesión</p>
            <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
              {session.student?.name ?? 'Estudiante'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {sessionDate.toLocaleString('es-CO', {
                weekday: 'long', day: 'numeric', month: 'long',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
            {holiday && (
              <span className="inline-block mt-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full px-2 py-0.5">
                Festivo: {holiday}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status selector */}
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">
            Estado
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.keys(STATUS_LABELS) as SessionStatus[]).map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`text-xs font-medium px-2 py-1.5 rounded-lg border transition-colors ${
                  status === s
                    ? 'border-primary bg-primary/10 text-primary dark:text-green-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">
            Notas
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Observaciones de la clase…"
            className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        {/* Reschedule section */}
        {canReschedule && (
          <div>
            <button
              onClick={() => setShowReschedule(s => !s)}
              className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
            >
              {showReschedule ? 'Cancelar reagendar' : '+ Reagendar esta clase'}
            </button>
            {showReschedule && (
              <div className="mt-3 space-y-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Se marcará esta sesión como {holiday ? 'festivo' : 'cancelada'} y se creará una nueva sesión programada.
                </p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={e => setRescheduleDate(e.target.value)}
                    className="flex-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={e => setRescheduleTime(e.target.value)}
                    className="w-24 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <button
                  onClick={handleReschedule}
                  disabled={!rescheduleDate || rescheduling}
                  className="w-full text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rescheduling ? 'Reagendando…' : 'Confirmar reagendar'}
                </button>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 text-sm font-semibold bg-primary text-gray-900 rounded-lg py-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface NewSessionModalProps {
  teacherId: string
  students: { id: string; name: string }[]
  defaultDate: Date | null
  onClose: () => void
  onCreated: () => void
}

function NewSessionModal({ teacherId, students, defaultDate, onClose, onCreated }: NewSessionModalProps) {
  const defaultDateStr = defaultDate
    ? defaultDate.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  const [studentId, setStudentId] = useState(students[0]?.id ?? '')
  const [date, setDate] = useState(defaultDateStr)
  const [time, setTime] = useState('09:00')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!studentId || !date) return
    setSaving(true)
    setError(null)
    try {
      await createSession({
        teacherId,
        studentId,
        scheduledDate: `${date}T${time}:00`,
        notes: notes || undefined,
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear sesión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Nueva sesión</h3>

        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
            Estudiante
          </label>
          <select
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="w-24">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
              Hora
            </label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
            Notas (opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Observaciones…"
            className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || !studentId || !date}
            className="flex-1 text-sm font-semibold bg-primary text-gray-900 rounded-lg py-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Creando…' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface CalendarViewProps {
  sessions: ClassSession[]
  loading: boolean
  year: number
  month: number
  teacherId: string
  students: { id: string; name: string }[]
  onMonthChange: (year: number, month: number) => void
  onReload: () => void
}

export default function CalendarView({
  sessions,
  loading,
  year,
  month,
  teacherId,
  students,
  onMonthChange,
  onReload,
}: CalendarViewProps) {
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null)
  const [showNewSession, setShowNewSession] = useState(false)
  const [clickedDate, setClickedDate] = useState<Date | null>(null)

  // Build calendar grid
  const { days } = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay() // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Group sessions by day-of-month
    const byDay: Record<number, ClassSession[]> = {}
    sessions.forEach(s => {
      const d = toLocalDate(s.scheduled_date).getDate()
      if (!byDay[d]) byDay[d] = []
      byDay[d].push(s)
    })

    const days: Array<{ day: number | null; date: Date | null; sessions: ClassSession[]; isHoliday: boolean; holidayName: string | null; isToday: boolean }> = []

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null, sessions: [], isHoliday: false, holidayName: null, isToday: false })
    }

    const today = new Date()
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      days.push({
        day: d,
        date,
        sessions: byDay[d] ?? [],
        isHoliday: isColombianHoliday(date),
        holidayName: getHolidayName(date),
        isToday:
          today.getFullYear() === year &&
          today.getMonth() === month &&
          today.getDate() === d,
      })
    }

    return { days }
  }, [year, month, sessions])

  function prevMonth() {
    if (month === 0) onMonthChange(year - 1, 11)
    else onMonthChange(year, month - 1)
  }

  function nextMonth() {
    if (month === 11) onMonthChange(year + 1, 0)
    else onMonthChange(year, month + 1)
  }

  function handleDayClick(date: Date | null) {
    if (!date) return
    setClickedDate(date)
    setShowNewSession(true)
  }

  // Legend
  const statusCounts = sessions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1
    return acc
  }, {} as Record<SessionStatus, number>)

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
          aria-label="Mes anterior"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
          aria-label="Mes siguiente"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {(Object.keys(statusCounts) as SessionStatus[]).map(s => (
          <span key={s} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[s]}`} />
            {STATUS_LABELS[s]} ({statusCounts[s]})
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 dark:divide-gray-800">
            {days.map((cell, i) => (
              <div
                key={i}
                onClick={() => cell.day ? handleDayClick(cell.date) : undefined}
                className={`min-h-[72px] p-1 relative ${
                  cell.day
                    ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'
                    : 'bg-gray-50/50 dark:bg-gray-900/50'
                } ${cell.isHoliday ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}
              >
                {cell.day && (
                  <>
                    <span className={`text-xs font-semibold block mb-1 leading-none ${
                      cell.isToday
                        ? 'w-5 h-5 rounded-full bg-primary text-gray-900 flex items-center justify-center'
                        : cell.isHoliday
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {cell.day}
                    </span>
                    {cell.holidayName && (
                      <span className="text-[9px] leading-tight text-purple-500 dark:text-purple-400 block truncate">
                        {cell.holidayName}
                      </span>
                    )}
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {cell.sessions.slice(0, 3).map(s => (
                        <button
                          key={s.id}
                          onClick={e => { e.stopPropagation(); setSelectedSession(s) }}
                          className={`w-full text-left text-[10px] leading-tight font-medium text-white rounded px-1 py-0.5 truncate ${STATUS_COLORS[s.status]} hover:opacity-80 transition-opacity`}
                          title={`${s.student?.name ?? 'Estudiante'} — ${STATUS_LABELS[s.status]}`}
                        >
                          {s.student?.name?.split(' ')[0] ?? '—'}
                        </button>
                      ))}
                      {cell.sessions.length > 3 && (
                        <span className="text-[9px] text-gray-400 dark:text-gray-500 pl-1">
                          +{cell.sessions.length - 3} más
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add session button */}
      <button
        onClick={() => { setClickedDate(null); setShowNewSession(true) }}
        className="flex items-center gap-2 text-sm font-medium text-primary border border-primary/30 rounded-lg px-4 py-2 hover:bg-primary/5 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nueva sesión
      </button>

      {/* Session detail modal */}
      {selectedSession && (
        <SessionModal
          session={selectedSession}
          teacherId={teacherId}
          onClose={() => setSelectedSession(null)}
          onUpdated={() => { setSelectedSession(null); onReload() }}
        />
      )}

      {/* New session modal */}
      {showNewSession && (
        <NewSessionModal
          teacherId={teacherId}
          students={students}
          defaultDate={clickedDate}
          onClose={() => setShowNewSession(false)}
          onCreated={() => { setShowNewSession(false); onReload() }}
        />
      )}
    </div>
  )
}

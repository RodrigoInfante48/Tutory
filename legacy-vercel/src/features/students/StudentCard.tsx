import { type StudentSummary } from '../../hooks/useTeacherStudents'

interface StudentCardProps {
  student: StudentSummary
  onClick: () => void
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-12 h-12 rounded-full object-cover"
      />
    )
  }
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
  return (
    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
      <span className="text-sm font-semibold text-primary">{initials}</span>
    </div>
  )
}

export default function StudentCard({ student, onClick }: StudentCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-primary hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <div className="flex items-start gap-3">
        <Avatar name={student.name} url={student.avatar_url} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {student.name}
            </p>
            {student.submittedTasksCount > 0 && (
              <span className="flex-shrink-0 text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded-full px-2 py-0.5">
                {student.submittedTasksCount} por revisar
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {student.plan?.name ?? 'Sin plan asignado'}
          </p>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            {student.nextClass ? (
              <>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="truncate">
                  Próx. clase: {formatDate(student.nextClass.scheduled_date)}
                </span>
              </>
            ) : (
              <>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                <span>Sin clase programada</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type StudyPlan, type Unit, type Topic } from '../../hooks/useStudyPlan'

interface StudyPlanViewProps {
  plan: StudyPlan
}

export default function StudyPlanView({ plan }: StudyPlanViewProps) {
  const totalTopics = plan.units.reduce((acc, u) => acc + u.topics.length, 0)
  const completedTopics = plan.units.reduce(
    (acc, u) => acc + u.topics.filter(t => t.progress?.completed).length,
    0
  )
  const pct = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100)

  return (
    <div className="space-y-5">
      {/* Plan header */}
      <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
        <h2 className="font-heading font-bold text-gray-900 dark:text-white text-base">{plan.name}</h2>
        {plan.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
        )}
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{completedTopics} de {totalTopics} topics completados</span>
            <span className="font-semibold text-primary">{pct}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Units */}
      {plan.units.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">El plan no tiene unidades aún.</p>
      ) : (
        <div className="space-y-3">
          {plan.units.map((unit, i) => (
            <UnitAccordion key={unit.id} unit={unit} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function UnitAccordion({ unit, index }: { unit: Unit; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const completedCount = unit.topics.filter(t => t.progress?.completed).length

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Unit header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {unit.title}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="text-xs text-gray-400">{completedCount}/{unit.topics.length}</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Topics */}
      {open && (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {unit.topics.length === 0 ? (
            <p className="text-xs text-gray-400 px-4 py-3">Sin topics.</p>
          ) : (
            unit.topics.map(topic => (
              <TopicRow key={topic.id} topic={topic} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function TopicRow({ topic }: { topic: Topic }) {
  const navigate = useNavigate()
  const completed = topic.progress?.completed ?? false

  return (
    <button
      onClick={() => navigate(`/student/topic/${topic.id}`)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
    >
      {/* Status icon */}
      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        completed
          ? 'border-primary bg-primary'
          : 'border-gray-300 dark:border-gray-600'
      }`}>
        {completed && (
          <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>

      <span className={`text-sm flex-1 truncate ${
        completed
          ? 'text-gray-400 dark:text-gray-500 line-through'
          : 'text-gray-700 dark:text-gray-300'
      }`}>
        {topic.title}
      </span>

      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

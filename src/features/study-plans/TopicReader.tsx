import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../app/AppLayout'
import { useTopicDetail, saveTopicProgress, type TopicQuestion } from '../../hooks/useStudyPlan'
import { useAuth } from '../../features/auth/AuthContext'

export default function TopicReader() {
  const { topicId } = useParams<{ topicId: string }>()
  const { appUser } = useAuth()
  const navigate = useNavigate()
  const { topic, loading, error } = useTopicDetail(topicId ?? '')

  const [selected, setSelected] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  if (loading) {
    return (
      <AppLayout title="Cargando...">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (error || !topic) {
    return (
      <AppLayout title="Error">
        <div className="p-6 text-red-500">{error ?? 'Topic no encontrado.'}</div>
      </AppLayout>
    )
  }

  const allAnswered = topic.questions.length === 0 || topic.questions.every(q => selected[q.id] !== undefined)
  const score = submitted
    ? Math.round(
        (topic.questions.filter(q => selected[q.id] === q.correct_index).length /
          Math.max(topic.questions.length, 1)) *
          100
      )
    : null

  async function handleSubmit() {
    if (!appUser || !topicId) return
    setSaving(true)
    try {
      await saveTopicProgress(topicId, appUser.id, selected, true)
      setSubmitted(true)
    } catch {
      // silent — user can retry
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout title={topic.title}>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Back */}
        <button
          onClick={() => navigate('/student')}
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al plan
        </button>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">{topic.title}</h1>
        </div>

        {/* Content */}
        {topic.content_html && (
          <div
            className="prose prose-sm dark:prose-invert max-w-none
              prose-p:text-gray-700 dark:prose-p:text-gray-300
              prose-li:text-gray-700 dark:prose-li:text-gray-300
              prose-headings:text-gray-900 dark:prose-headings:text-white"
            dangerouslySetInnerHTML={{ __html: topic.content_html }}
          />
        )}

        {/* Questions */}
        {topic.questions.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-heading font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-6">
              Preguntas
            </h2>
            {topic.questions.map((q, qi) => (
              <QuestionBlock
                key={q.id}
                index={qi}
                question={q}
                selected={selected[q.id]}
                submitted={submitted}
                onSelect={i => !submitted && setSelected(prev => ({ ...prev, [q.id]: i }))}
              />
            ))}

            {/* Score banner */}
            {submitted && score !== null && (
              <div className={`rounded-xl p-4 text-center font-semibold text-lg ${
                score >= 60
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              }`}>
                Resultado: {score}% —{' '}
                {score >= 60
                  ? `¡Muy bien! Completaste este topic.`
                  : 'Sigue practicando. Puedes volver a repasar el contenido.'}
              </div>
            )}

            {/* Submit / done */}
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || saving}
                className="w-full py-3 rounded-xl bg-primary text-gray-900 font-semibold text-sm
                  hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Guardando...' : 'Enviar respuestas'}
              </button>
            ) : (
              <button
                onClick={() => navigate('/student')}
                className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                  font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Volver al plan
              </button>
            )}
          </div>
        )}

        {/* No questions */}
        {topic.questions.length === 0 && !submitted && (
          <button
            onClick={async () => {
              if (!appUser || !topicId) return
              setSaving(true)
              try {
                await saveTopicProgress(topicId, appUser.id, {}, true)
                setSubmitted(true)
              } finally {
                setSaving(false)
              }
            }}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-primary text-gray-900 font-semibold text-sm
              hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            {saving ? 'Guardando...' : 'Marcar como completado'}
          </button>
        )}

        {submitted && topic.questions.length === 0 && (
          <div className="rounded-xl p-4 text-center bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold">
            Topic completado.
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function QuestionBlock({
  index,
  question,
  selected,
  submitted,
  onSelect,
}: {
  index: number
  question: TopicQuestion
  selected: number | undefined
  submitted: boolean
  onSelect: (i: number) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {index + 1}. {question.question}
      </p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = i === question.correct_index
          let cls = 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          if (submitted) {
            if (isCorrect) cls = 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            else if (isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          } else if (isSelected) {
            cls = 'border-primary bg-primary/10 text-gray-900 dark:text-white'
          }

          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              disabled={submitted}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors border ${cls} disabled:cursor-default`}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
              {submitted && isCorrect && (
                <span className="ml-2 text-xs font-semibold">(correcta)</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

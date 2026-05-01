import { useState } from 'react'
import { createQuiz, type Question } from '../../hooks/useTeacherQuizzes'

interface Props {
  onCreated: () => void
  onCancel: () => void
}

function emptyQuestion(): Question {
  return { text: '', options: ['', '', '', ''], correct_index: 0 }
}

export default function QuizCreator({ onCreated, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateQuestion(index: number, patch: Partial<Question>) {
    setQuestions(qs => qs.map((q, i) => i === index ? { ...q, ...patch } : q))
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((o, j) => j === oIndex ? value : o) }
          : q
      )
    )
  }

  function addQuestion() {
    setQuestions(qs => [...qs, emptyQuestion()])
  }

  function removeQuestion(index: number) {
    setQuestions(qs => qs.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) { setError('El título es obligatorio.'); return }
    if (!date) { setError('La fecha es obligatoria.'); return }
    if (questions.length === 0) { setError('Agrega al menos una pregunta.'); return }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) { setError(`Pregunta ${i + 1}: falta el enunciado.`); return }
      if (q.options.some(o => !o.trim())) { setError(`Pregunta ${i + 1}: completa todas las opciones.`); return }
    }

    setSaving(true)
    try {
      await createQuiz({ title: title.trim(), date, questions })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el quiz')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
          Nuevo quiz
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Cancelar
        </button>
      </div>

      {/* Title + Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ej. Vocabulary Unit 3"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div
            key={qi}
            className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Pregunta {qi + 1}
              </span>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qi)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              )}
            </div>

            <input
              type="text"
              value={q.text}
              onChange={e => updateQuestion(qi, { text: e.target.value })}
              placeholder="Escribe la pregunta aquí…"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                    q.correct_index === oi
                      ? 'border-primary bg-primary/10 dark:bg-primary/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correct_index === oi}
                    onChange={() => updateQuestion(qi, { correct_index: oi })}
                    className="accent-primary shrink-0"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={e => updateOption(qi, oi, e.target.value)}
                    placeholder={`Opción ${oi + 1}`}
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                  />
                </label>
              ))}
            </div>
            <p className="text-[11px] text-gray-400">
              Selecciona el radio de la opción correcta.
            </p>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="w-full rounded-xl border border-dashed border-gray-300 dark:border-gray-600 py-3 text-sm text-gray-500 hover:text-primary hover:border-primary transition-colors"
        >
          + Agregar pregunta
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-primary text-gray-900 font-semibold text-sm py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Guardando…' : 'Crear quiz'}
      </button>
    </form>
  )
}

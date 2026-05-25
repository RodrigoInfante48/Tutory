import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import type { PlanBuilderTopic, QuestionInput } from '../../hooks/useAdminPlanBuilder'

interface TopicEditorProps {
  topic: PlanBuilderTopic
  unitTitle: string
  updateTopicContent: (id: string, title: string, contentHtml: string) => Promise<void>
  saveQuestions: (topicId: string, questions: QuestionInput[]) => Promise<void>
}

interface LocalQuestion {
  id?: string
  question: string
  options: [string, string, string, string]
  correct_index: number
}

const LETTERS = ['A', 'B', 'C', 'D']

function emptyQuestion(): LocalQuestion {
  return { question: '', options: ['', '', '', ''], correct_index: 0 }
}

export default function TopicEditor({
  topic,
  unitTitle,
  updateTopicContent,
  saveQuestions,
}: TopicEditorProps) {
  const [localTitle, setLocalTitle] = useState(topic.title)
  const [localContent, setLocalContent] = useState('')
  const [contentLoading, setContentLoading] = useState(true)
  const [preview, setPreview] = useState(false)

  const [questions, setQuestions] = useState<LocalQuestion[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(true)

  const [savingContent, setSavingContent] = useState(false)
  const [savingQuestions, setSavingQuestions] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalTitle(topic.title)
    setLocalContent('')
    setPreview(false)
    setQuestions([])
    setContentLoading(true)
    setQuestionsLoading(true)

    async function load() {
      const [contentRes, questionsRes] = await Promise.all([
        supabase.from('topics').select('content_html').eq('id', topic.id).single(),
        supabase
          .from('topic_questions')
          .select('id, question, options, correct_index')
          .eq('topic_id', topic.id),
      ])
      if (contentRes.data) {
        setLocalContent(contentRes.data.content_html ?? '')
      }
      setContentLoading(false)

      if (questionsRes.data) {
        setQuestions(
          questionsRes.data.map((q) => ({
            id: q.id as string,
            question: q.question as string,
            options: (q.options ?? ['', '', '', '']) as [string, string, string, string],
            correct_index: q.correct_index as number,
          })),
        )
      }
      setQuestionsLoading(false)
    }

    load()
  }, [topic.id])

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }

  async function handleSaveContent() {
    setSavingContent(true)
    try {
      await updateTopicContent(topic.id, localTitle, localContent)
      showToast('Guardado')
    } catch {
      showToast('Error al guardar')
    } finally {
      setSavingContent(false)
    }
  }

  async function handleSaveQuestions() {
    setSavingQuestions(true)
    try {
      await saveQuestions(topic.id, questions)
      showToast('Preguntas guardadas')
    } catch {
      showToast('Error al guardar preguntas')
    } finally {
      setSavingQuestions(false)
    }
  }

  function updateQuestion(idx: number, patch: Partial<LocalQuestion>) {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)))
  }

  function updateOption(qIdx: number, optIdx: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q
        const opts = [...q.options] as [string, string, string, string]
        opts[optIdx] = value
        return { ...q, options: opts }
      }),
    )
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium shadow-lg pointer-events-none animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <span className="text-xs text-gray-400 dark:text-gray-500">{unitTitle}</span>
        <span className="text-gray-300 dark:text-gray-700 text-xs">→</span>
        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate">
          {localTitle || topic.title}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* ── Section 1: CONTENIDO ── */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            Contenido
          </h3>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Título del topic
            </label>
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleSaveContent}
              disabled={savingContent}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-60 transition-colors"
              placeholder="Título del topic…"
            />
          </div>

          {/* Content textarea / preview */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Contenido HTML
              </label>
              <button
                type="button"
                onClick={() => setPreview((v) => !v)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {preview ? (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2 2.5A.5.5 0 0 1 2.5 2h11a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-1Zm0 4A.5.5 0 0 1 2.5 6h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 6.5Zm0 4A.5.5 0 0 1 2.5 10h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 2 10.5Z" />
                    </svg>
                    Editar
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
                      <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8Zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                    </svg>
                    Vista previa
                  </>
                )}
              </button>
            </div>

            {contentLoading ? (
              <div className="h-48 rounded-lg bg-gray-50 dark:bg-gray-800 animate-pulse" />
            ) : preview ? (
              <div
                className="min-h-48 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                  prose prose-sm dark:prose-invert max-w-none
                  prose-p:text-gray-700 dark:prose-p:text-gray-300
                  prose-headings:text-gray-900 dark:prose-headings:text-white
                  prose-li:text-gray-700 dark:prose-li:text-gray-300"
                dangerouslySetInnerHTML={{ __html: localContent || '<p class="text-gray-400">Sin contenido.</p>' }}
              />
            ) : (
              <textarea
                value={localContent}
                onChange={(e) => setLocalContent(e.target.value)}
                onBlur={handleSaveContent}
                disabled={savingContent}
                rows={12}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-60 resize-y transition-colors"
                placeholder="<p>Contenido HTML del topic...</p>"
              />
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveContent}
            disabled={savingContent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-gray-900 text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {savingContent ? (
              <span className="w-3 h-3 border border-gray-900/40 border-t-gray-900 rounded-full animate-spin" />
            ) : null}
            Guardar contenido
          </button>
        </section>

        {/* ── Section 2: PREGUNTAS ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Preguntas
              {questions.length > 0 && (
                <span className="ml-2 text-primary">{questions.length}</span>
              )}
            </h3>
          </div>

          {questionsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-gray-50 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4 space-y-3"
                >
                  {/* Question text + delete */}
                  <div className="flex items-start gap-2">
                    <span className="mt-2 text-xs font-semibold text-gray-400 dark:text-gray-500 flex-shrink-0 w-4">
                      {qIdx + 1}.
                    </span>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                      placeholder="Texto de la pregunta…"
                      className="flex-1 min-w-0 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
                      className="mt-1 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
                      title="Eliminar pregunta"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.576l-.66-6.6a.75.75 0 1 1 1.492-.149Z" />
                      </svg>
                    </button>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pl-6">
                    {LETTERS.map((letter, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correct_index === optIdx}
                          onChange={() => updateQuestion(qIdx, { correct_index: optIdx })}
                          className="flex-shrink-0 accent-green-500 w-3.5 h-3.5 cursor-pointer"
                          title="Marcar como correcta"
                        />
                        <span
                          className={`text-xs font-semibold flex-shrink-0 w-4 ${
                            q.correct_index === optIdx
                              ? 'text-green-600 dark:text-primary'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {letter}.
                        </span>
                        <input
                          type="text"
                          value={q.options[optIdx] ?? ''}
                          onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                          placeholder={`Opción ${letter}…`}
                          className="flex-1 min-w-0 px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Add question */}
              <button
                type="button"
                onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm text-gray-400 dark:text-gray-500 hover:text-primary-dark dark:hover:text-primary rounded-xl border border-dashed border-gray-200 dark:border-gray-700 hover:border-primary/40 transition-colors"
              >
                <span className="text-base leading-none">+</span>
                Agregar pregunta
              </button>

              {/* Save questions */}
              {questions.length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveQuestions}
                  disabled={savingQuestions}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-gray-900 text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {savingQuestions ? (
                    <span className="w-3 h-3 border border-gray-900/40 border-t-gray-900 rounded-full animate-spin" />
                  ) : null}
                  Guardar preguntas
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface TopicQuestion {
  id: string
  question: string
  options: string[]
  correct_index: number
}

export interface Topic {
  id: string
  unit_id: string
  title: string
  content_html: string | null
  order: number
  progress: TopicProgress | null
}

export interface TopicProgress {
  id: string
  answers: Record<string, number>
  completed: boolean
  completed_at: string | null
}

export interface Unit {
  id: string
  title: string
  order: number
  topics: Topic[]
}

export interface StudyPlan {
  id: string
  name: string
  description: string | null
  units: Unit[]
}

export function useStudyPlan(planId: string | null, studentId: string) {
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!planId) {
      setPlan(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [planRes, unitsRes, topicsRes, progressRes] = await Promise.all([
        supabase
          .from('study_plans')
          .select('id, name, description')
          .eq('id', planId)
          .single(),
        supabase
          .from('units')
          .select('id, title, order')
          .eq('plan_id', planId)
          .order('order', { ascending: true }),
        supabase
          .from('topics')
          .select('id, unit_id, title, content_html, order')
          .in(
            'unit_id',
            await supabase
              .from('units')
              .select('id')
              .eq('plan_id', planId)
              .then(r => (r.data ?? []).map((u: { id: string }) => u.id))
          )
          .order('order', { ascending: true }),
        supabase
          .from('topic_progress')
          .select('id, topic_id, answers, completed, completed_at')
          .eq('student_id', studentId),
      ])

      if (planRes.error) throw planRes.error

      const progressMap = new Map<string, TopicProgress>(
        (progressRes.data ?? []).map((p: {
          id: string
          topic_id: string
          answers: Record<string, number>
          completed: boolean
          completed_at: string | null
        }) => [
          p.topic_id,
          { id: p.id, answers: p.answers ?? {}, completed: p.completed, completed_at: p.completed_at },
        ])
      )

      const units: Unit[] = (unitsRes.data ?? []).map((u: { id: string; title: string; order: number }) => ({
        ...u,
        topics: (topicsRes.data ?? [])
          .filter((t: { unit_id: string }) => t.unit_id === u.id)
          .map((t: { id: string; unit_id: string; title: string; content_html: string | null; order: number }) => ({
            ...t,
            progress: progressMap.get(t.id) ?? null,
          })),
      }))

      setPlan({ ...planRes.data, units })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el plan')
    } finally {
      setLoading(false)
    }
  }, [planId, studentId])

  useEffect(() => { load() }, [load])

  return { plan, loading, error, reload: load }
}

export function useTopicDetail(topicId: string) {
  const [topic, setTopic] = useState<(Topic & { questions: TopicQuestion[] }) | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!topicId) return
    setLoading(true)
    Promise.all([
      supabase
        .from('topics')
        .select('id, unit_id, title, content_html, order')
        .eq('id', topicId)
        .single(),
      supabase
        .from('topic_questions')
        .select('id, question, options, correct_index')
        .eq('topic_id', topicId)
        .order('id', { ascending: true }),
    ])
      .then(([topicRes, questionsRes]) => {
        if (topicRes.error) throw topicRes.error
        setTopic({
          ...topicRes.data,
          progress: null,
          questions: (questionsRes.data ?? []) as TopicQuestion[],
        })
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false))
  }, [topicId])

  return { topic, loading, error }
}

export async function saveTopicProgress(
  topicId: string,
  studentId: string,
  answers: Record<string, number>,
  completed: boolean
) {
  const now = completed ? new Date().toISOString() : null
  const { error } = await supabase
    .from('topic_progress')
    .upsert(
      { topic_id: topicId, student_id: studentId, answers, completed, completed_at: now },
      { onConflict: 'topic_id,student_id' }
    )
  if (error) throw error
}

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface GlossaryEntry {
  id: string
  student_id: string
  word: string
  definition: string
  context_sentence: string | null
  session_id: string | null
  added_by: string
  mastered: boolean
  created_at: string
}

export function useStudentGlossary(studentId: string | null) {
  const [entries, setEntries] = useState<GlossaryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('student_glossary')
        .select('id, student_id, word, definition, context_sentence, session_id, added_by, mastered, created_at')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
      if (err) throw err
      setEntries(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar glosario')
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => { load() }, [load])

  return { entries, loading, error, reload: load }
}

export async function addGlossaryEntry(params: {
  studentId: string
  word: string
  definition: string
  contextSentence?: string
  sessionId?: string
  addedBy: string
}): Promise<GlossaryEntry> {
  const { data, error } = await supabase
    .from('student_glossary')
    .insert({
      student_id: params.studentId,
      word: params.word.trim(),
      definition: params.definition.trim(),
      context_sentence: params.contextSentence?.trim() || null,
      session_id: params.sessionId ?? null,
      added_by: params.addedBy,
      mastered: false,
    })
    .select('id, student_id, word, definition, context_sentence, session_id, added_by, mastered, created_at')
    .single()
  if (error) throw error
  return data as GlossaryEntry
}

export async function deleteGlossaryEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('student_glossary')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function toggleMastered(id: string, mastered: boolean): Promise<void> {
  const { error } = await supabase
    .from('student_glossary')
    .update({ mastered })
    .eq('id', id)
  if (error) throw error
}

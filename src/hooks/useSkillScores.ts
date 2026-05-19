import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const SKILLS = ['Speaking', 'Listening', 'Grammar', 'Vocabulary', 'Writing', 'Pronunciation'] as const
export type Skill = typeof SKILLS[number]

export interface SkillScore {
  id: string
  student_id: string
  skill: Skill
  score: number
  updated_at: string
}

const DEFAULT_SCORES: Record<Skill, number> = {
  Speaking: 50,
  Listening: 50,
  Grammar: 50,
  Vocabulary: 50,
  Writing: 50,
  Pronunciation: 50,
}

export function useSkillScores(studentId: string | undefined) {
  const [scores, setScores] = useState<Record<Skill, number>>(DEFAULT_SCORES)
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!studentId) return
    const { data } = await supabase
      .from('skill_scores')
      .select('*')
      .eq('student_id', studentId)

    if (data && data.length > 0) {
      const map = { ...DEFAULT_SCORES }
      for (const row of data) {
        map[row.skill as Skill] = row.score
      }
      setScores(map)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId])

  return { scores, loading, reload: load }
}

export async function upsertSkillScore(studentId: string, skill: Skill, score: number) {
  const { error } = await supabase
    .from('skill_scores')
    .upsert(
      { student_id: studentId, skill, score, updated_at: new Date().toISOString() },
      { onConflict: 'student_id,skill' }
    )
  if (error) throw error
}

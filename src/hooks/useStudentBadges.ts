import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type BadgeType =
  | 'mission_accomplished'
  | 'streak_week'
  | 'quiz_master'
  | 'vocabulary_hero'
  | 'perfect_attendance'

export interface StudentBadge {
  id: string
  student_id: string
  badge_type: BadgeType
  cycle_id: string | null
  earned_at: string
  seen: boolean
}

export interface BadgeMeta {
  icon: string
  name: string
  description: string
  gradient: string
  glow: string
}

export const BADGE_META: Record<BadgeType, BadgeMeta> = {
  mission_accomplished: {
    icon: '🏆',
    name: 'Misión Cumplida',
    description: 'Completar un ciclo con el mínimo de clases requeridas',
    gradient: 'from-yellow-400 to-amber-500',
    glow: 'shadow-amber-200 dark:shadow-amber-900/50',
  },
  streak_week: {
    icon: '🔥',
    name: 'Racha Semanal',
    description: '7 días consecutivos activos en la plataforma',
    gradient: 'from-orange-400 to-red-500',
    glow: 'shadow-orange-200 dark:shadow-orange-900/50',
  },
  quiz_master: {
    icon: '🎯',
    name: 'Quiz Master',
    description: 'Completar 5 quizzes con score ≥ 80%',
    gradient: 'from-blue-400 to-indigo-500',
    glow: 'shadow-blue-200 dark:shadow-blue-900/50',
  },
  vocabulary_hero: {
    icon: '📖',
    name: 'Vocabulario Hero',
    description: 'Dominar 20 palabras en el glosario',
    gradient: 'from-purple-400 to-violet-500',
    glow: 'shadow-purple-200 dark:shadow-purple-900/50',
  },
  perfect_attendance: {
    icon: '⭐',
    name: 'Asistencia Perfecta',
    description: 'Completar un ciclo sin ningún no-show',
    gradient: 'from-green-400 to-emerald-500',
    glow: 'shadow-green-200 dark:shadow-green-900/50',
  },
}

export const ALL_BADGE_TYPES: BadgeType[] = [
  'mission_accomplished',
  'streak_week',
  'quiz_master',
  'vocabulary_hero',
  'perfect_attendance',
]

export function useStudentBadges(studentId: string | undefined) {
  const [badges, setBadges] = useState<StudentBadge[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!studentId) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('student_badges')
      .select('*')
      .eq('student_id', studentId)
      .order('earned_at', { ascending: false })
    setBadges(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [studentId])

  async function markAllSeen() {
    if (!studentId) return
    const hasUnseen = badges.some(b => !b.seen)
    if (!hasUnseen) return
    await supabase
      .from('student_badges')
      .update({ seen: true })
      .eq('student_id', studentId)
      .eq('seen', false)
    setBadges(prev => prev.map(b => ({ ...b, seen: true })))
  }

  return { badges, loading, reload: load, markAllSeen }
}

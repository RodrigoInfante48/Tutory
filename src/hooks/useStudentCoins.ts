import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface CoinEntry {
  id: string
  amount: number
  reason: string
  session_id: string | null
  created_at: string
}

export function useStudentCoins(studentId: string | undefined) {
  const [coins, setCoins] = useState<CoinEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return
    setLoading(true)
    supabase
      .from('student_coins')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const entries = data ?? []
        setCoins(entries)
        setTotal(entries.reduce((sum, e) => sum + e.amount, 0))
        setLoading(false)
      })
  }, [studentId])

  return { coins, total, loading }
}

export async function awardCoins(params: {
  studentId: string
  amount: number
  reason: string
  sessionId?: string
}) {
  const { error } = await supabase.from('student_coins').insert({
    student_id: params.studentId,
    amount: params.amount,
    reason: params.reason,
    session_id: params.sessionId ?? null,
  })
  if (error) throw error
}

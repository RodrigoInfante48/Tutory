import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/AuthContext'

export interface GroupMember {
  student_id: string
  name: string
  email: string
  avatar_url: string | null
}

export interface Group {
  id: string
  name: string
  teacher_id: string
  created_at: string
  members: GroupMember[]
}

export interface GroupSimple {
  id: string
  name: string
}

export function useTeacherGroups() {
  const { appUser } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!appUser) return
    try {
      setLoading(true)
      setError(null)

      const { data: groupsData, error: groupsErr } = await supabase
        .from('groups')
        .select('id, name, teacher_id, created_at')
        .eq('teacher_id', appUser.id)
        .order('created_at', { ascending: true })

      if (groupsErr) throw groupsErr
      if (!groupsData || groupsData.length === 0) {
        setGroups([])
        return
      }

      const groupIds = groupsData.map(g => g.id)

      const { data: membersData, error: membersErr } = await supabase
        .from('group_members')
        .select('group_id, student_id, students(users(name, email, avatar_url))')
        .in('group_id', groupIds)

      if (membersErr) throw membersErr

      const membersByGroup: Record<string, GroupMember[]> = {}
      for (const gm of membersData ?? []) {
        const student = gm.students as unknown as { users: { name: string; email: string; avatar_url: string | null } } | null
        const user = student?.users ?? { name: '', email: '', avatar_url: null }
        if (!membersByGroup[gm.group_id]) membersByGroup[gm.group_id] = []
        membersByGroup[gm.group_id].push({
          student_id: gm.student_id,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        })
      }

      setGroups(groupsData.map(g => ({
        ...g,
        members: membersByGroup[g.id] ?? [],
      })))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar grupos')
    } finally {
      setLoading(false)
    }
  }, [appUser])

  useEffect(() => { load() }, [load])

  return { groups, loading, error, reload: load }
}

export function useTeacherGroupsSimple() {
  const { appUser } = useAuth()
  const [groups, setGroups] = useState<GroupSimple[]>([])

  useEffect(() => {
    if (!appUser) return
    supabase
      .from('groups')
      .select('id, name')
      .eq('teacher_id', appUser.id)
      .order('name')
      .then(({ data }) => setGroups(data ?? []))
  }, [appUser])

  return groups
}

export async function createGroup(teacherId: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('groups')
    .insert({ teacher_id: teacherId, name: name.trim() })
  if (error) throw error
}

export async function addGroupMember(groupId: string, studentId: string): Promise<void> {
  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, student_id: studentId })
  if (error) throw error
}

export async function removeGroupMember(groupId: string, studentId: string): Promise<void> {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('student_id', studentId)
  if (error) throw error
}

export async function getGroupMemberIds(groupId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select('student_id')
    .eq('group_id', groupId)
  if (error) throw error
  return (data ?? []).map(m => m.student_id)
}

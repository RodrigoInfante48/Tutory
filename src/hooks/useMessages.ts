import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/AuthContext'

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  body: string
  voice_url: string | null
  sent_at: string
  read_at: string | null
}

export interface Conversation {
  partnerId: string
  partnerName: string
  partnerAvatar: string | null
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export function useConversations() {
  const { appUser } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!appUser) return
    try {
      setLoading(true)
      setError(null)

      // Get all messages where user is sender or receiver
      const { data, error: err } = await supabase
        .from('messages')
        .select(`
          id, sender_id, receiver_id, body, voice_url, sent_at, read_at,
          sender:users!messages_sender_id_fkey(id, name, avatar_url),
          receiver:users!messages_receiver_id_fkey(id, name, avatar_url)
        `)
        .or(`sender_id.eq.${appUser.id},receiver_id.eq.${appUser.id}`)
        .order('sent_at', { ascending: false })

      if (err) throw err

      // Build conversation map: key = partner's id
      const convMap = new Map<string, Conversation>()
      for (const msg of data ?? []) {
        const isSender = msg.sender_id === appUser.id
        const partner = isSender
          ? (msg.receiver as unknown as { id: string; name: string; avatar_url: string | null })
          : (msg.sender as unknown as { id: string; name: string; avatar_url: string | null })

        if (!convMap.has(partner.id)) {
          const msgBody = (msg as unknown as { voice_url?: string }).voice_url && !msg.body
            ? '🎤 Nota de voz'
            : msg.body
          convMap.set(partner.id, {
            partnerId: partner.id,
            partnerName: partner.name,
            partnerAvatar: partner.avatar_url,
            lastMessage: msgBody,
            lastMessageAt: msg.sent_at,
            unreadCount: !isSender && !msg.read_at ? 1 : 0,
          })
        } else {
          const conv = convMap.get(partner.id)!
          if (!isSender && !msg.read_at) {
            conv.unreadCount += 1
          }
        }
      }
      setConversations(Array.from(convMap.values()))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar conversaciones')
    } finally {
      setLoading(false)
    }
  }, [appUser])

  useEffect(() => { load() }, [load])

  return { conversations, loading, error, reload: load }
}

export function useChat(partnerId: string) {
  const { appUser } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const load = useCallback(async () => {
    if (!appUser || !partnerId) return
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, body, voice_url, sent_at, read_at')
        .or(
          `and(sender_id.eq.${appUser.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${appUser.id})`
        )
        .order('sent_at', { ascending: true })
      if (err) throw err
      setMessages((data ?? []) as Message[])

      // Mark received messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', partnerId)
        .eq('receiver_id', appUser.id)
        .is('read_at', null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [appUser, partnerId])

  useEffect(() => {
    load()

    // Realtime subscription
    if (!appUser || !partnerId) return
    const channel = supabase
      .channel(`chat-${appUser.id}-${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${appUser.id}`,
        },
        (payload) => {
          const msg = payload.new as Message
          if (msg.sender_id === partnerId) {
            setMessages((prev) => [...prev, msg])
            // Mark as read immediately since window is open
            supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', msg.id)
              .then(() => {})
          }
        }
      )
      .subscribe()

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
    }
  }, [appUser, partnerId, load])

  const sendMessage = useCallback(
    async (body: string, voiceUrl?: string) => {
      if (!appUser || !partnerId) return
      if (!voiceUrl && !body.trim()) return
      const optimistic: Message = {
        id: crypto.randomUUID(),
        sender_id: appUser.id,
        receiver_id: partnerId,
        body: body.trim(),
        voice_url: voiceUrl ?? null,
        sent_at: new Date().toISOString(),
        read_at: null,
      }
      setMessages((prev) => [...prev, optimistic])

      const { error: err } = await supabase.from('messages').insert({
        sender_id: appUser.id,
        receiver_id: partnerId,
        body: body.trim(),
        ...(voiceUrl ? { voice_url: voiceUrl } : {}),
      })
      if (err) {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
        throw err
      }
    },
    [appUser, partnerId]
  )

  return { messages, loading, error, sendMessage }
}

export function useTypingIndicator(partnerId: string) {
  const { appUser } = useAuth()
  const [partnerIsTyping, setPartnerIsTyping] = useState(false)
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!appUser || !partnerId) return
    const channel = supabase
      .channel(`typing-${appUser.id}-${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_with=eq.${appUser.id}`,
        },
        (payload) => {
          const row = payload.new as { user_id: string; updated_at: string } | undefined
          if (!row || row.user_id !== partnerId) return
          const age = Date.now() - new Date(row.updated_at).getTime()
          if (age < 3000) {
            setPartnerIsTyping(true)
            if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
            clearTimerRef.current = setTimeout(() => setPartnerIsTyping(false), 3000)
          } else {
            setPartnerIsTyping(false)
          }
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
    }
  }, [appUser, partnerId])

  const notifyTyping = useCallback(async () => {
    if (!appUser || !partnerId) return
    await supabase.from('typing_indicators').upsert(
      { user_id: appUser.id, conversation_with: partnerId, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,conversation_with' }
    )
  }, [appUser, partnerId])

  const clearTyping = useCallback(async () => {
    if (!appUser || !partnerId) return
    await supabase
      .from('typing_indicators')
      .update({ updated_at: new Date(0).toISOString() })
      .eq('user_id', appUser.id)
      .eq('conversation_with', partnerId)
  }, [appUser, partnerId])

  const handleTyping = useCallback(() => {
    notifyTyping()
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    stopTimerRef.current = setTimeout(() => clearTyping(), 3000)
  }, [notifyTyping, clearTyping])

  return { partnerIsTyping, handleTyping }
}

export function useUnreadCount() {
  const { appUser } = useAuth()
  const [count, setCount] = useState(0)

  const load = useCallback(async () => {
    if (!appUser) return
    const { count: n } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', appUser.id)
      .is('read_at', null)
    setCount(n ?? 0)
  }, [appUser])

  useEffect(() => {
    load()
    if (!appUser) return
    const channel = supabase
      .channel(`unread-${appUser.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${appUser.id}` },
        () => { load() }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [appUser, load])

  return count
}

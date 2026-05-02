import React, { useState, useEffect, useRef } from 'react'
import { useChat } from '../../hooks/useMessages'
import { useAuth } from '../auth/AuthContext'

interface ChatWindowProps {
  partnerId: string
  partnerName: string
  partnerAvatar: string | null
}

function Avatar({ name, url, size = 'sm' }: { name: string; url: string | null; size?: 'sm' | 'md' }) {
  const px = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  if (url) {
    return <img src={url} alt={name} className={`${px} rounded-full object-cover flex-shrink-0`} />
  }
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className={`${px} rounded-full bg-primary/20 text-primary-dark dark:text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  )
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function formatDay(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Hoy'
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer'
  return new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
}

export default function ChatWindow({ partnerId, partnerName, partnerAvatar }: ChatWindowProps) {
  const { appUser } = useAuth()
  const { messages, loading, sendMessage } = useChat(partnerId)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!draft.trim() || sending) return
    setSendError(null)
    setSending(true)
    try {
      await sendMessage(draft)
      setDraft('')
      inputRef.current?.focus()
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Error al enviar')
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by day
  const grouped: { day: string; msgs: typeof messages }[] = []
  for (const msg of messages) {
    const day = new Date(msg.sent_at).toDateString()
    const last = grouped[grouped.length - 1]
    if (!last || last.day !== day) {
      grouped.push({ day, msgs: [msg] })
    } else {
      last.msgs.push(msg)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <Avatar name={partnerName} url={partnerAvatar} size="md" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">{partnerName}</p>
          <p className="text-xs text-green-500">En línea</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl mb-3">💬</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Inicia la conversación con {partnerName}
            </p>
          </div>
        ) : (
          grouped.map(({ day, msgs }) => (
            <div key={day}>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                <span className="text-xs text-gray-400 dark:text-gray-600 whitespace-nowrap">
                  {formatDay(msgs[0].sent_at)}
                </span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              </div>
              <div className="space-y-2">
                {msgs.map((msg) => {
                  const isMe = msg.sender_id === appUser?.id
                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && <Avatar name={partnerName} url={partnerAvatar} />}
                      <div className={`max-w-[70%] group`}>
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                          }`}
                        >
                          {msg.body}
                        </div>
                        <p className={`text-[10px] text-gray-400 mt-0.5 ${isMe ? 'text-right' : 'text-left'}`}>
                          {formatTime(msg.sent_at)}
                          {isMe && msg.read_at && (
                            <span className="ml-1 text-primary">✓✓</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {sendError && (
          <p className="text-xs text-red-500 mb-2">{sendError}</p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje... (Enter para enviar)"
            rows={1}
            className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 flex-shrink-0"
            aria-label="Enviar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

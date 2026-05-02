import { useState } from 'react'
import AppLayout from '../../app/AppLayout'
import { useConversations } from '../../hooks/useMessages'
import ChatWindow from './ChatWindow'

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return <img src={url} alt={name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
  }
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary-dark dark:text-primary font-semibold text-sm flex items-center justify-center flex-shrink-0">
      {initials}
    </div>
  )
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) {
    return new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(d)
  }
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(d)
}

export default function MessagesPage() {
  const { conversations, loading, error } = useConversations()
  const [activeId, setActiveId] = useState<string | null>(null)

  const active = conversations.find((c) => c.partnerId === activeId) ?? null

  return (
    <AppLayout title="Mensajes">
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar: conversation list */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900">
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-heading font-semibold text-gray-900 dark:text-white">Mensajes</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <p className="text-sm text-red-500 text-center py-8 px-4">{error}</p>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl mb-3">💬</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay mensajes aún.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.partnerId}
                  onClick={() => setActiveId(conv.partnerId)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-100 dark:border-gray-800 ${
                    activeId === conv.partnerId ? 'bg-primary/5 dark:bg-primary/10' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar name={conv.partnerName} url={conv.partnerAvatar} />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                        {conv.partnerName}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {active ? (
            <ChatWindow
              partnerId={active.partnerId}
              partnerName={active.partnerName}
              partnerAvatar={active.partnerAvatar}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-4xl mb-4">💬</div>
              <h3 className="font-heading font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Selecciona una conversación
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-600 max-w-xs">
                Elige un estudiante de la lista para ver sus mensajes
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

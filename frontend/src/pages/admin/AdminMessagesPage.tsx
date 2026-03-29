import { useEffect, useState } from 'react'
import { getAdminMessages, markMessageAsRead } from '../../services/api'
import type { ContactMessage } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterUnread, setFilterUnread] = useState(false)

  useEffect(() => {
    getAdminMessages()
      .then(setMessages)
      .catch(() => setError('Failed to load messages.'))
      .finally(() => setLoading(false))
  }, [])

  const handleMarkRead = async (id: number) => {
    try {
      const updated = await markMessageAsRead(id)
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)))
    } catch {
      setError('Failed to mark message as read.')
    }
  }

  const unread = messages.filter((m) => !m.readStatus).length
  const filtered = filterUnread ? messages.filter((m) => !m.readStatus) : messages

  if (loading) return <LoadingSpinner label="Loading messages…" />

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h1 className="text-white text-3xl font-black">Messages</h1>
        {unread > 0 && (
          <span className="bg-pink-500/20 text-pink-400 text-sm font-semibold px-3 py-1 rounded-full border border-pink-500/20">
            {unread} unread
          </span>
        )}
        <button
          onClick={() => setFilterUnread((f) => !f)}
          className={`ml-auto text-sm px-3 py-1.5 rounded-lg border transition-colors ${
            filterUnread
              ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
              : 'text-gray-400 border-gray-700 hover:border-gray-500'
          }`}
        >
          {filterUnread ? 'Show All' : 'Unread Only'}
        </button>
      </div>

      {error && <div className="mb-6"><ErrorBanner message={error} onDismiss={() => setError('')} /></div>}

      {filtered.length === 0 ? (
        <EmptyState
          icon="✉️"
          title={filterUnread ? 'No unread messages' : 'No messages yet'}
          description={filterUnread ? "You're all caught up!" : 'Contact form submissions will appear here.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              className={`bg-gray-900 border rounded-xl p-5 ${
                m.readStatus ? 'border-gray-800' : 'border-pink-800/50 bg-pink-950/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-white font-bold">{m.name}</h3>
                    {!m.readStatus && (
                      <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full border border-pink-500/20">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
                  {m.subject && (
                    <p className="text-gray-200 text-sm font-medium mt-2">{m.subject}</p>
                  )}
                  <p className="text-gray-400 text-sm mt-1 whitespace-pre-line">{m.message}</p>
                  <p className="text-gray-600 text-xs mt-2">
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
                {!m.readStatus && (
                  <button
                    onClick={() => handleMarkRead(m.id)}
                    className="text-pink-400 hover:text-pink-300 text-sm ml-4 whitespace-nowrap shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

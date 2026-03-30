import { useEffect, useState } from 'react'
import { deleteAdminMessage, getAdminMessages, markMessageAsRead } from '../../services/api'
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
      setMessages((prev) => prev.map((item) => (item.id === id ? updated : item)))
    } catch {
      setError('Failed to mark message as read.')
    }
  }

  const handleDelete = async (message: ContactMessage) => {
    if (!window.confirm(`Delete the message from ${message.name}?`)) {
      return
    }

    try {
      await deleteAdminMessage(message.id)
      setMessages((prev) => prev.filter((item) => item.id !== message.id))
    } catch {
      setError('Failed to delete message.')
    }
  }

  const unread = messages.filter((item) => !item.readStatus).length
  const filtered = filterUnread ? messages.filter((item) => !item.readStatus) : messages

  if (loading) return <LoadingSpinner label="Loading messages..." />

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h1 className="text-white text-3xl font-black">Messages</h1>
        {unread > 0 ? (
          <span className="bg-pink-500/20 text-pink-400 text-sm font-semibold px-3 py-1 rounded-full border border-pink-500/20">
            {unread} unread
          </span>
        ) : null}
        <button
          onClick={() => setFilterUnread((value) => !value)}
          className={`ml-auto text-sm px-3 py-1.5 rounded-lg border ${
            filterUnread
              ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
              : 'text-gray-400 border-gray-700 hover:border-gray-500'
          }`}
        >
          {filterUnread ? 'Show All' : 'Unread Only'}
        </button>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="Mail"
          title={filterUnread ? 'No unread messages' : 'No messages yet'}
          description={filterUnread ? 'You are all caught up.' : 'Contact form submissions will appear here.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((message) => (
            <div
              key={message.id}
              className={`bg-gray-900 border rounded-xl p-5 ${
                message.readStatus ? 'border-gray-800' : 'border-pink-800/50 bg-pink-950/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-white font-bold">{message.name}</h3>
                    {!message.readStatus ? (
                      <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full border border-pink-500/20">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {message.email}
                    {message.phone ? `, ${message.phone}` : ''}
                  </p>
                  {message.subject ? (
                    <p className="text-gray-200 text-sm font-medium mt-2">{message.subject}</p>
                  ) : null}
                  <p className="text-gray-400 text-sm mt-1 whitespace-pre-line">{message.message}</p>
                  <p className="text-gray-600 text-xs mt-2">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  {!message.readStatus ? (
                    <button
                      onClick={() => handleMarkRead(message.id)}
                      className="text-pink-400 hover:text-pink-300 text-sm"
                    >
                      Mark Read
                    </button>
                  ) : null}
                  <button
                    onClick={() => handleDelete(message)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

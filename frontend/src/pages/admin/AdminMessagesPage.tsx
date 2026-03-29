import { useEffect, useState } from 'react'
import { getAdminMessages, markMessageAsRead } from '../../services/api'
import type { ContactMessage } from '../../types'

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminMessages()
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleMarkRead = async (id: number) => {
    try {
      const updated = await markMessageAsRead(id)
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="text-gray-400">Loading messages…</div>

  const unread = messages.filter((m) => !m.readStatus).length

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-white text-3xl font-black">Messages</h1>
        {unread > 0 && (
          <span className="bg-pink-500/20 text-pink-400 text-sm font-semibold px-3 py-1 rounded-full">
            {unread} unread
          </span>
        )}
      </div>

      {messages.length === 0 ? (
        <p className="text-gray-400">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`bg-gray-900 border rounded-xl p-5 ${
                m.readStatus ? 'border-gray-800' : 'border-pink-800/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-bold">{m.name}</h3>
                    {!m.readStatus && (
                      <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{m.email} {m.phone && `· ${m.phone}`}</p>
                  {m.subject && (
                    <p className="text-gray-300 text-sm font-medium mt-2">{m.subject}</p>
                  )}
                  <p className="text-gray-400 text-sm mt-1">{m.message}</p>
                  <p className="text-gray-600 text-xs mt-2">
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
                {!m.readStatus && (
                  <button
                    onClick={() => handleMarkRead(m.id)}
                    className="text-pink-400 hover:text-pink-300 text-sm ml-4 whitespace-nowrap"
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

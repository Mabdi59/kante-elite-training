import { useEffect, useState } from 'react'
import axios from 'axios'

import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

type Tab = 'inbox' | 'sent' | 'compose'

interface Message {
  id: number
  senderEmail: string
  senderName?: string
  recipientEmail: string
  subject: string
  body: string
  read: boolean
  createdAt: string
  parentId?: number
}

export default function MessagesPage() {
  const [tab, setTab] = useState<Tab>('inbox')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Message | null>(null)

  // Compose state
  const [recipientEmail, setRecipientEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [parentId, setParentId] = useState<number | undefined>()
  const [sending, setSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  const token = localStorage.getItem('token')

  const fetchMessages = async (t: Tab) => {
    if (t === 'compose') return
    setLoading(true)
    setError('')
    try {
      const endpoint = t === 'inbox' ? '/api/messages/inbox' : '/api/messages/sent'
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(res.data ?? [])
    } catch {
      setError('Failed to load messages.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages(tab)
    setSelected(null)
  }, [tab, token])

  const handleSelect = async (msg: Message) => {
    setSelected(msg)
    if (!msg.read && tab === 'inbox') {
      try {
        await axios.patch(`/api/messages/${msg.id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)))
      } catch {
        // silent
      }
    }
  }

  const handleReply = (msg: Message) => {
    setRecipientEmail(msg.senderEmail)
    setSubject(`Re: ${msg.subject}`)
    setParentId(msg.id)
    setTab('compose')
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSendSuccess(false)
    try {
      await axios.post(
        '/api/messages',
        { recipientEmail, subject, body, parentId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setSendSuccess(true)
      setRecipientEmail('')
      setSubject('')
      setBody('')
      setParentId(undefined)
    } catch {
      setError('Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-black text-white">Messages</h1>

      {error && <ErrorBanner message={error} />}

        <div className="flex gap-1 rounded-xl border border-white/10 bg-zinc-900 p-1">
          {(['inbox', 'sent', 'compose'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-colors ${
                tab === t ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'compose' && (
          <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">New Message</h2>
            {sendSuccess && (
              <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
                Message sent successfully!
              </div>
            )}
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-400">To</label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-400">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-400">Message</label>
                <textarea
                  rows={6}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </form>
          </div>
        )}

        {(tab === 'inbox' || tab === 'sent') && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              {loading ? (
                <LoadingSpinner label="Loading messages…" />
              ) : messages.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center text-gray-400">
                  No messages
                </div>
              ) : (
                messages.map((msg) => (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => handleSelect(msg)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                      selected?.id === msg.id
                        ? 'border-green-500/40 bg-green-500/10'
                        : 'border-white/10 bg-zinc-900 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-semibold ${msg.read ? 'text-gray-300' : 'text-white'}`}>
                        {tab === 'inbox' ? msg.senderName || msg.senderEmail : msg.recipientEmail}
                      </span>
                      {!msg.read && tab === 'inbox' && (
                        <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400 truncate">{msg.subject}</p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>

            {selected && (
              <div className="rounded-xl border border-white/10 bg-zinc-900 p-5 space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <h2 className="text-base font-bold text-white">{selected.subject}</h2>
                  <p className="mt-1 text-xs text-gray-400">
                    From: {selected.senderName || selected.senderEmail} ·{' '}
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{selected.body}</p>
                {tab === 'inbox' && (
                  <button
                    type="button"
                    onClick={() => handleReply(selected)}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    ↩ Reply
                  </button>
                )}
              </div>
            )}
          </div>
        )}
    </div>
  )
}

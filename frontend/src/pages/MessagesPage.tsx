import { useEffect, useState } from 'react'

import api from '../services/api'
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
  readStatus?: boolean
  createdAt: string
  parentId?: number
}

export default function MessagesPage() {
  const supportEmail = 'kanteelitetraining@gmail.com'
  const [tab, setTab] = useState<Tab>('inbox')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Message | null>(null)
  const [thread, setThread] = useState<Message[]>([])
  const [threadLoading, setThreadLoading] = useState(false)

  // Compose state
  const [recipientEmail, setRecipientEmail] = useState(supportEmail)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [parentId, setParentId] = useState<number | undefined>()
  const [sending, setSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  const fetchMessages = async (t: Tab) => {
    if (t === 'compose') return
    setLoading(true)
    setError('')
    try {
      const endpoint = t === 'inbox' ? '/messages/inbox' : '/messages/sent'
      const res = await api.get(endpoint)
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
    setThread([])
  }, [tab])

  // Handles both `read` (older local field) and `readStatus` (API field name)
  const isUnread = (msg: Message) => !(msg.read || msg.readStatus)

  const handleSelect = async (msg: Message) => {
    setSelected(msg)
    setThread([])

    // Mark as read if this is an unread inbox message
    if (isUnread(msg) && tab === 'inbox') {
      try {
        await api.patch(`/messages/${msg.id}/read`, {})
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true, readStatus: true } : m)))
      } catch {
        // silent
      }
    }

    // Load thread replies for this root message
    const rootId = msg.parentId ?? msg.id
    setThreadLoading(true)
    try {
      const res = await api.get(`/messages/thread/${rootId}`)
      setThread(res.data ?? [])
    } catch {
      // thread load failure is non-critical
    } finally {
      setThreadLoading(false)
    }
  }

  const handleReply = (msg: Message) => {
    setRecipientEmail(msg.senderEmail)
    setSubject(msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`)
    setParentId(msg.parentId ?? msg.id)
    setBody('')
    setSendSuccess(false)
    setTab('compose')
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSendSuccess(false)
    setError('')
    try {
      await api.post('/messages', { recipientEmail, subject, body, parentId })
      setSendSuccess(true)
      setRecipientEmail(supportEmail)
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

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="flex gap-1 rounded-xl border border-[#222] bg-[#111] p-1">
        {(['inbox', 'sent', 'compose'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-colors ${
              tab === t ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'compose' && (
        <div className="rounded-xl border border-[#222] bg-[#111] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">
            {parentId ? 'Reply' : 'New Message'}
          </h2>
          {sendSuccess && (
            <div className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-400">
              Message sent.
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
                placeholder={supportEmail}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Message</label>
              <textarea
                rows={6}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="flex gap-3">
              {parentId ? (
                <button
                  type="button"
                  onClick={() => { setParentId(undefined); setTab('inbox') }}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </button>
              ) : null}
              <button
                type="submit"
                disabled={sending}
                className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}

      {(tab === 'inbox' || tab === 'sent') && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            {loading ? (
              <LoadingSpinner label="Loading messages..." />
            ) : messages.length === 0 ? (
              <div className="rounded-xl border border-[#222] bg-[#111] p-8 text-center text-gray-400 text-sm">
                No messages yet
              </div>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => handleSelect(msg)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                    selected?.id === msg.id
                      ? 'border-amber-500/40 bg-amber-500/10'
                      : 'border-white/10 bg-[#111] hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-semibold ${isUnread(msg) && tab === 'inbox' ? 'text-white' : 'text-gray-300'}`}>
                      {tab === 'inbox' ? (msg.senderName || msg.senderEmail) : msg.recipientEmail}
                    </span>
                    {isUnread(msg) && tab === 'inbox' && (
                      <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
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
            <div className="rounded-xl border border-[#222] bg-[#111] p-5 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-white">{selected.subject}</h2>
                <p className="mt-1 text-xs text-gray-400">
                  From: {selected.senderName || selected.senderEmail} &middot;{' '}
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{selected.body}</p>

              {threadLoading ? (
                <div className="text-xs text-gray-500">Loading replies...</div>
              ) : thread.length > 0 ? (
                <div className="space-y-3 border-t border-white/10 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    {thread.length} {thread.length === 1 ? 'reply' : 'replies'}
                  </p>
                  {thread.map((reply) => (
                    <div key={reply.id} className="rounded-lg border border-white/10 bg-black p-3">
                      <p className="text-xs text-gray-500 mb-1">
                        {reply.senderName || reply.senderEmail} &middot; {new Date(reply.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{reply.body}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {tab === 'inbox' && (
                <button
                  type="button"
                  onClick={() => handleReply(selected)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Reply
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

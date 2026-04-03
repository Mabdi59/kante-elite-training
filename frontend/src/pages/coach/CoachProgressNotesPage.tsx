import { useEffect, useState } from 'react'
import axios from 'axios'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

const NOTE_TYPES = ['GENERAL', 'TECHNICAL', 'TACTICAL', 'PHYSICAL', 'MENTAL', 'MILESTONE']

const TYPE_COLORS: Record<string, string> = {
  GENERAL: 'bg-gray-700/40 text-gray-300',
  TECHNICAL: 'bg-blue-500/20 text-blue-400',
  TACTICAL: 'bg-purple-500/20 text-purple-400',
  PHYSICAL: 'bg-orange-500/20 text-orange-400',
  MENTAL: 'bg-pink-500/20 text-pink-400',
  MILESTONE: 'bg-green-500/20 text-green-400',
}

interface ProgressNote {
  id: number
  playerEmail: string
  playerName: string
  coachName: string
  sessionDate: string
  noteType: string
  title: string
  content: string
  rating: number | null
  visibleToParent: boolean
  bookingId: number | null
  createdAt: string
}

interface NoteForm {
  playerEmail: string
  playerName: string
  sessionDate: string
  noteType: string
  title: string
  content: string
  rating: number | ''
  visibleToParent: boolean
  bookingId: string
}

const EMPTY_FORM: NoteForm = {
  playerEmail: '',
  playerName: '',
  sessionDate: new Date().toISOString().split('T')[0],
  noteType: 'GENERAL',
  title: '',
  content: '',
  rating: '',
  visibleToParent: true,
  bookingId: '',
}

export default function CoachProgressNotesPage() {
  const [notes, setNotes] = useState<ProgressNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<NoteForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const loadNotes = () => {
    setLoading(true)
    axios
      .get<ProgressNote[]>('/api/coach/progress-notes', { headers })
      .then((res) => setNotes(res.data))
      .catch(() => setError('Failed to load progress notes.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadNotes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.content.trim()) return
    setSubmitting(true)
    const payload = {
      ...form,
      rating: form.rating === '' ? null : Number(form.rating),
      bookingId: form.bookingId ? Number(form.bookingId) : null,
    }
    try {
      if (editingId) {
        await axios.put(`/api/coach/progress-notes/${editingId}`, payload, { headers })
        setSuccess('Note updated.')
      } else {
        await axios.post('/api/coach/progress-notes', payload, { headers })
        setSuccess('Note saved.')
      }
      setForm(EMPTY_FORM)
      setEditingId(null)
      setShowForm(false)
      loadNotes()
    } catch {
      setError('Failed to save note.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (note: ProgressNote) => {
    setForm({
      playerEmail: note.playerEmail,
      playerName: note.playerName,
      sessionDate: note.sessionDate,
      noteType: note.noteType,
      title: note.title || '',
      content: note.content,
      rating: note.rating ?? '',
      visibleToParent: note.visibleToParent,
      bookingId: note.bookingId ? String(note.bookingId) : '',
    })
    setEditingId(note.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this note?')) return
    try {
      await axios.delete(`/api/coach/progress-notes/${id}`, { headers })
      setNotes((prev) => prev.filter((n) => n.id !== id))
    } catch {
      setError('Failed to delete note.')
    }
  }

  const stars = (rating: number | null) => {
    if (!rating) return null
    return (
      <span className="text-yellow-400 text-sm">
        {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
      </span>
    )
  }

  if (loading) return <LoadingSpinner label="Loading…" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Progress Notes</h1>
          <p className="text-gray-400 mt-1 text-sm">Write development notes for your players after sessions.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM) }}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + New Note
        </button>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-green-400 text-sm">
          {success}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-bold text-lg">{editingId ? 'Edit Note' : 'New Progress Note'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Player Email *</label>
              <input
                type="email"
                required
                value={form.playerEmail}
                onChange={(e) => setForm({ ...form, playerEmail: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Player Name</label>
              <input
                type="text"
                value={form.playerName}
                onChange={(e) => setForm({ ...form, playerName: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Session Date *</label>
              <input
                type="date"
                required
                value={form.sessionDate}
                onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Note Type</label>
              <select
                value={form.noteType}
                onChange={(e) => setForm({ ...form, noteType: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {NOTE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Brief summary"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Rating (1–5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value as number | '' })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Content *</label>
            <textarea
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Detailed development note…"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="visibleToParent"
              checked={form.visibleToParent}
              onChange={(e) => setForm({ ...form, visibleToParent: e.target.checked })}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="visibleToParent" className="text-gray-300 text-sm">Visible to parent/player</label>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm"
            >
              {submitting ? 'Saving…' : editingId ? 'Update Note' : 'Save Note'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }}
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 && !showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-white font-semibold mb-1">No notes yet</p>
          <p className="text-gray-400 text-sm">Write your first player development note.</p>
        </div>
      )}

      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[note.noteType] ?? TYPE_COLORS.GENERAL}`}>
                  {note.noteType}
                </span>
                <span className="text-gray-400 text-xs">{note.sessionDate}</span>
                {note.rating && stars(note.rating)}
                {!note.visibleToParent && (
                  <span className="text-gray-500 text-xs italic">🔒 private</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(note)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mb-1">
              <span className="text-gray-400 text-xs">Player: </span>
              <span className="text-white text-sm font-medium">{note.playerName || note.playerEmail}</span>
            </div>
            {note.title && (
              <p className="text-white font-semibold text-sm mb-1">{note.title}</p>
            )}
            <p className="text-gray-300 text-sm leading-relaxed">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

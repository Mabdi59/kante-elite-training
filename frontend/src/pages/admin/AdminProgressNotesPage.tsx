import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  getCoachProgressNotes,
  createProgressNote,
  updateProgressNote,
  deleteProgressNote,
} from '../../services/api'
import type { PlayerProgressNote, PlayerProgressNoteFormData } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'

const today = new Date().toISOString().slice(0, 10)

const emptyForm: PlayerProgressNoteFormData = {
  playerEmail: '',
  playerName: '',
  sessionDate: today,
  noteType: '',
  title: '',
  content: '',
  rating: undefined,
  visibleToParent: true,
}

const NOTE_TYPES = ['General', 'Technical', 'Tactical', 'Physical', 'Mental', 'Nutrition', 'Goal']

export default function AdminProgressNotesPage() {
  const [notes, setNotes] = useState<PlayerProgressNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<PlayerProgressNoteFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [filterEmail, setFilterEmail] = useState('')

  useEffect(() => {
    document.title = 'Progress Notes | Kante Elite Training'
    return () => {
      document.title = 'Kante Elite Training'
    }
  }, [])

  useEffect(() => {
    getCoachProgressNotes()
      .then(setNotes)
      .catch(() => setError('Could not load progress notes. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const visibleNotes = useMemo(() => {
    const q = filterEmail.trim().toLowerCase()
    const filtered = q
      ? notes.filter(
          (n) =>
            n.playerEmail.toLowerCase().includes(q) ||
            (n.playerName ?? '').toLowerCase().includes(q),
        )
      : notes
    return [...filtered].sort(
      (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
    )
  }, [notes, filterEmail])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSaveError('')
    setShowForm(true)
  }

  const openEdit = (n: PlayerProgressNote) => {
    setEditingId(n.id)
    setForm({
      playerEmail: n.playerEmail,
      playerName: n.playerName ?? '',
      sessionDate: n.sessionDate.slice(0, 10),
      noteType: n.noteType ?? '',
      title: n.title ?? '',
      content: n.content,
      rating: n.rating,
      visibleToParent: n.visibleToParent,
    })
    setSaveError('')
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setSaveError('')
  }

  const handleSave = async (ev: FormEvent) => {
    ev.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      const payload: PlayerProgressNoteFormData = {
        ...form,
        playerName: form.playerName?.trim() || undefined,
        noteType: form.noteType?.trim() || undefined,
        title: form.title?.trim() || undefined,
      }
      if (editingId) {
        const updated = await updateProgressNote(editingId, payload)
        setNotes((prev) => prev.map((n) => (n.id === editingId ? updated : n)))
      } else {
        const created = await createProgressNote(payload)
        setNotes((prev) => [created, ...prev])
      }
      cancelForm()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save note.'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (n: PlayerProgressNote) => {
    const label = n.title
      ? `"${n.title}"`
      : `note for ${n.playerName ?? n.playerEmail} on ${n.sessionDate.slice(0, 10)}`
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return
    try {
      await deleteProgressNote(n.id)
      setNotes((prev) => prev.filter((item) => item.id !== n.id))
      if (editingId === n.id) cancelForm()
    } catch {
      setError('Could not delete note.')
    }
  }

  if (loading) return <LoadingSpinner label="Loading progress notes..." />

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Progress Notes</h1>
          <p className="text-gray-400 text-sm mt-1">
            Create and manage coach feedback notes for players after sessions.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openCreate}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg text-sm"
          >
            + New Note
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {/* Create / Edit form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className={`bg-gray-900 border rounded-xl p-6 mb-6 space-y-4 ${
            editingId ? 'border-blue-500/30' : 'border-green-500/30'
          }`}
        >
          <h2 className="text-white font-bold text-xl">
            {editingId ? 'Edit Progress Note' : 'New Progress Note'}
          </h2>

          {saveError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Player Email <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="email"
                value={form.playerEmail}
                onChange={(e) => setForm((f) => ({ ...f, playerEmail: e.target.value }))}
                placeholder="player@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Player Name</label>
              <input
                type="text"
                value={form.playerName ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, playerName: e.target.value }))}
                placeholder="e.g. Alex Smith"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Session Date <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="date"
                value={form.sessionDate}
                onChange={(e) => setForm((f) => ({ ...f, sessionDate: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Note Type</label>
              <select
                value={form.noteType ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, noteType: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">— Select type —</option>
                {NOTE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Title</label>
              <input
                type="text"
                value={form.title ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Excellent positioning work"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">
                Note <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Describe the player's performance, areas of improvement, key observations…"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-y leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Rating{' '}
                <span className="text-gray-600 font-normal">(1–5, optional)</span>
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.rating ?? ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? undefined : Number(e.target.value)
                  setForm((f) => ({ ...f, rating: v }))
                }}
                placeholder="1–5"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div className="flex items-center gap-3 mt-4 md:mt-0 self-end pb-0.5">
              <input
                id="pn-visible"
                type="checkbox"
                checked={form.visibleToParent ?? true}
                onChange={(e) => setForm((f) => ({ ...f, visibleToParent: e.target.checked }))}
                className="w-4 h-4 accent-green-500"
              />
              <label htmlFor="pn-visible" className="text-sm text-gray-300 cursor-pointer">
                Visible to parent / guardian
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Note'}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter */}
      {notes.length > 0 && (
        <div className="mb-4">
          <input
            type="text"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            placeholder="Filter by player email or name…"
            className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600"
          />
        </div>
      )}

      {/* Notes list */}
      {visibleNotes.length === 0 ? (
        <EmptyState
          icon="FileText"
          title={filterEmail ? 'No notes match that filter' : 'No progress notes yet'}
          description={
            filterEmail
              ? 'Try a different player email or name.'
              : 'Create your first progress note after a session to give players personalised feedback.'
          }
        />
      ) : (
        <div className="space-y-3">
          {visibleNotes.map((n) => (
            <div key={n.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {n.title && (
                      <h3 className="text-white font-bold">{n.title}</h3>
                    )}
                    {n.noteType && (
                      <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 capitalize">
                        {n.noteType.toLowerCase()}
                      </span>
                    )}
                    {!n.visibleToParent && (
                      <span className="text-xs bg-gray-500/10 text-gray-500 px-2 py-0.5 rounded-full border border-gray-700">
                        Coach only
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm font-medium">
                    {n.playerName ?? n.playerEmail}
                    {n.playerName && (
                      <span className="text-gray-600 font-normal"> · {n.playerEmail}</span>
                    )}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(n.sessionDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-gray-300 text-sm mt-2 leading-relaxed line-clamp-3">
                    {n.content}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {n.rating != null && (
                    <div
                      className="flex items-center gap-0.5"
                      aria-label={`Rating: ${n.rating} out of 5`}
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg
                          key={i}
                          className={`h-3.5 w-3.5 ${i < n.rating! ? 'text-amber-400' : 'text-gray-700'}`}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
                        </svg>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(n)}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(n)}
                      className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

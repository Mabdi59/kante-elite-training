import { useEffect, useState } from 'react'
import {
  getAdminCoaches,
  getAdminUsers,
  createCoachProfile,
  updateCoachProfile,
  deleteCoachProfile,
} from '../../services/api'
import type { CoachProfile, AdminUser, CoachProfileFormData } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'

const emptyForm: CoachProfileFormData = { bio: '', specialties: '', certifications: '', active: true }

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<CoachProfile[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
  const [form, setForm] = useState<CoachProfileFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    Promise.all([getAdminCoaches(), getAdminUsers()])
      .then(([c, u]) => {
        setCoaches(c)
        setUsers(u)
      })
      .catch(() => setError('Could not load coaches. Please refresh.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const eligibleUsers = users.filter((u) => !coaches.some((c) => c.userId === u.id))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) return
    setSaving(true)
    setError('')
    try {
      await createCoachProfile(Number(selectedUserId), form)
      setShowAdd(false)
      setSelectedUserId('')
      setForm(emptyForm)
      load()
    } catch {
      setError('Could not create coach profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId) return
    setSaving(true)
    setError('')
    try {
      await updateCoachProfile(editId, form)
      setEditId(null)
      setForm(emptyForm)
      load()
    } catch {
      setError('Could not save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Remove this coach profile?')) return
    try {
      await deleteCoachProfile(id)
      load()
    } catch {
      setError('Could not remove coach profile.')
    }
  }

  const startEdit = (c: CoachProfile) => {
    setEditId(c.id)
    setForm({ bio: c.bio ?? '', specialties: c.specialties ?? '', certifications: c.certifications ?? '', active: c.active })
  }

  if (loading) return <LoadingSpinner label="Loading coaches…" />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-3xl font-black">Coaches</h1>
        <button
          onClick={() => { setShowAdd(true); setEditId(null) }}
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Add Coach
        </button>
      </div>

      {error && <div className="mb-6"><ErrorBanner message={error} onDismiss={() => setError('')} /></div>}

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-gray-900 border border-green-500/30 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-white font-bold text-lg">Add Coach Profile</h2>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Select User</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              required
            >
              <option value="">Choose a user…</option>
              {eligibleUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Bio</label>
              <textarea value={form.bio ?? ''}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Specialties</label>
              <input type="text" value={form.specialties ?? ''}
                onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Certifications</label>
              <input type="text" value={form.certifications ?? ''}
                onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
              {saving ? 'Adding…' : 'Add Coach'}
            </button>
            <button type="button" onClick={() => { setShowAdd(false); setError('') }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {editId && (
        <form onSubmit={handleUpdate} className="bg-gray-900 border border-blue-500/30 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-white font-bold text-lg">Edit Coach Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Bio</label>
              <textarea value={form.bio ?? ''}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Specialties</label>
              <input type="text" value={form.specialties ?? ''}
                onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Certifications</label>
              <input type="text" value={form.certifications ?? ''}
                onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={form.active ?? true}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 accent-green-500" />
              Active
            </label>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => { setEditId(null); setError('') }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {coaches.length === 0 ? (
        <EmptyState
          icon="🎽"
          title="No coaches yet"
          description="Add a coach profile to assign sessions."
          action={
            <button onClick={() => setShowAdd(true)} className="bg-green-500 text-black font-bold px-5 py-2 rounded-lg text-sm">
              + Add Coach
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {coaches.map((c) => (
            <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <p className="text-white font-semibold">{c.userName}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${c.active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{c.userEmail}</p>
                {c.specialties && <p className="text-gray-500 text-sm mt-1">{c.specialties}</p>}
                {c.certifications && <p className="text-gray-500 text-sm">{c.certifications}</p>}
                {c.bio && <p className="text-gray-600 text-sm mt-2 italic line-clamp-2">{c.bio}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(c)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(c.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs transition-colors">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

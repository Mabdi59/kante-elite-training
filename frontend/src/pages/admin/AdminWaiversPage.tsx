import { useEffect, useState } from 'react'
import axios from 'axios'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

interface WaiverTemplate {
  id: number
  title: string
  content: string
  requiredRoles: string[]
  active: boolean
  createdAt: string
}

interface FormData {
  title: string
  content: string
  requiredRoles: string
  active: boolean
}

const EMPTY_FORM: FormData = { title: '', content: '', requiredRoles: '', active: true }

export default function AdminWaiversPage() {
  const [templates, setTemplates] = useState<WaiverTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const token = localStorage.getItem('token')

  const fetchTemplates = () => {
    axios
      .get('/api/admin/waivers/templates', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setTemplates(r.data ?? []))
      .catch(() => setError('Failed to load waiver templates.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTemplates() }, [token])

  const openNew = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (t: WaiverTemplate) => {
    setForm({
      title: t.title,
      content: t.content,
      requiredRoles: (t.requiredRoles ?? []).join(', '),
      active: t.active,
    })
    setEditingId(t.id)
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      title: form.title,
      content: form.content,
      requiredRoles: form.requiredRoles.split(',').map((r) => r.trim()).filter(Boolean),
      active: form.active,
    }
    try {
      if (editingId) {
        await axios.put(`/api/admin/waivers/templates/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await axios.post('/api/admin/waivers/templates', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }
      setShowForm(false)
      setLoading(true)
      fetchTemplates()
    } catch {
      setError('Failed to save waiver template.')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (t: WaiverTemplate) => {
    try {
      await axios.put(`/api/admin/waivers/templates/${t.id}`, { ...t, active: !t.active }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTemplates((prev) => prev.map((tmpl) => tmpl.id === t.id ? { ...tmpl, active: !tmpl.active } : tmpl))
    } catch {
      setError('Failed to toggle waiver status.')
    }
  }

  if (loading) return <LoadingSpinner label="Loading waiver templates…" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Waiver Templates</h1>
          <p className="mt-1 text-sm text-gray-400">Create and manage waiver templates.</p>
        </div>
        <button type="button" onClick={openNew}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500">
          + New Waiver
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {showForm && (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <h2 className="mb-4 text-base font-bold text-white">
            {editingId ? 'Edit Waiver' : 'New Waiver'}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Content *</label>
              <textarea required rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Required Roles (comma-separated)</label>
              <input value={form.requiredRoles} onChange={(e) => setForm({ ...form, requiredRoles: e.target.value })}
                placeholder="PLAYER, PARENT"
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="accent-green-500" />
              <label htmlFor="active" className="text-sm text-gray-300">Active</label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center text-gray-400">
          No waiver templates yet.
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-zinc-900 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white">{t.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    t.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {t.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}
                  {t.requiredRoles?.length > 0 && ` · Roles: ${t.requiredRoles.join(', ')}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => openEdit(t)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10">
                  Edit
                </button>
                <button type="button" onClick={() => toggleActive(t)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    t.active
                      ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  }`}>
                  {t.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

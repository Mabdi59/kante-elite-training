import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

interface WaiverTemplate {
  id: number
  title: string
  content: string
  requiredRoles: string
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
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchTemplates = () => {
    api
      .get('/admin/waivers/templates')
      .then((response) => setTemplates(response.data ?? []))
      .catch(() => setError('Failed to load waiver templates.'))
      .finally(() => setLoading(false))
  }


  useEffect(() => {
    document.title = 'Waivers | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [])

  const openNew = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (template: WaiverTemplate) => {
    setForm({
      title: template.title,
      content: template.content,
      requiredRoles: template.requiredRoles ?? '',
      active: template.active,
    })
    setEditingId(template.id)
    setShowForm(true)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      title: form.title,
      content: form.content,
      requiredRoles: form.requiredRoles,
      active: form.active,
    }

    try {
      if (editingId) {
        await api.put(`/admin/waivers/templates/${editingId}`, payload)
      } else {
        await api.post('/admin/waivers/templates', payload)
      }
      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      setLoading(true)
      fetchTemplates()
    } catch {
      setError('Failed to save waiver template.')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (template: WaiverTemplate) => {
    try {
      await api.put(
        `/admin/waivers/templates/${template.id}`,
        {
          title: template.title,
          content: template.content,
          requiredRoles: template.requiredRoles,
          active: !template.active,
        },
      )
      setTemplates((prev) =>
        prev.map((item) => (item.id === template.id ? { ...item, active: !template.active } : item)),
      )
    } catch {
      setError('Failed to toggle waiver status.')
    }
  }

  const handleDelete = async (template: WaiverTemplate) => {
    if (!window.confirm(`Delete "${template.title}"? This will also remove signed records tied to it.`)) {
      return
    }

    setDeletingId(template.id)
    setError('')
    try {
      await api.delete(`/admin/waivers/templates/${template.id}`)
      setTemplates((prev) => prev.filter((item) => item.id !== template.id))
      if (editingId === template.id) {
        setShowForm(false)
        setEditingId(null)
        setForm(EMPTY_FORM)
      }
    } catch {
      setError('Failed to delete waiver template.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading waiver templates..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Waiver Templates</h1>
          <p className="mt-1 text-sm text-gray-400">Create, update, activate, and delete waiver templates.</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
        >
          + New Waiver
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {showForm && (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <h2 className="mb-4 text-base font-bold text-white">{editingId ? 'Edit Waiver' : 'New Waiver'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Title *</label>
              <input
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="w-full input-field-default"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Content *</label>
              <textarea
                required
                rows={6}
                value={form.content}
                onChange={(event) => setForm({ ...form, content: event.target.value })}
                className="w-full input-field-default"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Required Roles (comma-separated)</label>
              <input
                value={form.requiredRoles}
                onChange={(event) => setForm({ ...form, requiredRoles: event.target.value })}
                placeholder="PLAYER, PARENT"
                className="w-full input-field-default"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(event) => setForm({ ...form, active: event.target.checked })}
                className="accent-green-500"
              />
              <label htmlFor="active" className="text-sm text-gray-300">
                Active
              </label>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setForm(EMPTY_FORM)
                }}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white"
              >
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
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-zinc-900 p-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white">{template.title}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      template.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {template.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : ''}
                  {template.requiredRoles?.trim() ? ` - Roles: ${template.requiredRoles}` : ''}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => openEdit(template)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive(template)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    template.active
                      ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  }`}
                >
                  {template.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(template)}
                  disabled={deletingId === template.id}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                >
                  {deletingId === template.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}



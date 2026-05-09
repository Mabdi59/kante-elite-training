import { useEffect, useState, type FormEvent } from 'react'
import {
  getAllWaiverTemplates,
  createWaiverTemplate,
  updateWaiverTemplate,
  deleteWaiverTemplate,
} from '../../services/api'
import type { WaiverTemplate, WaiverTemplateFormData } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'

const emptyForm: WaiverTemplateFormData = {
  title: '',
  content: '',
  requiredRoles: '',
  active: true,
}

export default function AdminWaiversPage() {
  const [templates, setTemplates] = useState<WaiverTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<WaiverTemplateFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    document.title = 'Waivers | Kante Elite Training'
    return () => {
      document.title = 'Kante Elite Training'
    }
  }, [])

  useEffect(() => {
    getAllWaiverTemplates()
      .then(setTemplates)
      .catch(() => setError('Could not load waiver templates. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSaveError('')
    setShowForm(true)
  }

  const openEdit = (t: WaiverTemplate) => {
    setEditingId(t.id)
    setForm({
      title: t.title,
      content: t.content,
      requiredRoles: t.requiredRoles ?? '',
      active: t.active,
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
      const payload: WaiverTemplateFormData = {
        ...form,
        requiredRoles: form.requiredRoles?.trim() || undefined,
      }
      if (editingId) {
        const updated = await updateWaiverTemplate(editingId, payload)
        setTemplates((prev) => prev.map((t) => (t.id === editingId ? updated : t)))
      } else {
        const created = await createWaiverTemplate(payload)
        setTemplates((prev) => [created, ...prev])
      }
      cancelForm()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save waiver template.'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (t: WaiverTemplate) => {
    try {
      const updated = await updateWaiverTemplate(t.id, {
        title: t.title,
        content: t.content,
        requiredRoles: t.requiredRoles,
        active: !t.active,
      })
      setTemplates((prev) => prev.map((item) => (item.id === t.id ? updated : item)))
    } catch {
      setError('Could not update waiver status.')
    }
  }

  const handleDelete = async (t: WaiverTemplate) => {
    if (!window.confirm(`Delete "${t.title}"? This cannot be undone.`)) return
    try {
      await deleteWaiverTemplate(t.id)
      setTemplates((prev) => prev.filter((item) => item.id !== t.id))
      if (editingId === t.id) cancelForm()
    } catch {
      setError('Could not delete waiver template.')
    }
  }

  if (loading) return <LoadingSpinner label="Loading waiver templates..." />

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Waiver Templates</h1>
          <p className="text-gray-400 text-sm mt-1">
            Create and manage the digital waivers users must sign before participating.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openCreate}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg text-sm"
          >
            + New Waiver
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSave}
          className={`bg-gray-900 border rounded-xl p-6 mb-6 space-y-4 ${
            editingId ? 'border-blue-500/30' : 'border-green-500/30'
          }`}
        >
          <h2 className="text-white font-bold text-xl">
            {editingId ? 'Edit Waiver Template' : 'Create Waiver Template'}
          </h2>

          {saveError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Liability Waiver & Assumption of Risk"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">
                Waiver Text <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={10}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Enter the full text of the waiver..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-y font-mono leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Required Roles{' '}
                <span className="text-gray-600 font-normal">(optional — comma-separated)</span>
              </label>
              <input
                type="text"
                value={form.requiredRoles ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, requiredRoles: e.target.value }))}
                placeholder="e.g. PARENT, PLAYER — leave blank for all users"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div className="flex items-center gap-3 mt-4 md:mt-0 self-end pb-0.5">
              <input
                id="waiver-active"
                type="checkbox"
                checked={form.active ?? true}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="w-4 h-4 accent-green-500"
              />
              <label htmlFor="waiver-active" className="text-sm text-gray-300 cursor-pointer">
                Active (visible to users)
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Waiver'}
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

      {templates.length === 0 ? (
        <EmptyState
          icon="FileText"
          title="No waiver templates yet"
          description="Create your first waiver template. Users will see active templates in their account and must sign them before participating."
        />
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`bg-gray-900 border rounded-xl p-5 ${
                t.active ? 'border-gray-800' : 'border-gray-800/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-white font-bold">{t.title}</h3>
                    {t.active ? (
                      <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-500/15 text-gray-400 px-2 py-0.5 rounded-full border border-gray-500/20">
                        Inactive
                      </span>
                    )}
                    {t.requiredRoles && (
                      <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                        {t.requiredRoles}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs">
                    Created {new Date(t.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <details className="mt-2">
                    <summary className="text-gray-500 text-xs cursor-pointer hover:text-gray-300 select-none">
                      Preview text
                    </summary>
                    <div className="mt-2 bg-gray-800 rounded-lg p-3 text-gray-400 text-xs whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto font-mono">
                      {t.content}
                    </div>
                  </details>
                </div>

                <div className="flex gap-2 shrink-0 items-start flex-wrap justify-end">
                  <button
                    onClick={() => handleToggleActive(t)}
                    className="text-xs text-amber-500 hover:text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {t.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEdit(t)}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t)}
                    className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg"
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

import { useEffect, useState } from 'react'
import { getAdminPrograms, createProgram, updateProgram, deleteProgram } from '../../services/api'
import type { Program } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'

const emptyForm: Partial<Program> = {
  name: '', slug: '', description: '', shortDescription: '',
  price: 0, priceLabel: '', durationMinutes: 60,
  features: [], icon: '⚽', whoItsFor: '', displayOrder: 0,
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [form, setForm] = useState<Partial<Program>>(emptyForm)
  const [featuresText, setFeaturesText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = () => {
    setLoading(true)
    getAdminPrograms()
      .then(setPrograms)
      .catch(() => setError('Failed to load programs.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditingProgram(null)
    setForm(emptyForm)
    setFeaturesText('')
    setSaveError('')
    setShowForm(true)
  }

  const openEdit = (p: Program) => {
    setEditingProgram(p)
    setForm({ ...p })
    setFeaturesText((p.features ?? []).join('\n'))
    setSaveError('')
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingProgram(null)
    setSaveError('')
  }

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSaving(true)
    setSaveError('')
    const payload = {
      ...form,
      features: featuresText.split('\n').map((l) => l.trim()).filter(Boolean),
    }
    try {
      if (editingProgram) {
        const updated = await updateProgram(editingProgram.id, payload)
        setPrograms((prev) => prev.map((p) => (p.id === editingProgram.id ? updated : p)))
      } else {
        const created = await createProgram(payload)
        setPrograms((prev) => [...prev, created])
      }
      cancelForm()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Save failed.'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this program? This cannot be undone.')) return
    try {
      await deleteProgram(id)
      setPrograms((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setError('Failed to delete program.')
    }
  }

  const set = (field: keyof Program, val: unknown) =>
    setForm((prev) => ({ ...prev, [field]: val }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-3xl font-black">Programs</h1>
        <button
          onClick={openCreate}
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg text-sm"
        >
          + New Program
        </button>
      </div>

      {error && <div className="mb-6"><ErrorBanner message={error} onDismiss={() => setError('')} /></div>}

      {showForm && (
        <form
          onSubmit={handleSave}
          className={`bg-gray-900 border rounded-xl p-6 mb-6 space-y-5 ${editingProgram ? 'border-blue-500/40' : 'border-green-500/30'}`}
        >
          <h2 className="text-white font-bold text-xl">
            {editingProgram ? 'Edit Program' : 'Create New Program'}
          </h2>

          {saveError && <ErrorBanner message={saveError} onDismiss={() => setSaveError('')} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Name *</label>
              <input required value={form.name ?? ''} onChange={(e) => set('name', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="e.g. Elite Private Training" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Slug *</label>
              <input required value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="e.g. elite-private" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Icon (emoji)</label>
              <input value={form.icon ?? '⚽'} onChange={(e) => set('icon', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Price ($)</label>
              <input type="number" min={0} value={form.price ?? 0}
                onChange={(e) => set('price', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Price Label</label>
              <input value={form.priceLabel ?? ''} onChange={(e) => set('priceLabel', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="e.g. per session" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Duration (minutes)</label>
              <input type="number" min={15} value={form.durationMinutes ?? 60}
                onChange={(e) => set('durationMinutes', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Display Order</label>
              <input type="number" min={0} value={form.displayOrder ?? 0}
                onChange={(e) => set('displayOrder', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Who It's For</label>
              <input value={form.whoItsFor ?? ''} onChange={(e) => set('whoItsFor', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="e.g. Ages 8-18, all skill levels" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Short Description</label>
              <input value={form.shortDescription ?? ''} onChange={(e) => set('shortDescription', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="One-line summary" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Full Description</label>
              <textarea rows={4} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Features (one per line)</label>
              <textarea rows={4} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none font-mono"
                placeholder="Personalized training plan&#10;Video analysis&#10;Progress reports" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50">
              {saving ? 'Saving…' : editingProgram ? 'Save Changes' : 'Create Program'}
            </button>
            <button type="button" onClick={cancelForm}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner label="Loading programs…" />
      ) : programs.length === 0 ? (
        <EmptyState
          icon="⚽"
          title="No programs yet"
          description="Create your first training program to start accepting bookings."
          action={
            <button onClick={openCreate} className="bg-green-500 text-black font-bold px-5 py-2 rounded-lg text-sm">
              + New Program
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {programs.map((p) => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{p.icon}</span>
                  <h3 className="text-white font-bold">{p.name}</h3>
                  <span className="text-green-400 text-sm font-semibold">${p.price}</span>
                  <span className="text-gray-500 text-xs">{p.durationMinutes}min</span>
                </div>
                <p className="text-gray-400 text-sm">{p.shortDescription}</p>
                <p className="text-gray-600 text-xs mt-1">/{p.slug} · order: {p.displayOrder}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(p)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs">
                  Edit
                </button>
                <button onClick={() => handleDelete(p.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

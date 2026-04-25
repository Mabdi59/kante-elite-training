import { useEffect, useState } from 'react'
import {
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../../services/api'
import type { Testimonial } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'

const emptyForm: Partial<Testimonial> = {
  name: '', roleOrContext: '', quote: '', rating: 5, featured: false, displayOrder: 0,
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Testimonial>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')


  useEffect(() => {
    document.title = 'Testimonials | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    getAdminTestimonials()
      .then(setTestimonials)
      .catch(() => setError('Could not load testimonials. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSaveError('')
    setShowForm(true)
  }

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id)
    setForm({ ...t })
    setSaveError('')
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setSaveError('')
  }

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      if (editingId) {
        const updated = await updateTestimonial(editingId, form)
        setTestimonials((prev) => prev.map((t) => (t.id === editingId ? updated : t)))
      } else {
        const created = await createTestimonial(form)
        setTestimonials((prev) => [created, ...prev])
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
    if (!window.confirm('Remove this testimonial?')) return
    try {
      await deleteTestimonial(id)
      setTestimonials((prev) => prev.filter((t) => t.id !== id))
    } catch {
      setError('Could not remove that testimonial.')
    }
  }

  const set = (field: keyof Testimonial, val: unknown) =>
    setForm((prev) => ({ ...prev, [field]: val }))

  if (loading) return <LoadingSpinner label="Loading testimonials…" />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-3xl font-black">Testimonials</h1>
        <button
          onClick={openCreate}
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg text-sm"
        >
          + Add Testimonial
        </button>
      </div>

      {error && <div className="mb-6"><ErrorBanner message={error} onDismiss={() => setError('')} /></div>}

      {showForm && (
        <form
          onSubmit={handleSave}
          className={`bg-gray-900 border rounded-xl p-6 mb-6 space-y-4 ${editingId ? 'border-blue-500/40' : 'border-green-500/30'}`}
        >
          <h2 className="text-white font-bold text-xl">
            {editingId ? 'Edit Testimonial' : 'Add Testimonial'}
          </h2>

          {saveError && <ErrorBanner message={saveError} onDismiss={() => setSaveError('')} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Name *</label>
              <input required value={form.name ?? ''} onChange={(e) => set('name', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="e.g. Sarah M." />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Role / Context</label>
              <input value={form.roleOrContext ?? ''} onChange={(e) => set('roleOrContext', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="e.g. Parent of U14 player" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Rating (1-5)</label>
              <input type="number" min={1} max={5} value={form.rating ?? 5}
                onChange={(e) => set('rating', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Display Order</label>
              <input type="number" min={0} value={form.displayOrder ?? 0}
                onChange={(e) => set('displayOrder', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Quote *</label>
              <textarea required rows={3} value={form.quote ?? ''} onChange={(e) => set('quote', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none"
                placeholder="What did they say about their experience?" />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.featured ?? false}
                  onChange={(e) => set('featured', e.target.checked)}
                  className="w-4 h-4 accent-green-500" />
                Feature on homepage
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50">
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Testimonial'}
            </button>
            <button type="button" onClick={cancelForm}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {testimonials.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No testimonials yet"
          description="Add your first testimonial to show on the site."
          action={
            <button onClick={openCreate} className="bg-green-500 text-black font-bold px-5 py-2 rounded-lg text-sm">
              + Add Testimonial
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="text-white font-bold">{t.name}</h3>
                  <span className="text-yellow-400 text-xs">{'★'.repeat(t.rating)}</span>
                  {t.featured && (
                    <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{t.roleOrContext}</p>
                <p className="text-gray-500 text-sm mt-1 italic line-clamp-2">"{t.quote}"</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(t)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs">
                  Edit
                </button>
                <button onClick={() => handleDelete(t.id)}
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

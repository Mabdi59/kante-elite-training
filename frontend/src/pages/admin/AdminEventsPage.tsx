import { useEffect, useState } from 'react'
import { getAdminEvents, createEvent, updateEvent, deleteEvent } from '../../services/api'
import type { Event } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'

const EVENT_TYPES = ['CAMP', 'CLINIC', 'WORKSHOP', 'TRYOUT', 'TOURNAMENT', 'OTHER']
const EVENT_STATUSES = ['DRAFT', 'OPEN', 'FULL', 'CLOSED', 'CANCELLED']

const emptyForm: Partial<Event> = {
  title: '', description: '', location: '', venue: '',
  startDate: '', endDate: '', ageGroup: '', spotsTotal: 20,
  price: 0, status: 'OPEN', type: 'CAMP', intensity: '',
  displayOrder: 0,
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [form, setForm] = useState<Partial<Event>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = () => {
    setLoading(true)
    getAdminEvents()
      .then(setEvents)
      .catch(() => setError('Failed to load events. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditingEvent(null)
    setForm(emptyForm)
    setSaveError('')
    setShowForm(true)
  }

  const openEdit = (e: Event) => {
    setEditingEvent(e)
    setForm({ ...e })
    setSaveError('')
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingEvent(null)
    setSaveError('')
  }

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      if (editingEvent) {
        const updated = await updateEvent(editingEvent.id, form)
        setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? updated : e)))
      } else {
        const created = await createEvent(form)
        setEvents((prev) => [created, ...prev])
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
    if (!window.confirm('Delete this event? This cannot be undone.')) return
    try {
      await deleteEvent(id)
      setEvents((prev) => prev.filter((e) => e.id !== id))
    } catch {
      setError('Failed to delete event.')
    }
  }

  const set = (field: keyof Event, val: unknown) =>
    setForm((prev) => ({ ...prev, [field]: val }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-3xl font-black">Events / Camps</h1>
        <button
          onClick={openCreate}
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + New Event
        </button>
      </div>

      {error && <div className="mb-6"><ErrorBanner message={error} onDismiss={() => setError('')} /></div>}

      {/* Create / Edit form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className={`bg-gray-900 border rounded-xl p-6 mb-6 space-y-5 ${editingEvent ? 'border-blue-500/40' : 'border-green-500/30'}`}
        >
          <h2 className="text-white font-bold text-xl">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>

          {saveError && <ErrorBanner message={saveError} onDismiss={() => setSaveError('')} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Title *</label>
              <input required value={form.title ?? ''} onChange={(e) => set('title', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                placeholder="e.g. Summer Striker Camp 2026" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Type</label>
              <select value={form.type ?? 'CAMP'} onChange={(e) => set('type', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Status</label>
              <select value={form.status ?? 'OPEN'} onChange={(e) => set('status', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                {EVENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Start Date *</label>
              <input required type="date" value={form.startDate ?? ''} onChange={(e) => set('startDate', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">End Date</label>
              <input type="date" value={form.endDate ?? ''} onChange={(e) => set('endDate', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Location *</label>
              <input required value={form.location ?? ''} onChange={(e) => set('location', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="City, State" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Venue</label>
              <input value={form.venue ?? ''} onChange={(e) => set('venue', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="Facility name" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Age Group</label>
              <input value={form.ageGroup ?? ''} onChange={(e) => set('ageGroup', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="e.g. U12-U16" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Intensity</label>
              <input value={form.intensity ?? ''} onChange={(e) => set('intensity', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="e.g. High" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Total Spots *</label>
              <input required type="number" min={1} value={form.spotsTotal ?? 20}
                onChange={(e) => set('spotsTotal', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Price ($)</label>
              <input type="number" min={0} value={form.price ?? 0}
                onChange={(e) => set('price', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Display Order</label>
              <input type="number" min={0} value={form.displayOrder ?? 0}
                onChange={(e) => set('displayOrder', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Description</label>
              <textarea rows={3} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50">
              {saving ? 'Saving…' : editingEvent ? 'Save Changes' : 'Create Event'}
            </button>
            <button type="button" onClick={cancelForm}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner label="Loading events…" />
      ) : events.length === 0 ? (
        <EmptyState
          icon="🏕️"
          title="No events yet"
          description="Create your first camp, clinic, or event to get started."
          action={
            <button onClick={openCreate} className="bg-green-500 text-black font-bold px-5 py-2 rounded-lg text-sm">
              + New Event
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-white font-bold">{e.title}</h3>
                  <StatusBadge status={e.status} />
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{e.type}</span>
                </div>
                <p className="text-gray-400 text-sm">
                  {e.startDate}{e.endDate && e.endDate !== e.startDate ? ` to ${e.endDate}` : ''} · {e.location}
                  {e.price > 0 && ` · $${e.price}`}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {e.spotsLeft ?? '?'} / {e.spotsTotal} spots left
                  {e.ageGroup && ` · ${e.ageGroup}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(e)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs">
                  Edit
                </button>
                <button onClick={() => handleDelete(e.id)}
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

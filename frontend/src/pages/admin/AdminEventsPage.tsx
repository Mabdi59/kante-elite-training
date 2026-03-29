import { useEffect, useState } from 'react'
import { getAdminEvents, deleteEvent } from '../../services/api'
import type { Event } from '../../types'

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminEvents()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this event?')) return
    try {
      await deleteEvent(id)
      setEvents((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="text-gray-400">Loading events…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-white text-3xl font-black">Events / Camps</h1>
        <p className="text-gray-400 text-sm">
          Use the API to create events (POST /api/admin/events)
        </p>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-400">No events yet.</p>
      ) : (
        <div className="grid gap-4">
          {events.map((e) => (
            <div
              key={e.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-bold">{e.title}</h3>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      e.status === 'OPEN'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {e.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {e.startDate} · {e.location} · ${e.price}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {e.spotsLeft} / {e.spotsTotal} spots left
                </p>
              </div>
              <button
                onClick={() => handleDelete(e.id)}
                className="text-red-500 hover:text-red-400 text-sm ml-4"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import axios from 'axios'
import ErrorBanner from '../components/ErrorBanner'

interface CalendarEvent {
  id: number
  title: string
  description?: string
  start: string
  end?: string
  type?: string
  color?: string
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  // New event form
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [newType, setNewType] = useState('')
  const [newColor] = useState('#22c55e')
  const [saving, setSaving] = useState(false)

  const token = localStorage.getItem('token')

  const fetchEvents = async () => {
    const from = new Date(year, month, 1).toISOString()
    const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
    try {
      const res = await axios.get(`/api/calendar?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEvents(res.data ?? [])
    } catch {
      setError('Failed to load calendar events.')
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [year, month])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const eventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter((e) => e.start.startsWith(dateStr))
  }

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : []

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.post(
        '/api/calendar',
        { title: newTitle, description: newDesc, start: newStart, end: newEnd, type: newType, color: newColor },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setShowForm(false)
      setNewTitle(''); setNewDesc(''); setNewStart(''); setNewEnd(''); setNewType('')
      fetchEvents()
    } catch {
      setError('Failed to create event.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-16 px-4">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-black text-white">Calendar</h1>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
          >
            + Add Event
          </button>
        </div>

        {error && <ErrorBanner message={error} />}

        {showForm && (
          <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="mb-4 text-base font-bold text-white">New Event</h2>
            <form onSubmit={handleAddEvent} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-400">Title *</label>
                <input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-400">Type</label>
                <input value={newType} onChange={(e) => setNewType(e.target.value)}
                  placeholder="e.g. SESSION, GAME"
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-400">Start *</label>
                <input required type="datetime-local" value={newStart} onChange={(e) => setNewStart(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-400">End</label>
                <input type="datetime-local" value={newEnd} onChange={(e) => setNewEnd(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-400">Description</label>
                <textarea rows={2} value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={saving}
                  className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Create Event'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
              <div className="mb-4 flex items-center justify-between">
                <button type="button" onClick={prevMonth} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-400 hover:text-white">‹</button>
                <span className="text-base font-bold text-white">{MONTH_NAMES[month]} {year}</span>
                <button type="button" onClick={nextMonth} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-400 hover:text-white">›</button>
              </div>

              <div className="grid grid-cols-7 gap-px text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} className="py-2 text-xs font-semibold text-gray-500">{d}</div>
                ))}

                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-1" />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dayEvents = eventsForDay(day)
                  const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                  const isSelected = selectedDay === day
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`relative rounded-lg p-1.5 text-sm transition-colors ${
                        isSelected
                          ? 'bg-green-600 text-white'
                          : isToday
                            ? 'border border-green-500/40 text-green-400'
                            : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      {day}
                      {dayEvents.length > 0 && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-px">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <span key={ev.id} className="h-1 w-1 rounded-full"
                              style={{ backgroundColor: ev.color || '#22c55e' }} />
                          ))}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
            <h3 className="mb-3 text-sm font-bold text-white">
              {selectedDay
                ? `${MONTH_NAMES[month]} ${selectedDay}`
                : 'Select a day'}
            </h3>
            {selectedDay && selectedEvents.length === 0 && (
              <p className="text-sm text-gray-500">No events this day.</p>
            )}
            <div className="space-y-2">
              {selectedEvents.map((ev) => (
                <div key={ev.id} className="rounded-lg border border-white/10 bg-black p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: ev.color || '#22c55e' }} />
                    <p className="text-sm font-semibold text-white">{ev.title}</p>
                  </div>
                  {ev.description && <p className="mt-1 text-xs text-gray-400">{ev.description}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {ev.end && ` – ${new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

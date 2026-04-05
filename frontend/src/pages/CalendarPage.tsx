import { useEffect, useState } from 'react'
import ErrorBanner from '../components/ErrorBanner'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

interface CalendarEvent {
  id: number
  title: string
  description?: string
  start: string
  end?: string
  type?: string
  color?: string
}

interface RawCalendarEvent {
  id?: number
  title?: string
  description?: string
  start?: string
  end?: string
  type?: string
  startAt?: string
  endAt?: string
  eventType?: string
  color?: string
}

function normalizeCalendarEvent(event: RawCalendarEvent): CalendarEvent | null {
  const start = event.start ?? event.startAt
  if (!start) return null

  return {
    id: event.id ?? 0,
    title: event.title ?? 'Untitled event',
    description: event.description,
    start,
    end: event.end ?? event.endAt,
    type: event.type ?? event.eventType,
    color: event.color,
  }
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
  const { isAuthenticated } = useAuth()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [icalToken, setIcalToken] = useState<string | null>(null)
  const [icalCopied, setIcalCopied] = useState(false)
  const [icalRegenerating, setIcalRegenerating] = useState(false)

  // New event form
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [newType, setNewType] = useState('')
  const [newColor] = useState('#22c55e')
  const [saving, setSaving] = useState(false)

  const fetchEvents = async () => {
    if (!isAuthenticated) return
    const from = new Date(year, month, 1).toISOString()
    const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
    try {
      const res = await api.get(`/calendar?from=${from}&to=${to}`)
      const normalizedEvents = Array.isArray(res.data)
        ? res.data
            .map((event: RawCalendarEvent) => normalizeCalendarEvent(event))
            .filter((event): event is CalendarEvent => event !== null)
        : []
      setEvents(normalizedEvents)
    } catch {
      setError('Failed to load calendar events.')
    }
  }

  const fetchIcalToken = async () => {
    if (!isAuthenticated) return
    try {
      const res = await api.get('/calendar/ical-token')
      setIcalToken(res.data.token)
    } catch {
      // iCal token is non-critical; silently ignore
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    fetchEvents()
  }, [year, month, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    fetchIcalToken()
  }, [isAuthenticated])

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
    return events.filter((e) => typeof e.start === 'string' && e.start.startsWith(dateStr))
  }

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : []

  const icalUrl = icalToken
    ? `${window.location.origin}/api/calendar/ical/${icalToken}.ics`
    : null

  const copyIcalUrl = () => {
    if (icalUrl) {
      navigator.clipboard.writeText(icalUrl)
      setIcalCopied(true)
      setTimeout(() => setIcalCopied(false), 2000)
    }
  }

  const regenerateIcalToken = async () => {
    if (!isAuthenticated) return
    setIcalRegenerating(true)
    try {
      const res = await api.post('/calendar/ical-token/regenerate', {})
      setIcalToken(res.data.token)
    } catch {
      setError('Failed to regenerate iCal token.')
    } finally {
      setIcalRegenerating(false)
    }
  }

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) return
    setSaving(true)
    try {
      await api.post(
        '/calendar',
        {
          title: newTitle,
          description: newDesc,
          startAt: newStart,
          endAt: newEnd || undefined,
          eventType: newType.trim() ? newType.trim().toUpperCase().replace(/\s+/g, '_') : undefined,
          color: newColor,
        },
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
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-black text-white">Calendar</h1>
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

        {/* iCal subscription */}
        {icalUrl && (
          <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
            <h3 className="text-sm font-bold text-white mb-1">Subscribe to Calendar</h3>
            <p className="text-xs text-gray-400 mb-3">
              Use this private URL to subscribe in Google Calendar, Apple Calendar, or Outlook. Keep it secret.
            </p>
            <div className="flex gap-2 flex-wrap">
              <input
                readOnly
                value={icalUrl}
                className="flex-1 min-w-0 rounded-lg border border-white/10 bg-black px-3 py-2 text-xs text-gray-300 font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={copyIcalUrl}
                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-500 shrink-0"
              >
                {icalCopied ? 'Copied!' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={regenerateIcalToken}
                disabled={icalRegenerating}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white disabled:opacity-50 shrink-0"
                title="Regenerate token — this invalidates the old URL"
              >
                {icalRegenerating ? '…' : 'Regenerate'}
              </button>
            </div>
          </div>
        )}
    </div>
  )
}

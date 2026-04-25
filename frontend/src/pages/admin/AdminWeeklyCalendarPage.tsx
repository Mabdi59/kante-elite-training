import { useEffect, useState } from 'react'
import { getAdminBookings } from '../../services/api'
import type { Booking } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'
import StatusBadge from '../../components/StatusBadge'

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Mon
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatWeekRange(mon: Date): string {
  const sun = addDays(mon, 6)
  return `${mon.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${sun.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

const STATUS_COLOURS: Record<string, string> = {
  CONFIRMED: 'bg-green-100 border-green-400',
  RESERVED: 'bg-yellow-100 border-yellow-400',
  COMPLETED: 'bg-blue-100 border-blue-400',
  CANCELLED: 'bg-red-100 border-red-400 opacity-60',
}

export default function AdminWeeklyCalendarPage() {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const from = toISO(weekStart)
  const to = toISO(addDays(weekStart, 6))

  useEffect(() => {
    setLoading(true)
    setError('')
    getAdminBookings({ from, to })
      .then(setBookings)
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false))
  }, [from, to])

  const bookingsByDay = weekDays.map((day) => ({
    day,
    bookings: bookings
      .filter((b) => b.bookingDate === toISO(day))
      .sort((a, b) => a.bookingTime.localeCompare(b.bookingTime)),
  }))

  const totalSessions = bookings.filter((b) => b.bookingStatus !== 'CANCELLED').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Weekly Calendar</h1>
          <p className="text-sm text-gray-400 mt-0.5">{formatWeekRange(weekStart)} · {totalSessions} session{totalSessions !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="px-3 py-1.5 text-xs rounded bg-surface border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setWeekStart((w) => addDays(w, -7))}
            className="px-3 py-1.5 text-xs rounded bg-surface border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={() => setWeekStart((w) => addDays(w, 7))}
            className="px-3 py-1.5 text-xs rounded bg-surface border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Desktop grid */}
          <div className="hidden lg:grid grid-cols-7 gap-2">
            {bookingsByDay.map(({ day, bookings: dayBookings }) => {
              const isToday = toISO(day) === toISO(new Date())
              return (
                <div key={toISO(day)} className="min-h-[160px]">
                  <div
                    className={`text-xs font-semibold mb-1.5 px-1 py-0.5 rounded ${
                      isToday ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400'
                    }`}
                  >
                    {formatDayLabel(day)}
                    {dayBookings.length > 0 && (
                      <span className="ml-1 text-[10px] text-gray-500">({dayBookings.length})</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {dayBookings.length === 0 ? (
                      <div className="text-[11px] text-gray-600 px-1">|</div>
                    ) : (
                      dayBookings.map((b) => (
                        <div
                          key={b.id}
                          className={`border-l-2 rounded px-1.5 py-1 text-[11px] ${STATUS_COLOURS[b.bookingStatus] ?? 'bg-gray-800 border-gray-500'}`}
                        >
                          <div className="font-semibold text-gray-800 truncate">{b.bookingTime}</div>
                          <div className="text-gray-700 truncate">{b.playerName}</div>
                          <div className="text-gray-500 truncate">{b.programName}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile / tablet stack */}
          <div className="lg:hidden space-y-4">
            {bookingsByDay.map(({ day, bookings: dayBookings }) => {
              const isToday = toISO(day) === toISO(new Date())
              return (
                <div key={toISO(day)} className="card">
                  <h3
                    className={`text-sm font-semibold mb-2 ${isToday ? 'text-amber-400' : 'text-gray-300'}`}
                  >
                    {formatDayLabel(day)}
                    {dayBookings.length > 0 && (
                      <span className="ml-2 text-xs text-gray-500 font-normal">{dayBookings.length} session{dayBookings.length !== 1 ? 's' : ''}</span>
                    )}
                  </h3>
                  {dayBookings.length === 0 ? (
                    <p className="text-xs text-gray-600">No sessions</p>
                  ) : (
                    <div className="space-y-2">
                      {dayBookings.map((b) => (
                        <div key={b.id} className="flex items-start justify-between gap-2 bg-white/5 rounded px-3 py-2">
                          <div className="text-xs min-w-0">
                            <span className="text-amber-400 font-semibold">{b.bookingTime}</span>
                            <span className="text-gray-200 ml-2">{b.playerName}</span>
                            <div className="text-gray-400 truncate">{b.programName}</div>
                          </div>
                          <StatusBadge status={b.bookingStatus} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
        {Object.entries(STATUS_COLOURS).map(([status, cls]) => (
          <span key={status} className={`border-l-2 pl-1.5 pr-2 py-0.5 rounded ${cls}`}>
            <span className="text-gray-700">{status}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useState, useCallback } from 'react'
import {
  getMyCoachSessions,
  rescheduleCoachSession,
  updateCoachSessionStatus,
  getCoachWeekSchedule,
} from '../../services/api'
import type { Booking } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'

type SessionFilter = 'upcoming' | 'past' | 'all'
type ViewMode = 'list' | 'week'

const STATUS_ACTIONS = [
  { label: 'Confirm', value: 'CONFIRMED', tone: 'bg-blue-600 hover:bg-blue-500' },
  { label: 'Complete', value: 'COMPLETED', tone: 'bg-green-600 hover:bg-green-500' },
  { label: 'Cancel', value: 'CANCELLED', tone: 'bg-red-700 hover:bg-red-600' },
] as const

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function dateToISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

export default function CoachSessionsManagerPage() {
  const [sessions, setSessions] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<SessionFilter>('upcoming')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [workingSessionId, setWorkingSessionId] = useState<number | null>(null)
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [selectedSession, setSelectedSession] = useState<Booking | null>(null)

  // Weekly view state
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()))
  const [weekSessions, setWeekSessions] = useState<Booking[]>([])
  const [weekLoading, setWeekLoading] = useState(false)

  useEffect(() => {
    getMyCoachSessions()
      .then(setSessions)
      .catch(() => setError('Could not load sessions. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const loadWeek = useCallback((start: Date) => {
    setWeekLoading(true)
    getCoachWeekSchedule(dateToISO(start))
      .then(setWeekSessions)
      .catch(() => setError('Could not load weekly schedule.'))
      .finally(() => setWeekLoading(false))
  }, [])

  useEffect(() => {
    if (viewMode === 'week') {
      loadWeek(weekStart)
    }
  }, [viewMode, weekStart, loadWeek])

  const prevWeek = () => {
    setWeekStart((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() - 7)
      return next
    })
  }

  const nextWeek = () => {
    setWeekStart((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() + 7)
      return next
    })
  }

  const today = new Date().toISOString().split('T')[0]

  const filteredSessions = sessions.filter((session) => {
    if (filter === 'upcoming') {
      return session.bookingDate >= today && session.bookingStatus !== 'CANCELLED'
    }
    if (filter === 'past') {
      return session.bookingDate < today || session.bookingStatus === 'COMPLETED'
    }
    return true
  })

  const openReschedule = (session: Booking) => {
    setEditingSessionId(session.id)
    setNewDate(session.bookingDate)
    setNewTime(session.bookingTime)
  }

  const closeReschedule = () => {
    setEditingSessionId(null)
    setNewDate('')
    setNewTime('')
  }

  const handleStatusUpdate = async (sessionId: number, status: string) => {
    setWorkingSessionId(sessionId)
    setError('')

    try {
      const updated = await updateCoachSessionStatus(sessionId, status)
      setSessions((current) =>
        current.map((session) => (session.id === sessionId ? updated : session)),
      )
    } catch {
      setError('Could not update the session status.')
    } finally {
      setWorkingSessionId(null)
    }
  }

  const handleReschedule = async (sessionId: number) => {
    if (!newDate.trim() || !newTime.trim()) {
      setError('Please enter both a date and time.')
      return
    }

    setWorkingSessionId(sessionId)
    setError('')

    try {
      const updated = await rescheduleCoachSession(sessionId, newDate, newTime)
      setSessions((current) =>
        current.map((session) => (session.id === sessionId ? updated : session)),
      )
      closeReschedule()
    } catch {
      setError('Could not reschedule the session.')
    } finally {
      setWorkingSessionId(null)
    }
  }

  // Build week day dates
  const weekDays = WEEKDAYS.map((label, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return { label, date: dateToISO(d), dayObj: d }
  })

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  if (loading) return <LoadingSpinner label="Loading sessions..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">My Sessions</h1>
          <p className="text-gray-400 text-sm mt-2">
            Update session status and reschedule assigned bookings from one place.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* View mode */}
          <div className="flex bg-gray-800 rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
          </div>
          {/* List filters (only in list mode) */}
          {viewMode === 'list' && (
            <div className="flex gap-2">
              {(['upcoming', 'past', 'all'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                    filter === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      {/* ── Weekly View ── */}
      {viewMode === 'week' && (
        <div className="space-y-4">
          {/* Week navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={prevWeek}
              className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span className="text-white font-semibold text-sm flex-1 text-center">{weekLabel}</span>
            <button
              onClick={nextWeek}
              className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {weekLoading ? (
            <LoadingSpinner label="Loading week..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {weekDays.map(({ label, date }) => {
                const daySessions = weekSessions.filter((s) => s.bookingDate === date)
                const isToday = date === today
                return (
                  <div
                    key={date}
                    className={`bg-gray-900 border rounded-xl p-3 min-h-[120px] ${
                      isToday ? 'border-green-500/40' : 'border-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-semibold ${isToday ? 'text-green-400' : 'text-gray-400'}`}>
                        {label}
                      </span>
                      <span className={`text-xs ${isToday ? 'text-green-400' : 'text-gray-600'}`}>
                        {new Date(date + 'T12:00:00').getDate()}
                      </span>
                    </div>
                    {daySessions.length === 0 ? (
                      <p className="text-gray-700 text-xs text-center mt-4">—</p>
                    ) : (
                      <div className="space-y-1.5">
                        {daySessions.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedSession(selectedSession?.id === s.id ? null : s)}
                            className={`w-full text-left bg-gray-800 hover:bg-gray-700 rounded-lg p-2 transition-colors ${
                              selectedSession?.id === s.id ? 'ring-1 ring-green-500' : ''
                            }`}
                          >
                            <p className="text-white text-xs font-medium truncate">{s.bookingTime}</p>
                            <p className="text-gray-400 text-xs truncate">{s.playerName}</p>
                            <p className="text-gray-500 text-xs truncate">{s.programName}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Session detail panel */}
          {selectedSession && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-white font-semibold">Session Detail</h3>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Player</p>
                  <p className="text-white">{selectedSession.playerName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Program</p>
                  <p className="text-white">{selectedSession.programName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Date & Time</p>
                  <p className="text-white">{selectedSession.bookingDate} at {selectedSession.bookingTime}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Status</p>
                  <StatusBadge status={selectedSession.bookingStatus} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUS_ACTIONS.map((action) => (
                  <button
                    key={action.value}
                    onClick={() => handleStatusUpdate(selectedSession.id, action.value)}
                    disabled={workingSessionId === selectedSession.id || selectedSession.bookingStatus === action.value}
                    className={`${action.tone} text-white text-sm font-semibold px-3 py-2 rounded-lg disabled:opacity-50`}
                  >
                    {workingSessionId === selectedSession.id ? 'Saving...' : action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── List View ── */}
      {viewMode === 'list' && (
        <>
          {filteredSessions.length === 0 ? (
            <EmptyState
              icon="S"
              title="Nothing here yet"
              description={filter === 'upcoming' ? 'No upcoming sessions.' : 'No sessions found.'}
            />
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const isWorking = workingSessionId === session.id
                const isEditing = editingSessionId === session.id

                return (
                  <div
                    key={session.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-[16rem]">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <p className="text-white font-semibold">{session.playerName}</p>
                          {session.playerAge ? (
                            <span className="text-gray-500 text-xs bg-gray-800 px-2 py-0.5 rounded-full">
                              Age {session.playerAge}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-gray-300 text-sm">{session.programName}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {session.bookingDate} at {session.bookingTime}
                        </p>
                        {session.notes ? (
                          <p className="text-gray-500 text-sm mt-2 italic">Notes: {session.notes}</p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>{session.email}</span>
                          <span>{session.phone}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start sm:items-end gap-3">
                        <StatusBadge status={session.bookingStatus} />
                        <button
                          onClick={() => (isEditing ? closeReschedule() : openReschedule(session))}
                          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                        >
                          {isEditing ? 'Close Reschedule' : 'Reschedule'}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {STATUS_ACTIONS.map((action) => (
                        <button
                          key={action.value}
                          onClick={() => handleStatusUpdate(session.id, action.value)}
                          disabled={isWorking || session.bookingStatus === action.value}
                          className={`${action.tone} text-white text-sm font-semibold px-3 py-2 rounded-lg disabled:opacity-50`}
                        >
                          {isWorking ? 'Saving...' : action.label}
                        </button>
                      ))}
                    </div>

                    {isEditing ? (
                      <div className="bg-gray-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="date"
                          value={newDate}
                          onChange={(event) => setNewDate(event.target.value)}
                          className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          value={newTime}
                          onChange={(event) => setNewTime(event.target.value)}
                          placeholder="New time"
                          className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                        <button
                          onClick={() => handleReschedule(session.id)}
                          disabled={isWorking}
                          className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
                        >
                          {isWorking ? 'Saving...' : 'Save New Time'}
                        </button>
                        <button
                          onClick={closeReschedule}
                          className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

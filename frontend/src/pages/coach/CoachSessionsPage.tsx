import { useEffect, useState } from 'react'
import { getMyCoachSessions } from '../../services/api'
import type { Booking } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'

export default function CoachSessionsPage() {
  const [sessions, setSessions] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming')

  useEffect(() => {
    getMyCoachSessions()
      .then(setSessions)
      .catch(() => setError('Could not load sessions. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]

  const filtered = sessions.filter((s) => {
    if (filter === 'upcoming') return s.bookingDate >= today && s.bookingStatus !== 'CANCELLED'
    if (filter === 'past') return s.bookingDate < today
    return true
  })

  if (loading) return <LoadingSpinner label="Loading sessions…" />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-3xl font-black">My Sessions</h1>
        <div className="flex gap-2">
          {(['upcoming', 'past', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-6"><ErrorBanner message={error} onDismiss={() => setError('')} /></div>}

      {filtered.length === 0 ? (
        <EmptyState icon="📅" title="Nothing here yet" description={filter === 'upcoming' ? 'No upcoming sessions.' : 'No sessions found.'} />
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <p className="text-white font-semibold">{s.playerName}</p>
                  {s.playerAge && (
                    <span className="text-gray-500 text-xs bg-gray-800 px-2 py-0.5 rounded-full">
                      Age {s.playerAge}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{s.programName}</p>
                <p className="text-gray-500 text-sm">
                  📅 {s.bookingDate} at {s.bookingTime}
                </p>
                {s.notes && (
                  <p className="text-gray-500 text-sm mt-2 italic">Notes: {s.notes}</p>
                )}
              </div>
              <div className="text-right">
                <StatusBadge status={s.bookingStatus} />
                {s.phone && <p className="text-gray-600 text-xs mt-2">{s.phone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import {
  cancelAdminSession,
  getAdminRegistrations,
  getAdminSessions,
  updateAdminRegistrationStatus,
} from '../../services/api'
import type { Registration, Session } from '../../types'
import ErrorBanner from '../../components/ErrorBanner'

const STATUS_OPTIONS = ['CONFIRMED', 'WAITLISTED', 'CANCELLED'] as const

export default function AdminRegistrationsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [sessionFilter, setSessionFilter] = useState<number | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Registrations | Kante Elite Training'
    return () => {
      document.title = 'Kante Elite Training'
    }
  }, [])

  useEffect(() => {
    Promise.all([getAdminSessions(), getAdminRegistrations()])
      .then(([sessionData, registrationData]) => {
        setSessions(sessionData)
        setRegistrations(registrationData)
      })
      .catch(() => setError('Failed to load sessions and registrations.'))
      .finally(() => setLoading(false))
  }, [])

  const visibleRegistrations = useMemo(
    () =>
      registrations.filter((registration) => {
        if (sessionFilter !== 'ALL' && registration.sessionId !== sessionFilter) {
          return false
        }
        if (statusFilter !== 'ALL' && registration.status !== statusFilter) {
          return false
        }
        return true
      }),
    [registrations, sessionFilter, statusFilter],
  )

  if (loading) {
    return <p className="text-gray-400 text-sm">Loading registrations...</p>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-white text-3xl font-black">Session Registrations</h1>
        <p className="text-gray-400 text-sm mt-2">
          Live capacity and registration management for generated sessions.
        </p>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white text-xl font-bold mb-4">Sessions</h2>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div key={session.id} className="bg-gray-800 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-white text-sm font-semibold">
                  {session.sourceTitle} · {new Date(session.startDatetime).toLocaleString()}
                </p>
                <p className="text-gray-400 text-xs">
                  {session.registeredCount}/{session.capacity} registered · {session.status}
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const cancelled = await cancelAdminSession(session.id)
                    setSessions((prev) =>
                      prev.map((item) => (item.id === session.id ? cancelled : item)),
                    )
                  } catch {
                    setError('Failed to cancel session.')
                  }
                }}
                className="text-red-400 text-sm"
              >
                Cancel Session
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="text-white text-xl font-bold mr-auto">Registrations</h2>
          <select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="ALL">All sessions</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.sourceTitle} · {new Date(session.startDatetime).toLocaleString()}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="ALL">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          {visibleRegistrations.map((registration) => (
            <div key={registration.id} className="bg-gray-800 rounded-lg px-4 py-3 flex flex-wrap gap-3 items-center">
              <div className="min-w-[220px]">
                <p className="text-white text-sm font-semibold">
                  {registration.playerName || registration.userEmail || 'Registrant'}
                </p>
                <p className="text-gray-400 text-xs">
                  Session #{registration.sessionId} · {new Date(registration.registeredAt).toLocaleString()}
                </p>
              </div>
              <select
                value={registration.status}
                onChange={async (e) => {
                  try {
                    const updated = await updateAdminRegistrationStatus(registration.id, e.target.value)
                    setRegistrations((prev) =>
                      prev.map((item) => (item.id === registration.id ? updated : item)),
                    )
                  } catch {
                    setError('Failed to update registration status.')
                  }
                }}
                className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

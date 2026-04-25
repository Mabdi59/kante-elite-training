import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAdminBookingSeries,
  deleteBookingSeries,
  cancelFutureSessions,
} from '../../services/api'
import type { BookingSeries } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'

const WEEKDAY_SHORT: Record<string, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
}

function formatWeekdays(weekdays: string): string {
  return weekdays
    .split(',')
    .map((d) => WEEKDAY_SHORT[d.trim().toUpperCase()] ?? d)
    .join(' · ')
}

export default function AdminRecurringSchedulePage() {
  const [series, setSeries] = useState<BookingSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [cancelFromDate, setCancelFromDate] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    getAdminBookingSeries()
      .then(setSeries)
      .catch(() => setError('Could not load recurring schedules. Please refresh.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await deleteBookingSeries(id)
      setSeries((prev) => prev.filter((s) => s.id !== id))
      setConfirmDeleteId(null)
    } catch {
      setError('Failed to delete series.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCancelFuture = async (id: number) => {
    if (!cancelFromDate) {
      setError('Please select a date to cancel from.')
      return
    }
    setCancellingId(id)
    try {
      await cancelFutureSessions(id, cancelFromDate)
      setCancellingId(null)
      setCancelFromDate('')
      load()
    } catch {
      setError('Failed to cancel future sessions.')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading recurring schedules..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Recurring Schedules</h1>
          <p className="text-gray-400 text-sm mt-1">
            {series.length} active {series.length === 1 ? 'series' : 'series'}
          </p>
        </div>
        <Link
          to="/admin/recurring-schedules/new"
          className="bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          + New Schedule
        </Link>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {/* Confirm delete modal */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-white font-bold text-lg">Delete Series?</h3>
            <p className="text-gray-400 text-sm">
              This will permanently delete the series and all associated sessions. This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-lg transition-colors"
              >
                {deletingId === confirmDeleteId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {series.length === 0 ? (
        <EmptyState
          title="No recurring schedules"
          description="Create a recurring training schedule to automate session booking."
          action={
            <Link
              to="/admin/recurring-schedules/new"
              className="bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Create Schedule
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {series.map((s) => (
            <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-semibold">
                      {s.title ?? s.programName ?? `Series #${s.id}`}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        s.active
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-gray-700 text-gray-500'
                      }`}
                    >
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    <span className="text-gray-400 text-sm">
                      📅 {formatWeekdays(s.weekdays)} at {s.bookingTime}
                    </span>
                    {s.coachName && (
                      <span className="text-gray-400 text-sm">👤 {s.coachName}</span>
                    )}
                    {s.programName && (
                      <span className="text-gray-400 text-sm">🎯 {s.programName}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <span className="text-gray-500 text-xs">
                      From {s.startDate}{s.endDate ? ` → ${s.endDate}` : ''}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {s.totalSessions} total · {s.upcomingSessions} upcoming · {s.completedSessions} completed
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.players.map((p) => (
                      <span
                        key={p.id}
                        className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => setConfirmDeleteId(s.id)}
                    className="bg-red-900/30 hover:bg-red-900/60 text-red-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Cancel Future section */}
              {cancellingId === s.id ? (
                <div className="mt-4 flex items-center gap-3 flex-wrap border-t border-gray-800 pt-4">
                  <input
                    type="date"
                    value={cancelFromDate}
                    onChange={(e) => setCancelFromDate(e.target.value)}
                    className="input-field-default px-3 py-1.5"
                  />
                  <button
                    onClick={() => handleCancelFuture(s.id)}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Confirm Cancel
                  </button>
                  <button
                    onClick={() => { setCancellingId(null); setCancelFromDate('') }}
                    className="text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <button
                    onClick={() => setCancellingId(s.id)}
                    className="text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
                  >
                    Cancel Future Sessions from Date →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

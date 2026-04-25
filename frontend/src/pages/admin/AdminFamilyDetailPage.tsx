import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAdminFamily } from '../../services/api'
import type { FamilyDetail } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
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

export default function AdminFamilyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [family, setFamily] = useState<FamilyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getAdminFamily(Number(id))
      .then(setFamily)
      .catch(() => setError('Could not load family details. Please refresh.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner label="Loading family..." />
  if (!family && error) return <ErrorBanner message={error} onDismiss={() => setError('')} />
  if (!family) return <div className="text-gray-400">Family not found.</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to="/admin/families" className="text-gray-400 hover:text-white transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-white text-2xl font-black">{family.parentName}</h1>
            <p className="text-gray-400 text-sm">{family.parentEmail}</p>
          </div>
        </div>
        <Link
          to={`/admin/recurring-schedules/new?familyId=${family.parentId}`}
          className="bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          + Create Recurring Schedule
        </Link>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-white">{family.totalBookings}</p>
          <p className="text-gray-400 text-xs mt-1">Total Bookings</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-green-400">{family.upcomingBookings}</p>
          <p className="text-gray-400 text-xs mt-1">Upcoming</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-blue-400">{family.completedBookings}</p>
          <p className="text-gray-400 text-xs mt-1">Completed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Parent info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Parent Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide">Name</p>
                <p className="text-white text-sm mt-0.5">{family.parentName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide">Email</p>
                <p className="text-white text-sm mt-0.5">{family.parentEmail}</p>
              </div>
              {family.parentPhone && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Phone</p>
                  <p className="text-white text-sm mt-0.5">{family.parentPhone}</p>
                </div>
              )}
              {family.emergencyContact && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Emergency Contact</p>
                  <p className="text-white text-sm mt-0.5">{family.emergencyContact}</p>
                </div>
              )}
            </div>
          </div>

          {/* Players */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Players ({family.players.length})</h2>
              <Link
                to="/admin/players"
                className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
              >
                Manage →
              </Link>
            </div>
            {family.players.length === 0 ? (
              <p className="text-gray-500 text-sm">No players yet.</p>
            ) : (
              <div className="space-y-3">
                {family.players.map((player) => (
                  <div key={player.id} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm font-medium">{player.name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          player.active
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-gray-700 text-gray-500'
                        }`}
                      >
                        {player.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                      {player.age && <span className="text-gray-400 text-xs">Age {player.age}</span>}
                      {player.skillLevel && (
                        <span className="text-gray-400 text-xs">{player.skillLevel}</span>
                      )}
                      {player.preferredPosition && (
                        <span className="text-gray-400 text-xs">{player.preferredPosition}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Recurring Schedules */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Active Recurring Schedules</h2>
              <Link
                to={`/admin/recurring-schedules/new?familyId=${family.parentId}`}
                className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
              >
                + New Schedule
              </Link>
            </div>
            {family.activeSeries.length === 0 ? (
              <EmptyState
                title="No active schedules"
                description="Create a recurring training schedule for this family."
                action={
                  <Link
                    to={`/admin/recurring-schedules/new?familyId=${family.parentId}`}
                    className="bg-green-500 hover:bg-green-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Create Schedule
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {family.activeSeries.map((series) => (
                  <div key={series.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {series.title ?? series.programName ?? `Series #${series.id}`}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          <span className="text-gray-400 text-xs">{formatWeekdays(series.weekdays)}</span>
                          <span className="text-gray-400 text-xs">{series.bookingTime}</span>
                          {series.coachName && (
                            <span className="text-gray-400 text-xs">Coach: {series.coachName}</span>
                          )}
                        </div>
                        <div className="flex gap-3 mt-2">
                          <span className="text-xs text-gray-500">
                            {series.totalSessions} total · {series.upcomingSessions} upcoming
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {series.players.map((p) => (
                            <span
                              key={p.id}
                              className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full"
                            >
                              {p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link
                        to={`/admin/recurring-schedules`}
                        className="text-gray-400 hover:text-white text-xs shrink-0 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Recent Bookings</h2>
              <Link
                to="/admin/bookings"
                className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            {family.recentBookings.length === 0 ? (
              <p className="text-gray-500 text-sm">No bookings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-500 text-xs font-medium pb-2 pr-4">Date</th>
                      <th className="text-left text-gray-500 text-xs font-medium pb-2 pr-4">Time</th>
                      <th className="text-left text-gray-500 text-xs font-medium pb-2 pr-4">Program</th>
                      <th className="text-left text-gray-500 text-xs font-medium pb-2 pr-4">Player</th>
                      <th className="text-left text-gray-500 text-xs font-medium pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {family.recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="py-2.5 pr-4 text-gray-300 whitespace-nowrap">{booking.date}</td>
                        <td className="py-2.5 pr-4 text-gray-300 whitespace-nowrap">{booking.time}</td>
                        <td className="py-2.5 pr-4 text-gray-300 max-w-xs truncate">{booking.programName}</td>
                        <td className="py-2.5 pr-4 text-gray-300 whitespace-nowrap">{booking.playerName}</td>
                        <td className="py-2.5">
                          <StatusBadge status={booking.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

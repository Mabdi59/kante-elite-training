import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCoachProgressNotes, getAttendanceByRange } from '../services/api'
import type { PlayerProgressNote, AttendanceRecord } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

export default function CoachDashboardPage() {
  const [notes, setNotes] = useState<PlayerProgressNote[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const today = new Date()
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
  const todayStr = today.toISOString().slice(0, 10)

  useEffect(() => {
    document.title = 'Coach Dashboard | Kante Elite Training'
    return () => {
      document.title = 'Kante Elite Training'
    }
  }, [])

  useEffect(() => {
    Promise.all([
      getCoachProgressNotes().catch(() => [] as PlayerProgressNote[]),
      getAttendanceByRange(monthStart, todayStr).catch(() => [] as AttendanceRecord[]),
    ])
      .then(([n, a]) => {
        setNotes(n)
        setAttendance(a)
      })
      .catch(() => setError('Could not load dashboard data. Please refresh.'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const recentNotes = useMemo(
    () =>
      [...notes]
        .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
        .slice(0, 5),
    [notes],
  )

  const attendanceCounts = useMemo(
    () =>
      attendance.reduce(
        (acc, a) => {
          if (a.status === 'PRESENT') acc.present += 1
          else if (a.status === 'LATE') acc.late += 1
          else acc.absent += 1
          return acc
        },
        { present: 0, late: 0, absent: 0 },
      ),
    [attendance],
  )

  if (loading) return <LoadingSpinner label="Loading dashboard…" />

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-white text-3xl font-black">Coach Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Overview of your session notes and player attendance this month.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {(
          [
            {
              label: 'Notes this month',
              value: notes.filter((n) => n.sessionDate >= monthStart).length,
              color: 'text-blue-400',
              link: '/coach/notes',
            },
            {
              label: 'Present',
              value: attendanceCounts.present,
              color: 'text-green-400',
              link: '/coach/attendance',
            },
            {
              label: 'Late',
              value: attendanceCounts.late,
              color: 'text-amber-400',
              link: '/coach/attendance',
            },
            {
              label: 'Absent',
              value: attendanceCounts.absent,
              color: 'text-red-400',
              link: '/coach/attendance',
            },
          ] as { label: string; value: number; color: string; link: string }[]
        ).map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
          >
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          to="/coach/notes"
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + New Progress Note
        </Link>
        <Link
          to="/coach/attendance"
          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Record Attendance
        </Link>
      </div>

      {/* Recent notes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Recent Progress Notes</h2>
          <Link to="/coach/notes" className="text-green-400 hover:text-green-300 text-sm font-medium">
            View all →
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-500 text-sm">No progress notes yet.</p>
            <Link
              to="/coach/notes"
              className="inline-block mt-3 bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg text-sm"
            >
              Write your first note
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentNotes.map((n) => (
              <div key={n.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      {n.title && <span className="text-white font-semibold text-sm">{n.title}</span>}
                      {n.noteType && (
                        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 capitalize">
                          {n.noteType.toLowerCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {n.playerName ?? n.playerEmail}
                      {n.playerName && (
                        <span className="text-gray-600 font-normal"> · {n.playerEmail}</span>
                      )}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {new Date(n.sessionDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-gray-300 text-sm mt-1.5 leading-relaxed line-clamp-2">
                      {n.content}
                    </p>
                  </div>
                  {n.rating != null && (
                    <div
                      className="flex items-center gap-0.5 shrink-0"
                      aria-label={`Rating: ${n.rating} out of 5`}
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg
                          key={i}
                          className={`h-3 w-3 ${i < n.rating! ? 'text-amber-400' : 'text-gray-700'}`}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
                        </svg>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

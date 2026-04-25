import { useEffect, useState } from 'react'
import api from '../../services/api'
import { getMyCoachSessions } from '../../services/api'
import type { Booking } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE'

interface AttendanceRow {
  bookingId: number
  playerEmail: string
  playerName: string
  status: AttendanceStatus
  coachNotes: string
}

export default function CoachAttendancePage() {
  const [sessions, setSessions] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attendance, setAttendance] = useState<Record<number, AttendanceRow>>({})
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({})
  const [success, setSuccess] = useState<Record<number, boolean>>({})

  useEffect(() => {
    getMyCoachSessions()
      .then((data) => {
        setSessions(data)
        const init: Record<number, AttendanceRow> = {}
        data.forEach((s) => {
          init[s.id] = {
            bookingId: s.id,
            playerEmail: s.email,
            playerName: s.playerName,
            status: 'PRESENT',
            coachNotes: '',
          }
        })
        setAttendance(init)
      })
      .catch(() => setError('Failed to load sessions.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (bookingId: number) => {
    const row = attendance[bookingId]
    if (!row) return
    setSubmitting((prev) => ({ ...prev, [bookingId]: true }))
    try {
      await api.post('/attendance', row)
      setSuccess((prev) => ({ ...prev, [bookingId]: true }))
    } catch {
      setError('Failed to submit attendance for booking ' + bookingId)
    } finally {
      setSubmitting((prev) => ({ ...prev, [bookingId]: false }))
    }
  }

  if (loading) return <LoadingSpinner label="Loading sessions…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Mark Attendance</h1>
        <p className="mt-1 text-sm text-gray-400">Record attendance for your sessions.</p>
      </div>

      {error && <ErrorBanner message={error} />}

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-[#222] bg-[#111] p-8 text-center text-gray-400">
          No sessions found.
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const row = attendance[session.id]
            const done = success[session.id]
            return (
              <div
                key={session.id}
                className="rounded-xl border border-[#222] bg-[#111] p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{session.playerName}</p>
                    <p className="text-sm text-gray-400">{session.programName}</p>
                    <p className="text-xs text-gray-500">
                      {session.bookingDate} · {session.bookingTime}
                    </p>
                  </div>
                  {done && (
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-amber-500">
                      Saved ✓
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {(['PRESENT', 'ABSENT', 'LATE'] as AttendanceStatus[]).map((s) => (
                    <label key={s} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={`status-${session.id}`}
                        value={s}
                        checked={row?.status === s}
                        onChange={() =>
                          setAttendance((prev) => ({
                            ...prev,
                            [session.id]: { ...prev[session.id], status: s },
                          }))
                        }
                        className="accent-green-500"
                      />
                      <span
                        className={`text-sm font-semibold ${
                          s === 'PRESENT'
                            ? 'text-amber-500'
                            : s === 'ABSENT'
                              ? 'text-red-400'
                              : 'text-yellow-400'
                        }`}
                      >
                        {s}
                      </span>
                    </label>
                  ))}
                </div>

                <textarea
                  rows={2}
                  placeholder="Coach notes (optional)"
                  value={row?.coachNotes ?? ''}
                  onChange={(e) =>
                    setAttendance((prev) => ({
                      ...prev,
                      [session.id]: { ...prev[session.id], coachNotes: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />

                <button
                  type="button"
                  onClick={() => handleSubmit(session.id)}
                  disabled={submitting[session.id] || done}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
                >
                  {submitting[session.id] ? 'Saving…' : done ? 'Saved' : 'Save Attendance'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

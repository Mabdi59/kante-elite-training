import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

interface AttendanceRecord {
  id: number
  bookingId: number
  status: string
  date: string
  programName?: string
  coachNotes?: string
}

interface Summary {
  total: number
  present: number
  absent: number
  late: number
}

interface ProgressNote {
  id: number
  coachName: string
  sessionDate: string
  noteType: string
  title: string
  content: string
  rating: number | null
}

const NOTE_TYPE_COLORS: Record<string, string> = {
  GENERAL: 'bg-gray-700/40 text-gray-300',
  TECHNICAL: 'bg-blue-500/20 text-blue-400',
  TACTICAL: 'bg-purple-500/20 text-purple-400',
  PHYSICAL: 'bg-orange-500/20 text-orange-400',
  MENTAL: 'bg-pink-500/20 text-pink-400',
  MILESTONE: 'bg-green-500/20 text-green-400',
}

export default function PlayerDevelopmentPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [summary, setSummary] = useState<Summary>({ total: 0, present: 0, absent: 0, late: 0 })
  const [notes, setNotes] = useState<ProgressNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, notesRes] = await Promise.all([
          api.get<AttendanceRecord[]>('/attendance/player'),
          api.get<ProgressNote[]>('/player/progress-notes').catch(() => ({ data: [] as ProgressNote[] })),
        ])
        const recs: AttendanceRecord[] = recRes.data ?? []
        setRecords(recs)
        setNotes(notesRes.data ?? [])

        const total = recs.length
        const present = recs.filter(r => r.status === 'PRESENT').length
        const absent = recs.filter(r => r.status === 'ABSENT').length
        const late = recs.filter(r => r.status === 'LATE').length
        setSummary({ total, present, absent, late })
      } catch {
        setError('Failed to load development data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const attendanceRate = summary.total
    ? Math.round((summary.present / summary.total) * 100)
    : 0

  if (loading) return <LoadingSpinner label="Loading development data…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">My Development</h1>
        <p className="mt-1 text-sm text-gray-400">Track your attendance and progress notes from coaches.</p>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: 'Total Sessions', value: summary.total, color: 'text-white' },
          { label: 'Present', value: summary.present, color: 'text-green-400' },
          { label: 'Absent', value: summary.absent, color: 'text-red-400' },
          { label: 'Late', value: summary.late, color: 'text-yellow-400' },
          { label: 'Attendance Rate', value: `${attendanceRate}%`, color: 'text-green-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[#222] bg-[#111] p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
            <p className={`mt-2 text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-white">Session History</h2>
        {records.length === 0 ? (
          <div className="rounded-xl border border-[#222] bg-[#111] p-8 text-center text-gray-400">
            No attendance records yet.
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-[#222] bg-[#111] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{r.programName || `Session #${r.bookingId}`}</p>
                  <p className="text-xs text-gray-500">{r.date}</p>
                  {r.coachNotes && <p className="mt-1 text-xs text-gray-400 italic">"{r.coachNotes}"</p>}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    r.status === 'PRESENT'
                      ? 'bg-green-500/20 text-green-400'
                      : r.status === 'ABSENT'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-white">Development Notes from Coaches</h2>
        {notes.length === 0 ? (
          <div className="rounded-xl border border-[#222] bg-[#111] p-8 text-center text-gray-400">
            No development notes yet.
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-xl border border-[#222] bg-[#111] p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${NOTE_TYPE_COLORS[note.noteType] ?? NOTE_TYPE_COLORS.GENERAL}`}>
                    {note.noteType}
                  </span>
                  <span className="text-gray-400 text-xs">{note.sessionDate}</span>
                  <span className="text-gray-500 text-xs">by {note.coachName}</span>
                  {note.rating && (
                    <span className="text-yellow-400 text-xs">{'★'.repeat(note.rating)}{'☆'.repeat(5 - note.rating)}</span>
                  )}
                </div>
                {note.title && <p className="text-white font-semibold text-sm mb-1">{note.title}</p>}
                <p className="text-gray-300 text-sm leading-relaxed">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


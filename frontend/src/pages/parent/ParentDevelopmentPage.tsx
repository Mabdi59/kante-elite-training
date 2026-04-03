import { useState } from 'react'
import axios from 'axios'
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

interface Enrollment {
  id: number
  programName: string
  status: string
  scheduleType: string
  startDate?: string
}

interface SignedWaiver {
  id: number
  templateTitle: string
  signedAt: string
}

export default function ParentDevelopmentPage() {
  const [playerEmail, setPlayerEmail] = useState('')
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [waivers, setWaivers] = useState<SignedWaiver[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const token = localStorage.getItem('token')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerEmail.trim()) return
    setLoading(true)
    setError('')
    try {
      const [attRes, enrollRes, waiversRes] = await Promise.all([
        axios.get(`/api/attendance/range?playerEmail=${encodeURIComponent(playerEmail)}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get('/api/enrollments/my', { headers: { Authorization: `Bearer ${token}` } })
          .catch(() => ({ data: [] })),
        axios.get('/api/waivers/my-signed', { headers: { Authorization: `Bearer ${token}` } })
          .catch(() => ({ data: [] })),
      ])
      setRecords(attRes.data ?? [])
      setEnrollments(enrollRes.data ?? [])
      setWaivers(waiversRes.data ?? [])
      setSearched(true)
    } catch {
      setError('Failed to load player data.')
    } finally {
      setLoading(false)
    }
  }

  const total = records.length
  const present = records.filter(r => r.status === 'PRESENT').length
  const rate = total ? Math.round((present / total) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Player Development</h1>
        <p className="mt-1 text-sm text-gray-400">Look up your child's progress.</p>
      </div>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="email"
          required
          value={playerEmail}
          onChange={(e) => setPlayerEmail(e.target.value)}
          placeholder="Player email address"
          className="flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <button type="submit" disabled={loading}
          className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50">
          {loading ? 'Loading…' : 'Look Up'}
        </button>
      </form>

      {loading && <LoadingSpinner label="Loading player data…" />}

      {searched && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Sessions', value: total, color: 'text-white' },
              { label: 'Present', value: present, color: 'text-green-400' },
              { label: 'Absent', value: records.filter(r => r.status === 'ABSENT').length, color: 'text-red-400' },
              { label: 'Attendance Rate', value: `${rate}%`, color: 'text-green-400' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-zinc-900 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
                <p className={`mt-2 text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="mb-3 text-base font-bold text-white">Attendance History</h2>
            {records.length === 0 ? (
              <p className="text-sm text-gray-400">No records found for this player.</p>
            ) : (
              <div className="space-y-2">
                {records.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{r.programName || `Session #${r.bookingId}`}</p>
                      <p className="text-xs text-gray-500">{r.date}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      r.status === 'PRESENT' ? 'bg-green-500/20 text-green-400'
                      : r.status === 'ABSENT' ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                    }`}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-base font-bold text-white">Enrolled Programs</h2>
            {enrollments.length === 0 ? (
              <p className="text-sm text-gray-400">No enrollments found.</p>
            ) : (
              <div className="space-y-2">
                {enrollments.map((en) => (
                  <div key={en.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{en.programName}</p>
                      <p className="text-xs text-gray-400">{en.scheduleType}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      en.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400'
                      : en.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-red-500/20 text-red-400'
                    }`}>{en.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-base font-bold text-white">Signed Waivers</h2>
            {waivers.length === 0 ? (
              <p className="text-sm text-gray-400">No waivers signed.</p>
            ) : (
              <div className="space-y-2">
                {waivers.map((w) => (
                  <div key={w.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900 px-4 py-3">
                    <p className="text-sm font-semibold text-white">{w.templateTitle}</p>
                    <span className="text-xs text-gray-400">{new Date(w.signedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

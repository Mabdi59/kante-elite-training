import { useState } from 'react'
import axios from 'axios'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

interface AttendanceRecord {
  id: number
  bookingId: number
  playerName: string
  playerEmail: string
  status: string
  coachNotes: string
  date: string
}

function exportCsv(records: AttendanceRecord[]) {
  const header = 'ID,Player,Email,Status,Notes,Date'
  const rows = records.map(
    (r) =>
      `${r.id},"${r.playerName}","${r.playerEmail}",${r.status},"${r.coachNotes ?? ''}",${r.date}`,
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'attendance.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminAttendancePage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [playerEmail, setPlayerEmail] = useState('')
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const token = localStorage.getItem('token')

  const handleSearch = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      if (playerEmail) params.set('playerEmail', playerEmail)
      const res = await axios.get(`/api/attendance/range?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setRecords(res.data ?? [])
      setSearched(true)
    } catch {
      setError('Failed to load attendance records.')
    } finally {
      setLoading(false)
    }
  }

  const total = records.length
  const present = records.filter((r) => r.status === 'PRESENT').length
  const absent = records.filter((r) => r.status === 'ABSENT').length
  const late = records.filter((r) => r.status === 'LATE').length
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Attendance Records</h1>
        <p className="mt-1 text-sm text-gray-400">Filter and review attendance data.</p>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400">Player Email</label>
            <input
              type="email"
              value={playerEmail}
              onChange={(e) => setPlayerEmail(e.target.value)}
              placeholder="player@example.com"
              className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
          {records.length > 0 && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => exportCsv(records)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Export CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && <LoadingSpinner label="Loading records…" />}

      {searched && !loading && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total', value: total, color: 'text-white' },
              { label: 'Present', value: `${present} (${pct(present)}%)`, color: 'text-green-400' },
              { label: 'Absent', value: `${absent} (${pct(absent)}%)`, color: 'text-red-400' },
              { label: 'Late', value: `${late} (${pct(late)}%)`, color: 'text-yellow-400' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-zinc-900 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
                <p className={`mt-2 text-xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {records.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center text-gray-400">
              No records found for the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 bg-zinc-900">
                  <tr>
                    {['Player', 'Email', 'Status', 'Date', 'Notes'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-black">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white">{r.playerName}</td>
                      <td className="px-4 py-3 text-gray-400">{r.playerEmail}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            r.status === 'PRESENT'
                              ? 'bg-green-500/20 text-green-400'
                              : r.status === 'ABSENT'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{r.date}</td>
                      <td className="px-4 py-3 text-gray-500">{r.coachNotes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

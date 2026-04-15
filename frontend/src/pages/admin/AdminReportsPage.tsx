import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

interface RevenueReport {
  totalBookings: number
  paidBookings: number
  pendingBookings: number
  byProgram: { programName: string; count: number; revenue: number }[]
  byMonth: { month: string; count: number; revenue: number }[]
}

interface AttendanceReport {
  total: number
  present: number
  absent: number
  late: number
  byPlayer: { playerName: string; playerEmail: string; present: number; total: number }[]
}

export default function AdminReportsPage() {
  const [revenue, setRevenue] = useState<RevenueReport | null>(null)
  const [attendance, setAttendance] = useState<AttendanceReport | null>(null)
  const [revLoading, setRevLoading] = useState(true)
  const [attLoading, setAttLoading] = useState(false)
  const [error, setError] = useState('')
  const [attFrom, setAttFrom] = useState('')
  const [attTo, setAttTo] = useState('')

  useEffect(() => {
    api
      .get('/admin/reports/revenue')
      .then((r) => setRevenue(r.data))
      .catch(() => setError('Failed to load revenue report.'))
      .finally(() => setRevLoading(false))
  }, [])

  const fetchAttendance = async () => {
    setAttLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (attFrom) params.set('from', attFrom)
      if (attTo) params.set('to', attTo)
      const res = await api.get(`/admin/reports/attendance?${params.toString()}`)
      setAttendance(res.data)
    } catch {
      setError('Failed to load attendance report.')
    } finally {
      setAttLoading(false)
    }
  }

  const attTotal = attendance?.total ?? 0
  const attPct = (n: number) => (attTotal ? Math.round((n / attTotal) * 100) : 0)

  const downloadCsv = async (path: string, filename: string) => {
    try {
      const res = await api.get(path, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Failed to download CSV.')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Reports</h1>
        <p className="mt-1 text-sm text-gray-400">Revenue and attendance analytics.</p>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Revenue Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h2 className="text-lg font-bold text-white">Revenue Summary</h2>
          <button
            type="button"
            onClick={() => downloadCsv('/admin/reports/revenue/csv', 'revenue-report.csv')}
            className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-600"
          >
            ⬇ Download CSV
          </button>
        </div>

        {revLoading ? (
          <LoadingSpinner label="Loading revenue…" />
        ) : revenue ? (
          <>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Bookings', value: revenue.totalBookings, color: 'text-white' },
                { label: 'Paid', value: revenue.paidBookings, color: 'text-green-400' },
                { label: 'Pending', value: revenue.pendingBookings, color: 'text-amber-400' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-zinc-900 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
                  <p className={`mt-2 text-3xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {revenue.byProgram?.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-zinc-900 overflow-hidden">
                <div className="border-b border-white/10 px-4 py-3">
                  <h3 className="text-sm font-bold text-white">Bookings by Program</h3>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-black/30">
                    <tr>
                      {['Program', 'Bookings', 'Revenue'].map((h) => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {revenue.byProgram.map((row) => (
                      <tr key={row.programName} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-white">{row.programName}</td>
                        <td className="px-4 py-3 text-gray-300">{row.count}</td>
                        <td className="px-4 py-3 text-green-400">${row.revenue?.toFixed(2) ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {revenue.byMonth?.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-zinc-900 overflow-hidden">
                <div className="border-b border-white/10 px-4 py-3">
                  <h3 className="text-sm font-bold text-white">Bookings by Month</h3>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-black/30">
                    <tr>
                      {['Month', 'Bookings', 'Revenue'].map((h) => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {revenue.byMonth.map((row) => (
                      <tr key={row.month} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-white">{row.month}</td>
                        <td className="px-4 py-3 text-gray-300">{row.count}</td>
                        <td className="px-4 py-3 text-green-400">${row.revenue?.toFixed(2) ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400">No revenue data available.</p>
        )}
      </section>

      {/* Attendance Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h2 className="text-lg font-bold text-white">Attendance Report</h2>
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams()
              if (attFrom) params.set('from', attFrom)
              if (attTo) params.set('to', attTo)
              downloadCsv(`/admin/reports/attendance/csv?${params.toString()}`, 'attendance-report.csv')
            }}
            className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-600"
          >
            ⬇ Download CSV
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400">From</label>
            <input type="date" value={attFrom} onChange={(e) => setAttFrom(e.target.value)}
              className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400">To</label>
            <input type="date" value={attTo} onChange={(e) => setAttTo(e.target.value)}
              className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500" />
          </div>
          <button type="button" onClick={fetchAttendance} disabled={attLoading}
            className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50">
            {attLoading ? 'Loading…' : 'Run Report'}
          </button>
        </div>

        {attLoading && <LoadingSpinner label="Loading attendance…" />}

        {attendance && !attLoading && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Sessions', value: attTotal, color: 'text-white' },
                { label: 'Present', value: `${attendance.present} (${attPct(attendance.present)}%)`, color: 'text-green-400' },
                { label: 'Absent', value: `${attendance.absent} (${attPct(attendance.absent)}%)`, color: 'text-red-400' },
                { label: 'Late', value: `${attendance.late} (${attPct(attendance.late)}%)`, color: 'text-yellow-400' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-zinc-900 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
                  <p className={`mt-2 text-lg font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {attendance.byPlayer?.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10 bg-zinc-900">
                    <tr>
                      {['Player', 'Email', 'Present', 'Total', 'Rate'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-black">
                    {attendance.byPlayer.map((p) => (
                      <tr key={p.playerEmail} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-white">{p.playerName}</td>
                        <td className="px-4 py-3 text-gray-400">{p.playerEmail}</td>
                        <td className="px-4 py-3 text-green-400">{p.present}</td>
                        <td className="px-4 py-3 text-gray-300">{p.total}</td>
                        <td className="px-4 py-3 text-gray-300">
                          {p.total ? Math.round((p.present / p.total) * 100) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

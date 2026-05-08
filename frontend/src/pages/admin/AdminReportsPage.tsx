import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getAdminBookings,
  getAdminDashboard,
  getAdminPrograms,
  getAttendanceByRange,
  getBookingsOverTime,
} from '../../services/api'
import type { AdminDashboard, AttendanceRecord, Booking, Program } from '../../types'
import PageSkeleton from '../../components/PageSkeleton'
import ErrorBanner from '../../components/ErrorBanner'
import EmptyState from '../../components/EmptyState'

const LoadingSpinner = () => <PageSkeleton titleWidthClassName="w-40" count={8} />

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default function AdminReportsPage() {
  const [stats, setStats] = useState<AdminDashboard | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [bookingTrend, setBookingTrend] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Reports | Kante Elite Training'
    return () => {
      document.title = 'Kante Elite Training'
    }
  }, [])

  useEffect(() => {
    const today = new Date()
    const rangeStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
    const rangeEnd = today.toISOString().slice(0, 10)

    Promise.all([
      getAdminDashboard(),
      getAdminBookings(),
      getAdminPrograms(),
      getAttendanceByRange(rangeStart, rangeEnd).catch(() => [] as AttendanceRecord[]),
      getBookingsOverTime(90).catch(() => [] as { date: string; count: number }[]),
    ])
      .then(([dashboardData, bookingData, programData, attendanceData, trendData]) => {
        setStats(dashboardData)
        setBookings(bookingData)
        setPrograms(programData)
        setAttendance(attendanceData)
        setBookingTrend(trendData)
      })
      .catch(() => setError('Failed to load reports. Please refresh and try again.'))
      .finally(() => setLoading(false))
  }, [])

  const analytics = useMemo(() => {
    const programPriceById = new Map(programs.map((program) => [program.id, program.price]))
    const paidBookings = bookings.filter((booking) => booking.paymentStatus === 'PAID')
    const pendingBookings = bookings.filter((booking) => booking.paymentStatus === 'PENDING')
    const paidRevenue = paidBookings.reduce(
      (sum, booking) => sum + (programPriceById.get(booking.programId) ?? 0),
      0,
    )
    const pendingRevenue = pendingBookings.reduce(
      (sum, booking) => sum + (programPriceById.get(booking.programId) ?? 0),
      0,
    )

    const attendanceCounts = attendance.reduce(
      (acc, record) => {
        acc[record.status] += 1
        return acc
      },
      { PRESENT: 0, LATE: 0, ABSENT: 0 },
    )
    const attendanceCompleted = attendanceCounts.PRESENT + attendanceCounts.LATE
    const attendanceRate = attendance.length
      ? Math.round((attendanceCompleted / attendance.length) * 100)
      : 0

    const programCounts = bookings.reduce<Record<string, { bookings: number; revenue: number }>>(
      (acc, booking) => {
        const key = booking.programName || 'Unassigned'
        if (!acc[key]) {
          acc[key] = { bookings: 0, revenue: 0 }
        }
        acc[key].bookings += 1
        if (booking.paymentStatus === 'PAID') {
          acc[key].revenue += programPriceById.get(booking.programId) ?? 0
        }
        return acc
      },
      {},
    )

    const topPrograms = Object.entries(programCounts)
      .map(([name, value]) => ({ name, bookings: value.bookings, revenue: value.revenue }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5)

    return {
      paidRevenue,
      pendingRevenue,
      attendanceCounts,
      attendanceRate,
      topPrograms,
      paidBookings: paidBookings.length,
      pendingBookings: pendingBookings.length,
    }
  }, [attendance, bookings, programs])

  if (loading) return <LoadingSpinner />

  if (error || !stats) {
    return <ErrorBanner message={error || 'Failed to load reports.'} />
  }

  const summaryCards = [
    {
      label: 'Estimated Paid Revenue',
      value: currencyFormatter.format(analytics.paidRevenue),
      detail: `${analytics.paidBookings} paid bookings`,
      tone: 'text-green-400 border-green-500/20 bg-green-500/5',
    },
    {
      label: 'Outstanding Revenue',
      value: currencyFormatter.format(analytics.pendingRevenue),
      detail: `${analytics.pendingBookings} pending bookings`,
      tone: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    },
    {
      label: 'Attendance Rate',
      value: `${analytics.attendanceRate}%`,
      detail: `${analytics.attendanceCounts.PRESENT + analytics.attendanceCounts.LATE} of ${attendance.length} marked present/late`,
      tone: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    },
    {
      label: 'Active Programs',
      value: String(stats.activePrograms),
      detail: `${stats.totalPrograms} total programs`,
      tone: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
    },
  ]

  const attendanceMix = [
    { label: 'Present', value: analytics.attendanceCounts.PRESENT, tone: 'text-green-400' },
    { label: 'Late', value: analytics.attendanceCounts.LATE, tone: 'text-amber-400' },
    { label: 'Absent', value: analytics.attendanceCounts.ABSENT, tone: 'text-red-400' },
  ]

  const roleMix = [
    { label: 'Admins', value: stats.usersWithRoleAdmin, tone: 'text-amber-400' },
    { label: 'Coaches', value: stats.usersWithRoleCoach, tone: 'text-blue-400' },
    { label: 'Players', value: stats.totalPlayers, tone: 'text-green-400' },
    { label: 'Families', value: stats.totalFamilies ?? 0, tone: 'text-purple-400' },
  ]

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-gray-800 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.12),_transparent_40%),_#111111] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-400">Reports</p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
          Track bookings, attendance, and launch performance.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-400 sm:text-base">
          This analytics view uses current admin data to highlight booking momentum, estimated paid
          revenue, program demand, and the current month&apos;s attendance performance.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-2xl border p-5 ${card.tone}`}>
            <p className="text-sm text-gray-400">{card.label}</p>
            <p className="mt-2 text-3xl font-black text-white">{card.value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500">{card.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-black text-white">Booking Trend</h2>
            <p className="text-sm text-gray-400">Last 90 days of bookings created.</p>
          </div>

          {bookingTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={bookingTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickFormatter={(value: string) => value.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                  labelStyle={{ color: '#d1d5db' }}
                  itemStyle={{ color: '#22c55e' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="No booking trend data"
              description="Booking trend data is not available right now."
            />
          )}
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-black text-white">Attendance Mix</h2>
            <p className="text-sm text-gray-400">Current month attendance records.</p>
          </div>

          <div className="space-y-4">
            {attendanceMix.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-gray-800 bg-[#111] px-4 py-3"
              >
                <span className="text-sm text-gray-300">{item.label}</span>
                <span className={`text-2xl font-black ${item.tone}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-black text-white">Program Popularity</h2>
            <p className="text-sm text-gray-400">Top programs by total bookings.</p>
          </div>

          {analytics.topPrograms.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topPrograms} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={70} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                  labelStyle={{ color: '#d1d5db' }}
                />
                <Bar dataKey="bookings" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="No booking data yet"
              description="Program popularity will appear once bookings start coming in."
            />
          )}
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-black text-white">Account Mix</h2>
            <p className="text-sm text-gray-400">Current role and family coverage.</p>
          </div>

          <div className="space-y-3">
            {roleMix.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-gray-800 bg-[#111] px-4 py-3"
              >
                <span className="text-sm text-gray-300">{item.label}</span>
                <span className={`text-xl font-black ${item.tone}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-black text-white">Top Programs</h2>
          <p className="text-sm text-gray-400">Bookings volume with estimated paid revenue by program.</p>
        </div>

        {analytics.topPrograms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left font-medium text-gray-400">Program</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-400">Bookings</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-400">Estimated Paid Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topPrograms.map((program) => (
                  <tr key={program.name} className="border-b border-gray-800/60">
                    <td className="px-4 py-3 text-white">{program.name}</td>
                    <td className="px-4 py-3 text-gray-300">{program.bookings}</td>
                    <td className="px-4 py-3 text-green-400">
                      {currencyFormatter.format(program.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No programs to report" description="Program analytics will appear once data is available." />
        )}
      </section>
    </div>
  )
}

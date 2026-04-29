import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getAdminDashboard, getBookingsOverTime } from '../../services/api'
import type { AdminDashboard } from '../../types'
import PageSkeleton from '../../components/PageSkeleton'

const LoadingSpinner = () => <PageSkeleton titleWidthClassName="w-44" count={6} />

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboard | null>(null)
  const [chartData, setChartData] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    document.title = 'Admin Dashboard | Kante Elite Training'
    return () => {
      document.title = 'Kante Elite Training'
    }
  }, [])

  useEffect(() => {
    Promise.all([getAdminDashboard(), getBookingsOverTime(30)])
      .then(([dashboardData, timeData]) => {
        setStats(dashboardData)
        setChartData(timeData)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  if (error || !stats) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="mb-1 font-semibold text-red-400">Could not load dashboard</p>
        <p className="text-sm text-gray-500">Please refresh the page to try again.</p>
      </div>
    )
  }

  const operationsCards = [
    { label: 'Total Bookings', value: stats.totalBookings, color: 'text-green-400', link: '/admin/bookings' },
    { label: 'Pending Bookings', value: stats.pendingBookings, color: 'text-yellow-400', link: '/admin/bookings' },
    { label: 'Unread Messages', value: stats.unreadMessages, color: 'text-pink-400', link: '/admin/messages' },
    { label: 'Pending Team Registrations', value: stats.pendingRegistrations ?? 0, color: 'text-amber-500', link: '/admin/tournaments' },
  ]

  const contentCards = [
    { label: 'Programs', value: `${stats.activePrograms} active`, detail: `${stats.totalPrograms} total`, link: '/admin/programs' },
    { label: 'Events', value: stats.totalEvents, detail: 'Live event management', link: '/admin/events' },
    { label: 'Tournaments', value: stats.totalTournaments, detail: 'Registration + workflow', link: '/admin/tournaments' },
    { label: 'Users', value: stats.totalUsers, detail: 'Accounts on platform', link: '/admin/users' },
  ]

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-gray-800 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.12),_transparent_40%),_#111111] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-500">
              Launch Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Run bookings, content, and tournaments from one place.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-400 sm:text-base">
              This admin view is trimmed to the daily operating tools Kante Elite needs at launch:
              bookings, schedule control, events, tournaments, website content, messages, and account management.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              to="/admin/programs?create=1"
              className="rounded-2xl bg-amber-500 px-4 py-3 text-center text-sm font-bold text-black hover:bg-amber-400"
            >
              Add Program
            </Link>
            <Link
              to="/admin/events?create=1"
              className="rounded-2xl bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
            >
              Add Event
            </Link>
            <Link
              to="/admin/tournaments"
              className="rounded-2xl bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
            >
              Open Tournaments
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white">Operations Snapshot</h2>
            <p className="text-sm text-gray-400">Keep an eye on the work that affects customers today.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {operationsCards.map((card) => (
            <Link
              key={card.label}
              to={card.link}
              className="rounded-2xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700"
            >
              <p className="mb-2 text-sm text-gray-400">{card.label}</p>
              <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-black text-white">Business Areas</h2>
          <p className="text-sm text-gray-400">The primary systems that should stay current before launch.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {contentCards.map((card) => (
            <Link
              key={card.label}
              to={card.link}
              className="rounded-2xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700"
            >
              <p className="text-sm text-gray-400">{card.label}</p>
              <p className="mt-2 text-2xl font-black text-white">{card.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-500">{card.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      {chartData.length > 0 ? (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-black text-white">Booking Trend</h2>
            <p className="text-sm text-gray-400">Last 30 days of booking volume.</p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}
    </div>
  )
}

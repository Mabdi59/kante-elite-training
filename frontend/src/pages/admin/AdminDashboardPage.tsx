import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboard } from '../../services/api'
import type { AdminDashboard } from '../../types'
import PageSkeleton from '../../components/PageSkeleton'

const LoadingSpinner = (_props: { label?: string }) => <PageSkeleton titleWidthClassName="w-44" count={6} />

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getAdminDashboard()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Loading dashboard…" />

  if (error || !stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400 font-semibold mb-1">Could not load dashboard</p>
        <p className="text-gray-500 text-sm">Please refresh the page to try again.</p>
      </div>
    )
  }

  const primaryCards = [
    { label: 'Total Bookings', value: stats.totalBookings, color: 'text-green-400', link: '/admin/bookings' },
    { label: 'Confirmed', value: stats.confirmedBookings, color: 'text-blue-400', link: '/admin/bookings' },
    { label: 'Pending', value: stats.pendingBookings, color: 'text-yellow-400', link: '/admin/bookings' },
    { label: 'Cancelled', value: stats.cancelledBookings, color: 'text-red-400', link: '/admin/bookings' },
    { label: 'Programs (Active / Total)', value: `${stats.activePrograms} / ${stats.totalPrograms}`, color: 'text-purple-400', link: '/admin/programs' },
    { label: 'Events', value: stats.totalEvents, color: 'text-orange-400', link: '/admin/events' },
    { label: 'Tournaments', value: stats.totalTournaments, color: 'text-cyan-400', link: '/admin/tournaments' },
    { label: 'Unread Messages', value: stats.unreadMessages, color: 'text-pink-400', link: '/admin/messages' },
    { label: 'Total Users', value: stats.totalUsers, color: 'text-indigo-400', link: '/admin/users' },
  ]

  const roleCards = [
    { label: 'Active Coaches', value: stats.totalCoaches ?? 0, color: 'text-blue-400', link: '/admin/coaches' },
    { label: 'Player Profiles', value: stats.totalPlayers ?? 0, color: 'text-green-400', link: '/admin/players' },
    { label: 'Pending Registrations', value: stats.pendingRegistrations ?? 0, color: 'text-yellow-400', link: '/admin/tournaments' },
    { label: 'Admin Users', value: stats.usersWithRoleAdmin ?? 0, color: 'text-red-400', link: '/admin/users' },
    { label: 'Coach Users', value: stats.usersWithRoleCoach ?? 0, color: 'text-blue-300', link: '/admin/users' },
    { label: 'Regular Users', value: stats.usersWithRoleUser ?? 0, color: 'text-gray-300', link: '/admin/users' },
  ]

  return (
    <div>
      <div className="panel-header">
        <h1 className="text-2xl font-black text-white sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          Track bookings, roles, and platform activity across every admin area.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link to="/admin/media" className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-center text-sm font-bold text-black hover:bg-cyan-400 sm:w-auto">
            Add Post
          </Link>
          <Link to="/admin/programs?create=1" className="w-full rounded-xl bg-gray-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-gray-700 sm:w-auto">
            Add Program
          </Link>
          <Link to="/admin/events?create=1" className="w-full rounded-xl bg-gray-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-gray-700 sm:w-auto">
            Add Event
          </Link>
        </div>
      </div>

      <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">Bookings &amp; Content</h2>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {primaryCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="rounded-xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-600 sm:p-6"
          >
            <p className="text-gray-400 text-sm mb-2">{card.label}</p>
            <p className={`text-3xl font-black sm:text-4xl ${card.color}`}>{card.value}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">People &amp; Roles</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {roleCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="rounded-xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-600 sm:p-6"
          >
            <p className="text-gray-400 text-sm mb-2">{card.label}</p>
            <p className={`text-3xl font-black sm:text-4xl ${card.color}`}>{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

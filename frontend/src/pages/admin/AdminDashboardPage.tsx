import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboard } from '../../services/api'
import type { AdminDashboard } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'

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
      <h1 className="text-white text-3xl font-black mb-8">Dashboard</h1>

      <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">Bookings &amp; Content</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {primaryCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-colors"
          >
            <p className="text-gray-400 text-sm mb-2">{card.label}</p>
            <p className={`text-4xl font-black ${card.color}`}>{card.value}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">People &amp; Roles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roleCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-colors"
          >
            <p className="text-gray-400 text-sm mb-2">{card.label}</p>
            <p className={`text-4xl font-black ${card.color}`}>{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

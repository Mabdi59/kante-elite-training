import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboard } from '../../services/api'
import type { AdminDashboard } from '../../types'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminDashboard()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-gray-400">Loading dashboard…</div>
  }

  if (!stats) {
    return <div className="text-red-400">Failed to load dashboard data.</div>
  }

  const cards = [
    { label: 'Total Bookings', value: stats.totalBookings, color: 'text-green-400', link: '/admin/bookings' },
    { label: 'Confirmed', value: stats.confirmedBookings, color: 'text-blue-400', link: '/admin/bookings' },
    { label: 'Pending', value: stats.pendingBookings, color: 'text-yellow-400', link: '/admin/bookings' },
    { label: 'Cancelled', value: stats.cancelledBookings, color: 'text-red-400', link: '/admin/bookings' },
    { label: 'Programs', value: stats.activePrograms + ' / ' + stats.totalPrograms, color: 'text-purple-400', link: '/admin/programs' },
    { label: 'Events', value: stats.totalEvents, color: 'text-orange-400', link: '/admin/events' },
    { label: 'Tournaments', value: stats.totalTournaments, color: 'text-cyan-400', link: '/admin/tournaments' },
    { label: 'Unread Messages', value: stats.unreadMessages, color: 'text-pink-400', link: '/admin/messages' },
    { label: 'Users', value: stats.totalUsers, color: 'text-indigo-400', link: '/admin/users' },
  ]

  return (
    <div>
      <h1 className="text-white text-3xl font-black mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
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

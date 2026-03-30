import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStaffDashboard } from '../../services/api'
import type { StaffDashboard } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<StaffDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getStaffDashboard()
      .then(setStats)
      .catch(() => setError('Could not load the staff dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Loading dashboard..." />

  if (!stats) {
    return <ErrorBanner message={error || 'Could not load the staff dashboard.'} />
  }

  const cards = [
    { label: 'Total Bookings', value: stats.totalBookings, color: 'text-blue-400', link: '/staff/bookings' },
    { label: 'Today', value: stats.todayBookings, color: 'text-green-400', link: '/staff/bookings' },
    { label: 'Upcoming', value: stats.upcomingBookings, color: 'text-cyan-400', link: '/staff/bookings' },
    { label: 'Confirmed', value: stats.confirmedBookings, color: 'text-emerald-400', link: '/staff/bookings' },
    { label: 'Unread Messages', value: stats.unreadMessages, color: 'text-pink-400', link: '/staff/messages' },
    { label: 'Blocked Slots', value: stats.blockedSlots, color: 'text-red-400', link: '/staff/availability' },
    { label: 'Pending Registrations', value: stats.pendingRegistrations, color: 'text-yellow-400', link: '/staff/tournaments' },
    { label: 'Players', value: stats.totalPlayers, color: 'text-violet-400', link: '/staff/players' },
    { label: 'Tournaments', value: stats.totalTournaments, color: 'text-orange-400', link: '/staff/tournaments' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Operations Dashboard</h1>
          <p className="text-gray-400 text-sm mt-2">
            Manage bookings, messages, availability, and registration support from one place.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            to="/staff/bookings"
            className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-4 py-2 rounded-lg"
          >
            Open Bookings
          </Link>
          <Link
            to="/staff/messages"
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            View Messages
          </Link>
        </div>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

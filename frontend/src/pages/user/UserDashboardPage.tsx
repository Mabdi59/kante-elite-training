import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyBookings, getMyPlayers } from '../../services/api'
import type { Booking, PlayerProfile } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'

export default function UserDashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getMyBookings(), getMyPlayers()])
      .then(([bookingData, playerData]) => {
        setBookings(bookingData)
        setPlayers(playerData)
      })
      .catch(() => setError('Could not load your account dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const upcomingBookings = bookings.filter(
    (booking) => booking.bookingDate >= today && booking.bookingStatus !== 'CANCELLED',
  )
  const pastBookings = bookings.filter(
    (booking) => booking.bookingDate < today || booking.bookingStatus === 'CANCELLED',
  )

  if (loading) return <LoadingSpinner label="Loading dashboard..." />

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Account Dashboard</h1>
          <p className="text-gray-400 text-sm mt-2">
            Welcome back, {user?.name}. Manage your bookings and keep your player details up to date in one place.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            to="/book"
            className="bg-teal-500 hover:bg-teal-400 text-black text-sm font-bold px-4 py-2 rounded-lg"
          >
            Book a Session
          </Link>
          <Link
            to="/user/players"
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Manage Players
          </Link>
        </div>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/user/bookings"
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-colors"
        >
          <p className="text-gray-400 text-sm mb-2">Upcoming Sessions</p>
          <p className="text-4xl font-black text-teal-400">{upcomingBookings.length}</p>
        </Link>
        <Link
          to="/user/players"
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-colors"
        >
          <p className="text-gray-400 text-sm mb-2">Player Profiles</p>
          <p className="text-4xl font-black text-blue-400">{players.length}</p>
        </Link>
        <Link
          to="/user/bookings"
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-colors"
        >
          <p className="text-gray-400 text-sm mb-2">Past or Cancelled</p>
          <p className="text-4xl font-black text-gray-400">{pastBookings.length}</p>
        </Link>
      </div>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Upcoming Sessions</h2>
          <Link to="/user/bookings" className="text-teal-400 hover:text-teal-300 text-sm">
            View All
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming sessions yet.</p>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-4 bg-gray-800 rounded-lg p-4"
              >
                <div>
                  <p className="text-white font-medium">{booking.playerName}</p>
                  <p className="text-gray-400 text-sm">
                    {booking.programName}, {booking.bookingDate} at {booking.bookingTime}
                  </p>
                </div>
                <StatusBadge status={booking.bookingStatus} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Player Profiles</h2>
          <Link to="/user/players" className="text-teal-400 hover:text-teal-300 text-sm">
            Manage
          </Link>
        </div>

        {players.length === 0 ? (
          <p className="text-gray-500 text-sm">Add a player profile to make booking easier.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {players.slice(0, 4).map((player) => (
              <div key={player.id} className="bg-gray-800 rounded-lg p-4">
                <p className="text-white font-medium">{player.name}</p>
                <p className="text-gray-400 text-sm">
                  {player.age ? `Age ${player.age}` : 'Age not set'}
                  {player.preferredPosition ? `, ${player.preferredPosition}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

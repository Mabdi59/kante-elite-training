import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyBookings, getMyPlayers } from '../../services/api'
import type { Booking, PlayerProfile } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'

export default function ParentDashboardPage() {
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
      .catch(() => setError('Could not load your parent dashboard.'))
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
          <h1 className="text-white text-3xl font-black">Parent Dashboard</h1>
          <p className="text-gray-400 text-sm mt-2">
            Welcome back, {user?.name}. Keep track of players and upcoming sessions in one place.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/book" className="btn-primary text-sm">Book a Session</Link>
          <Link to="/parent/players" className="btn-secondary text-sm">Manage Players</Link>
        </div>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/parent/bookings" className="bg-[#111] border border-[#222] hover:border-amber-500/30 rounded-xl p-6 transition-all">
          <p className="text-gray-400 text-sm mb-2">Upcoming Sessions</p>
          <p className="text-4xl font-black text-amber-500">{upcomingBookings.length}</p>
        </Link>
        <Link to="/parent/players" className="bg-[#111] border border-[#222] hover:border-amber-500/30 rounded-xl p-6 transition-all">
          <p className="text-gray-400 text-sm mb-2">Player Profiles</p>
          <p className="text-4xl font-black text-white">{players.length}</p>
        </Link>
        <Link to="/parent/bookings" className="bg-[#111] border border-[#222] hover:border-amber-500/30 rounded-xl p-6 transition-all">
          <p className="text-gray-400 text-sm mb-2">Past or Cancelled</p>
          <p className="text-4xl font-black text-gray-400">{pastBookings.length}</p>
        </Link>
      </div>

      <section className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Upcoming Sessions</h2>
          <Link to="/parent/bookings" className="text-amber-500 hover:text-amber-400 text-sm">View All</Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming sessions yet.</p>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between gap-4 bg-[#1a1a1a] rounded-lg p-4">
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

      <section className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Player Profiles</h2>
          <Link to="/parent/players" className="text-amber-500 hover:text-amber-400 text-sm">Manage</Link>
        </div>

        {players.length === 0 ? (
          <p className="text-gray-500 text-sm">Add a player profile to make booking easier.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {players.slice(0, 4).map((player) => (
              <div key={player.id} className="bg-[#1a1a1a] rounded-lg p-4">
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

      <section className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Recurring Training Schedule</h2>
          <Link to="/calendar" className="text-amber-500 hover:text-amber-400 text-sm">View Full Calendar</Link>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
            <svg className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M8 2v4M16 2v4" />
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm max-w-xs">
            Your recurring training schedules will appear here once set up by your academy.
          </p>
          <Link to="/calendar" className="btn-secondary text-sm">
            View Calendar
          </Link>
        </div>
      </section>
    </div>
  )
}

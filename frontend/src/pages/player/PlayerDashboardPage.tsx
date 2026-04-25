import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyBookings, getMyPlayers } from '../../services/api'
import type { Booking, PlayerProfile } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'

export default function PlayerDashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    document.title = 'Player Dashboard | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    Promise.all([getMyBookings(), getMyPlayers()])
      .then(([bookingData, playerData]) => {
        setBookings(bookingData)
        setPlayers(playerData)
      })
      .catch(() => setError('Could not load your player dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const upcomingBookings = bookings.filter(
    (booking) => booking.bookingDate >= today && booking.bookingStatus !== 'CANCELLED',
  )
  const completedBookings = bookings.filter((booking) => booking.bookingStatus === 'COMPLETED')
  const primaryProfile = players[0] ?? null

  if (loading) return <LoadingSpinner label="Loading dashboard..." />

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Player Dashboard</h1>
          <p className="text-gray-400 text-sm mt-2">
            Welcome back, {user?.name}. Track your sessions, keep your profile current, and stay ready for training.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/book" className="btn-primary text-sm">Book a Session</Link>
          <Link to="/player/profile" className="btn-secondary text-sm">Edit Profile</Link>
        </div>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/player/sessions" className="bg-[#111] border border-[#222] hover:border-amber-500/30 rounded-xl p-6 transition-all">
          <p className="text-gray-400 text-sm mb-2">Upcoming Sessions</p>
          <p className="text-4xl font-black text-amber-500">{upcomingBookings.length}</p>
        </Link>
        <Link to="/player/profile" className="bg-[#111] border border-[#222] hover:border-amber-500/30 rounded-xl p-6 transition-all">
          <p className="text-gray-400 text-sm mb-2">Profile Status</p>
          <p className="text-4xl font-black text-white">{primaryProfile ? 'Ready' : 'Set Up'}</p>
        </Link>
        <Link to="/player/sessions" className="bg-[#111] border border-[#222] hover:border-amber-500/30 rounded-xl p-6 transition-all">
          <p className="text-gray-400 text-sm mb-2">Completed Sessions</p>
          <p className="text-4xl font-black text-gray-400">{completedBookings.length}</p>
        </Link>
      </div>

      <section className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Your Profile</h2>
          <Link to="/player/profile" className="text-amber-500 hover:text-amber-400 text-sm">Manage</Link>
        </div>

        {!primaryProfile ? (
          <p className="text-gray-500 text-sm">Set up your player profile to keep your training details organized.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Player Name', value: primaryProfile.name },
              { label: 'Skill Level', value: primaryProfile.skillLevel || 'Not set' },
              { label: 'Preferred Position', value: primaryProfile.preferredPosition || 'Not set' },
              { label: 'Age', value: primaryProfile.age ? String(primaryProfile.age) : 'Not set' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#1a1a1a] rounded-lg p-4">
                <p className="text-gray-500 mb-1">{label}</p>
                <p className="text-white font-medium">{value}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Upcoming Sessions</h2>
          <Link to="/player/sessions" className="text-amber-500 hover:text-amber-400 text-sm">View All</Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming sessions yet.</p>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between gap-4 bg-[#1a1a1a] rounded-lg p-4">
                <div>
                  <p className="text-white font-medium">{booking.programName}</p>
                  <p className="text-gray-400 text-sm">{booking.bookingDate} at {booking.bookingTime}</p>
                </div>
                <StatusBadge status={booking.bookingStatus} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

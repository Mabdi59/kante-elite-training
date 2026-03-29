import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyBookings, cancelMyBooking } from '../services/api'
import type { Booking } from '../types'

const statusColor: Record<string, string> = {
  CONFIRMED: 'text-green-400 bg-green-500/10 border-green-500/30',
  RESERVED: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  CANCELLED: 'text-red-400 bg-red-500/10 border-red-500/30',
  COMPLETED: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
}

export default function AccountPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this booking?')) return
    setCancelling(id)
    try {
      const updated = await cancelMyBooking(id)
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)))
    } catch {
      alert('Failed to cancel booking. Please try again.')
    } finally {
      setCancelling(null)
    }
  }

  const now = new Date()
  const upcoming = bookings.filter(
    (b) =>
      b.bookingStatus !== 'CANCELLED' && new Date(b.bookingDate) >= now,
  )
  const past = bookings.filter(
    (b) =>
      b.bookingStatus === 'CANCELLED' || new Date(b.bookingDate) < now,
  )

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-black text-white tracking-wider">
          KANTÉ ELITE
        </Link>
        <Link to="/" className="text-gray-400 text-sm hover:text-white transition-colors">
          ← Back to site
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Welcome banner */}
        <div className="mb-8">
          <h1 className="text-white text-4xl font-black mb-1">My Account</h1>
          <p className="text-gray-400">
            Welcome back, <span className="text-green-400 font-semibold">{user?.name}</span>
          </p>
          <p className="text-gray-600 text-sm">{user?.email}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-400">Loading your bookings…</div>
        ) : (
          <>
            {/* Upcoming sessions */}
            <section className="mb-10">
              <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <span>📅</span> Upcoming Sessions ({upcoming.length})
              </h2>
              {upcoming.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                  <p className="text-gray-500 mb-4">No upcoming sessions booked.</p>
                  <Link to="/book" className="btn-primary text-sm">
                    Book a Session
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((b) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      cancelling={cancelling}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Past / cancelled */}
            {past.length > 0 && (
              <section>
                <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🗂️</span> Past & Cancelled
                </h2>
                <div className="space-y-3">
                  {past.map((b) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      cancelling={cancelling}
                      onCancel={handleCancel}
                      muted
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function BookingCard({
  booking: b,
  cancelling,
  onCancel,
  muted = false,
}: {
  booking: Booking
  cancelling: number | null
  onCancel: (id: number) => void
  muted?: boolean
}) {
  const canCancel = b.bookingStatus !== 'CANCELLED' && b.bookingStatus !== 'COMPLETED'
  const statusCls = statusColor[b.bookingStatus] ?? 'text-gray-400 bg-gray-800 border-gray-700'

  return (
    <div
      className={`bg-gray-900 border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${muted ? 'opacity-60' : 'border-gray-800'}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <span className="text-white font-bold">{b.programName}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusCls}`}>
            {b.bookingStatus}
          </span>
        </div>
        <p className="text-gray-400 text-sm">
          {b.bookingDate} · {b.bookingTime}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Player: {b.playerName}
          {b.parentName ? ` · Parent: ${b.parentName}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {canCancel && (
          <button
            onClick={() => onCancel(b.id)}
            disabled={cancelling === b.id}
            className="text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
          </button>
        )}
        <Link
          to="/book"
          className="text-sm text-green-400 border border-green-400/30 hover:bg-green-400/10 rounded-lg px-4 py-2 transition-colors"
        >
          Book again
        </Link>
      </div>
    </div>
  )
}

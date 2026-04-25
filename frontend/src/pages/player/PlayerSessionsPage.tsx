import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelMyBooking, getMyBookings } from '../../services/api'
import type { Booking } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'

type BookingFilter = 'upcoming' | 'past' | 'all'

export default function PlayerSessionsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [filter, setFilter] = useState<BookingFilter>('upcoming')

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch(() => setError('Could not load your sessions.'))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'upcoming') {
      return booking.bookingDate >= today && booking.bookingStatus !== 'CANCELLED'
    }
    if (filter === 'past') {
      return booking.bookingDate < today || booking.bookingStatus === 'CANCELLED'
    }
    return true
  })

  const handleCancel = async (bookingId: number) => {
    if (!window.confirm('Cancel this session?')) return

    setCancellingId(bookingId)
    try {
      const updated = await cancelMyBooking(bookingId)
      setBookings((current) => current.map((booking) => (booking.id === bookingId ? updated : booking)))
    } catch {
      setError('Could not cancel that session. Please try again.')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading sessions..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Sessions</h1>
          <p className="text-gray-400 text-sm mt-2">
            Review upcoming training, check past sessions, and manage schedule changes.
          </p>
        </div>
        <Link
          to="/book"
          className="btn-primary text-sm"
        >
          Book a Session
        </Link>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      <div className="flex gap-2">
        {(['upcoming', 'past', 'all'] as const).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === value
                ? 'bg-amber-500 text-black'
                : 'border border-[#333] text-gray-400 hover:text-white'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState
          icon="S"
          title="No sessions found"
          description={filter === 'upcoming' ? 'You do not have any upcoming sessions yet.' : 'No sessions match this view.'}
          action={
            <Link to="/book" className="btn-primary">
              Book a Session
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const canCancel =
              booking.bookingStatus !== 'CANCELLED' && booking.bookingStatus !== 'COMPLETED'

            return (
              <div key={booking.id} className="bg-[#111] border border-[#222] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <p className="text-white font-semibold">{booking.programName}</p>
                      <StatusBadge status={booking.bookingStatus} />
                    </div>
                    <p className="text-gray-400 text-sm">
                      {booking.bookingDate} at {booking.bookingTime}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">Player: {booking.playerName}</p>
                    {booking.notes ? (
                      <p className="text-gray-500 text-sm mt-2 italic">Notes: {booking.notes}</p>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    {canCancel ? (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 rounded-lg px-4 py-2 disabled:opacity-50"
                      >
                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    ) : null}
                    <Link
                      to="/book"
                      className="text-sm text-amber-500 border border-amber-500/20 hover:bg-amber-500/10 rounded-lg px-4 py-2"
                    >
                      Book Again
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

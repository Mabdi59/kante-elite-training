import { useEffect, useState } from 'react'
import { useLocation, useSearchParams, Link } from 'react-router-dom'
import api from '../services/api'
import type { ApiResponse, Booking } from '../types'
import { useAuth } from '../context/AuthContext'

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function BookingSuccessPage() {
  const { user } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const bookingId = Number(searchParams.get('booking_id'))
  const locationBooking = (location.state as { booking?: Booking } | null)?.booking ?? null
  const [booking, setBooking] = useState<Booking | null>(locationBooking)
  const [loading, setLoading] = useState(locationBooking === null)
  const [error, setError] = useState('')
  const portalPath =
    user?.role === 'ADMIN'
      ? '/admin'
      : user?.role === 'STAFF'
        ? '/staff'
        : user?.role === 'COACH'
          ? '/coach'
          : user?.role === 'TEAM_CAPTAIN'
            ? '/captain'
          : user?.role === 'PLAYER'
            ? '/player'
            : user?.role === 'PARENT'
              ? '/parent'
              : user?.role === 'USER'
                ? '/user'
              : null
  const portalLabel =
    user?.role === 'PLAYER'
      ? 'Back to Player Portal'
      : user?.role === 'PARENT'
        ? 'Back to Parent Portal'
        : user?.role === 'USER'
          ? 'Back to Account Portal'
        : user?.role === 'COACH'
          ? 'Back to Coach Panel'
          : user?.role === 'TEAM_CAPTAIN'
            ? 'Back to Captain Portal'
          : user?.role === 'STAFF'
            ? 'Back to Staff Panel'
            : user?.role === 'ADMIN'
              ? 'Back to Admin Panel'
              : ''

  useEffect(() => {
    if (locationBooking) {
      setBooking(locationBooking)
      setLoading(false)
      return
    }

    if (Number.isFinite(bookingId) && bookingId > 0) {
      api.get<ApiResponse<Booking>>(`/bookings/${bookingId}`)
        .then((res) => {
          const nextBooking = res.data.data ?? null
          setBooking(nextBooking)
          if (!nextBooking) {
            setError('We could not find that booking confirmation.')
          }
        })
        .catch(() =>
          setError(
            'We could not retrieve your booking details right now. Please check your email for confirmation or contact us directly.',
          ),
        )
        .finally(() => setLoading(false))
      return
    }

    setError('No booking confirmation was found.')
    setLoading(false)
  }, [bookingId, locationBooking])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white font-bold text-xl">Confirming your booking...</p>
          <p className="text-gray-400 text-sm mt-2">Just a moment while we finalize everything.</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full card p-10 text-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-white font-black text-2xl mb-3">Booking Details Unavailable</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">{error}</p>
          <p className="text-gray-500 text-xs mb-6">
            If your booking was submitted, a confirmation email was sent to your inbox. If you do not see it within a few minutes, check your spam folder or contact us.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/contact" className="btn-primary text-center">
              Contact Coach Kante
            </Link>
            <Link to="/book" className="btn-secondary text-center">
              Try Booking Again
            </Link>
            {portalPath ? (
              <Link to={portalPath} className="text-sm text-gray-400 hover:text-white text-center">
                {portalLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-4 pt-16 pb-16">
      <div className="max-w-2xl mx-auto">
        {portalPath ? (
          <div className="mb-6">
            <Link
              to={portalPath}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {portalLabel}
            </Link>
          </div>
        ) : null}

        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-amber-500/5 animate-ping" />
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <span className="section-label">Booking Confirmed</span>
          <h1 className="text-white font-black text-4xl md:text-5xl mb-4 leading-tight">
            You&apos;re booked, <span className="gradient-text">{booking.playerName.split(' ')[0]}</span>.
          </h1>
          <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
            Your session is officially on the calendar.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            A confirmation email has been sent to <strong className="text-white">{booking.email}</strong>.
          </p>
        </div>

        <div className="card mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e1e1e] bg-[#111] flex items-center justify-between">
            <div>
              <h2 className="text-white font-black text-base">Booking Summary</h2>
              <p className="text-gray-500 text-xs mt-0.5">Confirmation #{booking.id}</p>
            </div>
            <div className="badge-green">✅ Confirmed</div>
          </div>
          <div className="px-6 py-6 space-y-3.5">
            {([
              ['Program', booking.programName],
              ['Date', formatDate(booking.bookingDate)],
              ['Time', booking.bookingTime],
              ['Player', booking.playerName],
              booking.playerAge ? ['Age Group', booking.playerAge] : null,
              booking.parentName ? ['Parent / Guardian', booking.parentName] : null,
              ['Email', booking.email],
              ['Phone', booking.phone],
            ] as (string[] | null)[])
              .filter((row): row is string[] => row !== null)
              .map(([label, value]) => (
                <div key={label} className="flex justify-between items-start gap-4">
                  <span className="text-gray-500 text-sm flex-shrink-0">{label}</span>
                  <span className="text-white text-sm font-semibold text-right">{value}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-7 mb-6">
          <h3 className="text-white font-black text-base mb-5 flex items-center gap-2">
            <span className="text-amber-500">📋</span>
            Before Your Session
          </h3>
          <ul className="space-y-3">
            {[
              'Arrive 10 minutes early to warm up.',
              'Wear comfortable athletic clothing and cleats.',
              'Bring shin guards and a water bottle.',
              'Bring a ball if you have one. Coach Kante can also provide one.',
              'Come with one or two goals in mind so the session stays focused.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {portalPath ? (
            <Link to={portalPath} className="btn-secondary text-center flex-1">
              Return to Portal
            </Link>
          ) : null}
          <Link to="/training" className="btn-primary text-center flex-1">
            Explore All Programs
          </Link>
          <Link to="/contact" className="btn-secondary text-center flex-1">
            Contact Coach Kante
          </Link>
        </div>

        <p className="text-gray-600 text-xs text-center">
          Need to reschedule? Reply to your confirmation email or{' '}
          <Link to="/contact" className="text-amber-500 hover:underline">
            contact us
          </Link>{' '}
          at least 24 hours before your session.
        </p>
      </div>
    </div>
  )
}

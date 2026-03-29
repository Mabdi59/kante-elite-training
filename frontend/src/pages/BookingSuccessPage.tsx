import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { confirmBooking } from '../services/api'
import type { Booking } from '../types'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setError('No booking session found.')
      setLoading(false)
      return
    }
    confirmBooking(sessionId)
      .then(setBooking)
      .catch(() =>
        setError(
          'We could not retrieve your booking details right now. Please check your email for confirmation or contact us directly.',
        ),
      )
      .finally(() => setLoading(false))
  }, [sessionId])

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
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            {error}
          </p>
          <p className="text-gray-500 text-xs mb-8">
            If your payment was processed, a confirmation email was sent to your inbox. If you don't see it within a few minutes, check your spam folder or contact us.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/contact" className="btn-primary text-center">
              Contact Coach Kante
            </Link>
            <Link to="/book" className="btn-secondary text-center">
              Try Booking Again
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-4 pt-20 pb-20">
      <div className="max-w-2xl mx-auto">

        {/* ── Success header ── */}
        <div className="text-center mb-12">
          {/* Animated checkmark ring */}
          <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-amber-500/5 animate-ping" />
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <span className="section-label">Booking Confirmed</span>
          <h1 className="text-white font-black text-4xl md:text-5xl mb-4 leading-tight">
            You're all set,{' '}
            <span className="gradient-text">
              {booking.playerName.split(' ')[0]}!
            </span>
          </h1>
          <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
            Payment confirmed. Your session is officially booked.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            A confirmation email is on its way to{' '}
            <strong className="text-white">{booking.email}</strong>.
          </p>
        </div>

        {/* ── Booking summary ── */}
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

        {/* ── Before your session ── */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-7 mb-6">
          <h3 className="text-white font-black text-base mb-5 flex items-center gap-2">
            <span className="text-amber-500">📋</span>
            Before Your Session
          </h3>
          <ul className="space-y-3">
            {[
              'Arrive 10 minutes early to warm up',
              'Wear comfortable athletic clothing and cleats',
              'Bring shin guards and a water bottle',
              'Have your own ball if possible — Coach Kante provides them too',
              'Come with specific goals in mind — the more focused, the better the session',
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

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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

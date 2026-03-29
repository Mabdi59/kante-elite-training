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
      .catch(() => setError('We could not retrieve your booking details. Please check your email for confirmation or contact us.'))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white font-bold text-lg">Confirming your booking...</p>
          <p className="text-gray-400 text-sm mt-2">This will only take a moment.</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full card p-10 text-center">
          <div className="text-5xl mb-5">⚠️</div>
          <h2 className="text-white font-black text-2xl mb-3">Unable to Load Booking</h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            {error ||
              'Your payment may have been processed. Please check your email for a confirmation or contact us directly.'}
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/contact" className="btn-primary text-center">
              Contact Us
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
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-amber-500/15 border-2 border-amber-500 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <p className="section-label">Booking Confirmed</p>
          <h1 className="text-white font-black text-4xl md:text-5xl mb-4">
            You're All Set!
          </h1>
          <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
            Your session has been booked and payment confirmed. A confirmation email is on its way
            to <strong className="text-white">{booking.email}</strong>.
          </p>
        </div>

        {/* Booking summary */}
        <div className="card mb-8">
          <div className="px-7 py-5 border-b border-[#222]">
            <h2 className="text-white font-black text-lg">Booking Summary</h2>
            <p className="text-gray-500 text-xs mt-0.5">Confirmation #{booking.id}</p>
          </div>
          <div className="px-7 py-6 space-y-4">
            {[
              ['Program', booking.programName],
              ['Date', formatDate(booking.bookingDate)],
              ['Time', booking.bookingTime],
              ['Player', booking.playerName],
              booking.playerAge ? ['Age Group', booking.playerAge] : null,
              booking.parentName ? ['Parent / Guardian', booking.parentName] : null,
              ['Email', booking.email],
              ['Phone', booking.phone],
              ['Payment Status', '✅ Paid'],
              ['Booking Status', '✅ Confirmed'],
            ]
              .filter((row): row is string[] => row !== null)
              .map(([label, value]) => (
                <div key={label as string} className="flex justify-between items-start gap-4">
                  <span className="text-gray-400 text-sm flex-shrink-0">{label}</span>
                  <span className="text-white text-sm font-semibold text-right">{value}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-[#111111] border border-[#222] rounded-xl p-7 mb-8">
          <h3 className="text-amber-500 font-bold mb-4">📋 Before Your Session</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            {[
              'Arrive 10 minutes early to warm up',
              'Bring cleats, shin guards, and a water bottle',
              'Wear comfortable athletic clothing',
              'Have a ball if possible — Coach Kante will also provide them',
              'Come ready to work hard and have fun',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/training" className="btn-primary text-center flex-1">
            View All Programs
          </Link>
          <Link to="/contact" className="btn-secondary text-center flex-1">
            Contact Coach Kante
          </Link>
        </div>

        <p className="text-gray-600 text-xs text-center mt-8">
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

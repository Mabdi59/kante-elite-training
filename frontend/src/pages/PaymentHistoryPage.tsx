import { useEffect, useState } from 'react'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'

interface Booking {
  id: number
  programName: string
  bookingDate: string
  bookingTime: string
  paymentStatus: string
  bookingStatus: string
  stripeSessionId?: string
  createdAt: string
  playerName: string
  email: string
}

const PAYMENT_COLORS: Record<string, string> = {
  PAID: 'bg-green-500/20 text-green-400 border-green-500/30',
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  REFUNDED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
  SUBMITTED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  NOT_REQUIRED: 'bg-gray-700/40 text-gray-500 border-gray-700/30',
}

export default function PaymentHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios
      .get<Booking[]>('/api/payments/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBookings(res.data))
      .catch(() => setError('Failed to load payment history.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Loading payment history…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Payment History</h1>
        <p className="text-gray-400 mt-1 text-sm">All your bookings and their payment statuses.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!error && bookings.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">💳</div>
          <p className="text-white font-semibold mb-1">No payments yet</p>
          <p className="text-gray-400 text-sm">Your payment history will appear here after you make a booking.</p>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 border-b border-gray-800">
              <tr>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Program</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Time</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Player</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Payment</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Booking Status</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Booked</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-800 bg-gray-950 hover:bg-gray-900 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{b.programName}</td>
                  <td className="px-4 py-3 text-gray-300">{b.bookingDate}</td>
                  <td className="px-4 py-3 text-gray-300">{b.bookingTime}</td>
                  <td className="px-4 py-3 text-gray-300">{b.playerName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        PAYMENT_COLORS[b.paymentStatus] ?? 'bg-gray-700/40 text-gray-400 border-gray-700'
                      }`}
                    >
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        b.bookingStatus === 'CONFIRMED'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : b.bookingStatus === 'CANCELLED'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-gray-700/40 text-gray-400 border-gray-700'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

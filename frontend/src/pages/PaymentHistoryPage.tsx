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
  amountPaid?: number
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
  const [filter, setFilter] = useState<string>('ALL')

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

  const paidCount = bookings.filter(b => b.paymentStatus === 'PAID').length
  const pendingCount = bookings.filter(b => b.paymentStatus === 'PENDING').length
  const refundedCount = bookings.filter(b => b.paymentStatus === 'REFUNDED').length

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.paymentStatus === filter)

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

      {!error && bookings.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Bookings', value: bookings.length, color: 'text-white' },
            { label: 'Paid', value: paidCount, color: 'text-green-400' },
            { label: 'Pending', value: pendingCount, color: 'text-yellow-400' },
            { label: 'Refunded', value: refundedCount, color: 'text-gray-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-zinc-900 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
              <p className={`mt-2 text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
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
        <>
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'PAID', 'PENDING', 'REFUNDED', 'FAILED'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  filter === f
                    ? 'bg-green-600 text-white'
                    : 'border border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 border-b border-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">#</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Program</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Player</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Payment</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Booked</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-gray-800 bg-gray-950 hover:bg-gray-900 transition-colors">
                    <td className="px-4 py-3 text-gray-500 text-xs">#{b.id}</td>
                    <td className="px-4 py-3 text-white font-medium">{b.programName}</td>
                    <td className="px-4 py-3 text-gray-300">
                      <div>{b.bookingDate}</div>
                      <div className="text-xs text-gray-500">{b.bookingTime}</div>
                    </td>
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
                    <td className="px-4 py-3">
                      {b.paymentStatus === 'PAID' && b.stripeSessionId && (
                        <a
                          href={`/api/payments/receipt/${b.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-400 hover:text-green-300 underline"
                        >
                          Receipt
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

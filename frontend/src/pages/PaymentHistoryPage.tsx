import { useEffect, useState } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import { getMyPayments } from '../services/api'
import type { Booking } from '../types'

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
    getMyPayments()
      .then((payments) => setBookings(Array.isArray(payments) ? payments : []))
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
            { label: 'Pending', value: pendingCount, color: 'text-amber-400' },
            { label: 'Refunded', value: refundedCount, color: 'text-gray-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-[#222] bg-[#111] p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
              <p className={`mt-2 text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {!error && bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0f0f0f] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
          </div>
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
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors border ${
                  filter === f
                    ? 'bg-amber-500 text-black border-amber-500'
                    : 'border-[#333] text-gray-400 hover:text-white hover:border-[#555]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#222]">
            <table className="w-full text-sm">
              <thead className="bg-[#0d0d0d] border-b border-[#222]">
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
                  <tr key={b.id} className="border-b border-[#1a1a1a] bg-[#111] hover:bg-[#161616] transition-colors last:border-0">
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
                            ? 'bg-green-500/15 text-green-400 border-green-500/20'
                            : b.bookingStatus === 'CANCELLED'
                            ? 'bg-red-500/15 text-red-400 border-red-500/20'
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
                      {b.stripeSessionId && (
                        <button
                          type="button"
                          title="Click to copy Stripe session ID"
                          onClick={() => {
                            navigator.clipboard.writeText(b.stripeSessionId ?? '').catch(() => {})
                          }}
                          className="text-xs text-gray-500 hover:text-gray-300 font-mono truncate max-w-[6rem] block transition-colors"
                        >
                          {b.stripeSessionId.slice(0, 8)}…
                        </button>
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

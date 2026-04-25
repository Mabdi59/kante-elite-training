import { useEffect, useState } from 'react'
import { getAdminPayments, refundAdminBooking } from '../../services/api'
import type { Booking } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'
import EmptyState from '../../components/EmptyState'

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-green-500/15 text-green-400 border-green-500/20',
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  REFUNDED: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/20',
}

const BOOKING_STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  COMPLETED: 'bg-green-500/15 text-green-400 border-green-500/20',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/20',
  RESERVED: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
}

export default function AdminPaymentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refundingId, setRefundingId] = useState<number | null>(null)
  const [refundSuccess, setRefundSuccess] = useState<number | null>(null)
  const [filterPayment, setFilterPayment] = useState('')
  const [filterSearch, setFilterSearch] = useState('')


  useEffect(() => {
    document.title = 'Payments | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    getAdminPayments()
      .then(setBookings)
      .catch(() => setError('Failed to load payment records.'))
      .finally(() => setLoading(false))
  }, [])

  const handleRefund = async (id: number) => {
    if (!window.confirm('Refund this booking? This cannot be undone.')) return
    setRefundingId(id)
    setError('')
    try {
      const updated = await refundAdminBooking(id)
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)))
      setRefundSuccess(id)
      setTimeout(() => setRefundSuccess(null), 3000)
    } catch {
      setError('Failed to refund booking. Please try again.')
    } finally {
      setRefundingId(null)
    }
  }

  const filtered = bookings.filter((b) => {
    const matchesPayment = !filterPayment || b.paymentStatus === filterPayment
    const q = filterSearch.toLowerCase()
    const matchesSearch =
      !q ||
      b.playerName.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.programName?.toLowerCase().includes(q)
    return matchesPayment && matchesSearch
  })

  const totalPaid = bookings.filter((b) => b.paymentStatus === 'PAID').length
  const totalPending = bookings.filter((b) => b.paymentStatus === 'PENDING').length
  const totalRefunded = bookings.filter((b) => b.paymentStatus === 'REFUNDED').length

  if (loading) return <LoadingSpinner label="Loading payments…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Payments</h1>
        <p className="text-gray-400 mt-1 text-sm">View all booking payment records and issue refunds.</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111] border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-green-400">{totalPaid}</p>
          <p className="text-xs text-gray-400 mt-1">Paid</p>
        </div>
        <div className="bg-[#111] border border-amber-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-amber-400">{totalPending}</p>
          <p className="text-xs text-gray-400 mt-1">Pending</p>
        </div>
        <div className="bg-[#111] border border-gray-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-gray-400">{totalRefunded}</p>
          <p className="text-xs text-gray-400 mt-1">Refunded</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          placeholder="Search player, email, or program…"
          className="flex-1 bg-[#111] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="bg-[#111] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">All Payment Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="REFUNDED">Refunded</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No payments found" description="No bookings match your current filters." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Player</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Program</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Booking</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Payment</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-gray-800/60 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{b.playerName}</p>
                    <p className="text-gray-500 text-xs">{b.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{b.programName}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {b.bookingDate}
                    {b.bookingTime && (
                      <span className="block text-xs text-gray-500">{b.bookingTime}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        BOOKING_STATUS_COLORS[b.bookingStatus] ?? 'bg-gray-700/40 text-gray-400 border-gray-700'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        PAYMENT_STATUS_COLORS[b.paymentStatus] ?? 'bg-gray-700/40 text-gray-400 border-gray-700'
                      }`}
                    >
                      {b.paymentStatus}
                    </span>
                    {refundSuccess === b.id && (
                      <span className="ml-2 text-xs text-green-400">✓ Refunded</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {b.paymentStatus === 'PAID' ? (
                      <button
                        onClick={() => handleRefund(b.id)}
                        disabled={refundingId === b.id}
                        className="text-xs bg-red-700/30 hover:bg-red-700/50 text-red-400 border border-red-700/30 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                      >
                        {refundingId === b.id ? 'Refunding…' : 'Refund'}
                      </button>
                    ) : (
                      <span className="text-gray-600 text-xs">|</span>
                    )}
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

import { useEffect, useState } from 'react'
import { getAdminPayments, refundAdminRegistration } from '../../services/api'
import type { Registration, RegistrationPaymentStatus } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'
import EmptyState from '../../components/EmptyState'

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-green-500/15 text-green-400 border-green-500/20',
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  UNPAID: 'bg-red-500/15 text-red-400 border-red-500/20',
  PARTIALLY_PAID: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  REFUNDED: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  NOT_REQUIRED: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  WAIVED: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
}

const REGISTRATION_STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  COMPLETED: 'bg-green-500/15 text-green-400 border-green-500/20',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/20',
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  WAITLISTED: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
  NO_SHOW: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
}

const paymentStatuses: RegistrationPaymentStatus[] = [
  'NOT_REQUIRED',
  'UNPAID',
  'PENDING',
  'PAID',
  'PARTIALLY_PAID',
  'REFUNDED',
  'WAIVED',
]

function offeringName(registration: Registration) {
  return registration.programName ?? registration.eventTitle ?? 'Kante Elite Training'
}

export default function AdminPaymentsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refundingId, setRefundingId] = useState<number | null>(null)
  const [refundSuccess, setRefundSuccess] = useState<number | null>(null)
  const [filterPayment, setFilterPayment] = useState<RegistrationPaymentStatus | ''>('')
  const [filterSearch, setFilterSearch] = useState('')

  useEffect(() => {
    document.title = 'Payments | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    getAdminPayments()
      .then(setRegistrations)
      .catch(() => setError('Failed to load payment records.'))
      .finally(() => setLoading(false))
  }, [])

  const handleRefund = async (registration: Registration) => {
    if (!window.confirm('Refund this Stripe-backed payment? This cannot be undone.')) return

    setRefundingId(registration.id)
    setError('')
    try {
      const refunded = await refundAdminRegistration(registration.id)
      setRegistrations((prev) =>
        prev.map((item) =>
          item.id === registration.id ? { ...item, ...refunded, paymentStatus: 'REFUNDED' } : item,
        ),
      )
      setRefundSuccess(registration.id)
      setTimeout(() => setRefundSuccess(null), 3000)
    } catch {
      setError('Failed to refund this payment. Please try again.')
    } finally {
      setRefundingId(null)
    }
  }

  const filtered = registrations.filter((registration) => {
    const matchesPayment = !filterPayment || registration.paymentStatus === filterPayment
    const q = filterSearch.toLowerCase()
    const matchesSearch =
      !q ||
      registration.participantName.toLowerCase().includes(q) ||
      registration.guardianEmail.toLowerCase().includes(q) ||
      offeringName(registration).toLowerCase().includes(q) ||
      registration.registrationCode.toLowerCase().includes(q)
    return matchesPayment && matchesSearch
  })

  const totalPaid = registrations.filter((registration) => registration.paymentStatus === 'PAID').length
  const totalPending = registrations.filter((registration) =>
    ['UNPAID', 'PENDING', 'PARTIALLY_PAID'].includes(registration.paymentStatus),
  ).length
  const totalRefunded = registrations.filter((registration) => registration.paymentStatus === 'REFUNDED').length

  if (loading) return <LoadingSpinner label="Loading payments..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Payments</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Registration payment records are the primary ledger for review and refunds.
        </p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111] border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-green-400">{totalPaid}</p>
          <p className="text-xs text-gray-400 mt-1">Paid</p>
        </div>
        <div className="bg-[#111] border border-amber-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-amber-400">{totalPending}</p>
          <p className="text-xs text-gray-400 mt-1">Needs Review</p>
        </div>
        <div className="bg-[#111] border border-gray-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-gray-400">{totalRefunded}</p>
          <p className="text-xs text-gray-400 mt-1">Refunded</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          placeholder="Search player, email, offering, or code..."
          className="flex-1 bg-[#111] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value as RegistrationPaymentStatus | '')}
          className="bg-[#111] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">All Payment Statuses</option>
          {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No payments found" description="No registrations match your current filters." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Registrant</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Offering</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Schedule</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Registration</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Payment</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((registration) => (
                <tr key={registration.id} className="border-b border-gray-800/60 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{registration.participantName}</p>
                    <p className="text-gray-500 text-xs">{registration.guardianEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {offeringName(registration)}
                    {registration.paymentProvider ? (
                      <span className="mt-1 block text-[11px] font-semibold uppercase text-emerald-400">
                        {registration.paymentProvider} payment record
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {registration.scheduledDate ?? 'Unscheduled'}
                    {registration.scheduledStartTime && (
                      <span className="block text-xs text-gray-500">{registration.scheduledStartTime}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        REGISTRATION_STATUS_COLORS[registration.status] ?? 'bg-gray-700/40 text-gray-400 border-gray-700'
                      }`}
                    >
                      {registration.status}
                    </span>
                    <span className="mt-1 block text-[11px] text-gray-600">{registration.registrationCode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        PAYMENT_STATUS_COLORS[registration.paymentStatus] ?? 'bg-gray-700/40 text-gray-400 border-gray-700'
                      }`}
                    >
                      {registration.paymentStatus}
                    </span>
                    {refundSuccess === registration.id && (
                      <span className="ml-2 text-xs text-green-400">Refunded</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {registration.paymentStatus === 'PAID' && registration.paymentRefundable ? (
                      <button
                        onClick={() => handleRefund(registration)}
                        disabled={refundingId === registration.id}
                        className="text-xs bg-red-700/30 hover:bg-red-700/50 text-red-400 border border-red-700/30 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                      >
                        {refundingId === registration.id ? 'Refunding...' : 'Refund'}
                      </button>
                    ) : (
                      <span className="text-gray-600 text-xs">No Stripe action</span>
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

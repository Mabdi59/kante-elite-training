import { useEffect, useState } from 'react'
import axios from 'axios'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

interface Enrollment {
  id: number
  playerName: string
  playerEmail: string
  programName: string
  status: string
  paymentStatus: string
  scheduleType: string
  enrolledAt: string
}

const STATUSES = ['', 'ACTIVE', 'COMPLETED', 'CANCELLED']
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'REFUNDED']

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [updating, setUpdating] = useState<number | null>(null)

  const token = localStorage.getItem('token')

  useEffect(() => {
    axios
      .get('/api/admin/enrollments', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setEnrollments(r.data ?? []))
      .catch(() => setError('Failed to load enrollments.'))
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id)
    try {
      const res = await axios.patch(`/api/admin/enrollments/${id}/status?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEnrollments((prev) => prev.map((e) => (e.id === id ? { ...e, ...res.data, status } : e)))
    } catch {
      setError('Failed to update enrollment status.')
    } finally {
      setUpdating(null)
    }
  }

  const updatePayment = async (id: number, paymentStatus: string) => {
    setUpdating(id)
    try {
      const res = await axios.patch(`/api/admin/enrollments/${id}/payment?paymentStatus=${paymentStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEnrollments((prev) => prev.map((e) => (e.id === id ? { ...e, ...res.data, paymentStatus } : e)))
    } catch {
      setError('Failed to update payment status.')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filterStatus
    ? enrollments.filter((e) => e.status === filterStatus)
    : enrollments

  if (loading) return <LoadingSpinner label="Loading enrollments…" />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Enrollments</h1>
          <p className="mt-1 text-sm text-gray-400">Manage all program enrollments.</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <ErrorBanner message={error} />}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center text-gray-400">
          No enrollments found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-zinc-900">
              <tr>
                {['Player', 'Program', 'Schedule', 'Status', 'Payment', 'Enrolled', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black">
              {filtered.map((en) => (
                <tr key={en.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{en.playerName}</p>
                    <p className="text-xs text-gray-500">{en.playerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{en.programName}</td>
                  <td className="px-4 py-3 text-gray-400">{en.scheduleType}</td>
                  <td className="px-4 py-3">
                    <select
                      value={en.status}
                      onChange={(e) => updateStatus(en.id, e.target.value)}
                      disabled={updating === en.id}
                      className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
                    >
                      {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={en.paymentStatus}
                      onChange={(e) => updatePayment(en.id, e.target.value)}
                      disabled={updating === en.id}
                      className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
                    >
                      {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {en.enrolledAt ? new Date(en.enrolledAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {updating === en.id ? 'Saving…' : ''}
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

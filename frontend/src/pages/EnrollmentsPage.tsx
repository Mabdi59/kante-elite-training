import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

interface Enrollment {
  id: number
  programName: string
  status: string
  paymentStatus?: string
  scheduleType: string
  startDate?: string
  endDate?: string
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400',
  COMPLETED: 'bg-blue-500/20 text-blue-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    axios
      .get('/api/enrollments/my', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setEnrollments(r.data ?? []))
      .catch(() => setError('Failed to load enrollments.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
      <LoadingSpinner label="Loading enrollments…" />
    </div>
  )

  return (
    <div className="min-h-screen bg-black pt-20 pb-16 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">My Enrollments</h1>
            <p className="mt-1 text-sm text-gray-400">Your current and past program enrollments.</p>
          </div>
          <Link to="/training" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
            Browse Programs →
          </Link>
        </div>

        {error && <ErrorBanner message={error} />}

        {enrollments.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center space-y-4">
            <p className="text-gray-400">You are not enrolled in any programs yet.</p>
            <Link to="/training" className="inline-block rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-500">
              Explore Programs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((en) => (
              <div key={en.id} className="rounded-xl border border-white/10 bg-zinc-900 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-white">{en.programName}</h2>
                    <p className="text-sm text-gray-400">{en.scheduleType}</p>
                    {en.startDate && (
                      <p className="text-xs text-gray-500">
                        {en.startDate}{en.endDate ? ` – ${en.endDate}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {en.paymentStatus && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        en.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {en.paymentStatus}
                      </span>
                    )}
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      STATUS_STYLES[en.status] ?? 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {en.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

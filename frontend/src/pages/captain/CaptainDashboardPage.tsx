import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getCaptainDashboard, getCaptainRegistrations } from '../../services/api'
import type { CaptainDashboard, TeamRegistration } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'
import StatusBadge from '../../components/StatusBadge'

export default function CaptainDashboardPage() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<CaptainDashboard | null>(null)
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getCaptainDashboard(), getCaptainRegistrations()])
      .then(([dashboardData, registrationData]) => {
        setDashboard(dashboardData)
        setRegistrations(registrationData)
      })
      .catch(() => setError('Could not load your captain dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Loading dashboard..." />

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Captain Dashboard</h1>
          <p className="text-gray-400 text-sm mt-2">
            Welcome back, {user?.name}. Manage tournament entries, payment, roster updates, and team details from one place.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            to="/captain/tournaments"
            className="bg-orange-500 hover:bg-orange-400 text-black text-sm font-bold px-4 py-2 rounded-lg"
          >
            Register a Team
          </Link>
          <Link
            to="/captain/registrations"
            className="bg-[#1a1a1a] hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Manage Registrations
          </Link>
        </div>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Total Registrations</p>
          <p className="text-4xl font-black text-orange-400">{dashboard?.totalRegistrations ?? 0}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Pending</p>
          <p className="text-4xl font-black text-yellow-400">{dashboard?.pendingRegistrations ?? 0}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Approved</p>
          <p className="text-4xl font-black text-amber-500">{dashboard?.approvedRegistrations ?? 0}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Waitlisted</p>
          <p className="text-4xl font-black text-amber-500">{dashboard?.waitlistedRegistrations ?? 0}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Open Tournaments</p>
          <p className="text-4xl font-black text-white">{dashboard?.availableTournaments ?? 0}</p>
        </div>
      </div>

      <section className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Recent Registrations</h2>
          <Link to="/captain/registrations" className="text-orange-400 hover:text-orange-300 text-sm">
            View All
          </Link>
        </div>

        {registrations.length === 0 ? (
          <p className="text-gray-500 text-sm">No team registrations yet. Start with an upcoming tournament.</p>
        ) : (
          <div className="space-y-3">
            {registrations.slice(0, 5).map((registration) => (
              <div
                key={registration.id}
                className="flex items-center justify-between gap-4 bg-[#1a1a1a] rounded-lg p-4"
              >
                <div>
                  <p className="text-white font-medium">{registration.teamName}</p>
                  <p className="text-gray-400 text-sm">
                    {registration.tournamentName}
                    {registration.tournamentStartDate ? `, ${registration.tournamentStartDate}` : ''}
                  </p>
                </div>
                <StatusBadge status={registration.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

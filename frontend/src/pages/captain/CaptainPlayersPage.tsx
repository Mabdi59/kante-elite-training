import { useEffect, useState } from 'react'
import { getCaptainRegistrations } from '../../services/api'
import type { TeamRegistration } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'
import StatusBadge from '../../components/StatusBadge'

export default function CaptainPlayersPage() {
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    document.title = 'Team Players | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    getCaptainRegistrations()
      .then(setRegistrations)
      .catch(() => setError('Could not load team rosters.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Loading rosters…" />

  return (
    <div className="space-y-8">
      <div className="panel-header">
        <h1 className="text-2xl font-black text-white sm:text-3xl">My Roster</h1>
        <p className="mt-1 text-sm text-gray-400">
          View your registered teams and their player rosters.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      {registrations.length === 0 && !error && (
        <div className="rounded-xl border border-[#222] bg-[#111] p-8 text-center">
          <p className="text-gray-400">No team registrations found.</p>
          <p className="text-sm text-gray-500 mt-1">
            Register a team from the Tournaments page to manage your roster.
          </p>
        </div>
      )}

      {registrations.map((reg) => (
        <div
          key={reg.id}
          className="rounded-xl border border-[#222] bg-[#111] overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-[#222]">
            <div>
              <h2 className="text-white font-bold text-lg">{reg.teamName}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{reg.tournamentName}</p>
            </div>
            <StatusBadge status={reg.status} />
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Captain</p>
                <p className="text-sm text-white mt-0.5">{reg.captainName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Contact</p>
                <p className="text-sm text-white mt-0.5">{reg.contactEmail}</p>
              </div>
              {reg.clubName && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Club</p>
                  <p className="text-sm text-white mt-0.5">{reg.clubName}</p>
                </div>
              )}
            </div>

            {reg.rosterText ? (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                  Submitted Roster
                </p>
                <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-[#1a1a1a] rounded-lg p-4 font-mono leading-relaxed">
                  {reg.rosterText}
                </pre>
                {reg.rosterSubmittedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted: {new Date(reg.rosterSubmittedAt).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-4">
                <p className="text-yellow-400 text-sm font-semibold">Roster not yet submitted</p>
                <p className="text-xs text-gray-400 mt-1">
                  Submit your roster from the Registrations page.
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

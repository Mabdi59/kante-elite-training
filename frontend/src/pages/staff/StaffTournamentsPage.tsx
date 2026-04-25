import { useEffect, useState } from 'react'
import {
  getStaffTournamentRegistrations,
  getStaffTournaments,
  updateStaffRegistrationPaymentStatus,
  updateStaffRegistrationStatus,
} from '../../services/api'
import type { TeamRegistration, Tournament } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'

const REGISTRATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED']
const PAYMENT_STATUSES = ['PENDING', 'SUBMITTED', 'PAID', 'FAILED', 'REFUNDED', 'NOT_REQUIRED']

export default function StaffTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null)
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([])
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)

  useEffect(() => {
    getStaffTournaments()
      .then(setTournaments)
      .catch(() => setError('Could not load tournaments.'))
      .finally(() => setLoading(false))
  }, [])

  const toggleRegistrations = async (tournamentId: number) => {
    if (selectedTournamentId === tournamentId) {
      setSelectedTournamentId(null)
      setRegistrations([])
      return
    }

    setSelectedTournamentId(tournamentId)
    setLoadingRegistrations(true)

    try {
      const records = await getStaffTournamentRegistrations(tournamentId)
      setRegistrations(records)
    } catch {
      setError('Could not load registrations.')
    } finally {
      setLoadingRegistrations(false)
    }
  }

  const handleRegistrationStatusChange = async (registrationId: number, status: string) => {
    try {
      const updated = await updateStaffRegistrationStatus(registrationId, status)
      setRegistrations((current) =>
        current.map((item) => (item.id === registrationId ? updated : item)),
      )
    } catch {
      setError('Could not update registration status.')
    }
  }

  const handleRegistrationPaymentChange = async (registrationId: number, paymentStatus: string) => {
    try {
      const updated = await updateStaffRegistrationPaymentStatus(registrationId, paymentStatus)
      setRegistrations((current) =>
        current.map((item) => (item.id === registrationId ? updated : item)),
      )
    } catch {
      setError('Could not update payment status.')
    }
  }

  if (loading) return <LoadingSpinner label="Loading tournaments..." />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white text-3xl font-black">Tournaments</h1>
        <p className="text-gray-400 text-sm mt-2">
          Review tournament registrations and update approval status for teams.
        </p>
      </div>

      {error ? (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      ) : null}

      {tournaments.length === 0 ? (
        <EmptyState
          icon="T"
          title="No tournaments yet"
          description="Tournaments will appear here once they are available."
        />
      ) : (
        <div className="space-y-4">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="text-white font-bold">{tournament.name}</h3>
                    <StatusBadge status={tournament.status} />
                    {tournament.ageGroup ? (
                      <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                        {tournament.ageGroup}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {tournament.location}, {tournament.startDate}
                    {tournament.endDate ? ` to ${tournament.endDate}` : ''}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {tournament.registeredTeams} / {tournament.maxTeams} teams registered
                    {tournament.registrationDeadline ? `, deadline ${tournament.registrationDeadline}` : ''}
                  </p>
                </div>

                <button
                  onClick={() => toggleRegistrations(tournament.id)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs shrink-0"
                >
                  {selectedTournamentId === tournament.id ? 'Hide Registrations' : 'View Registrations'}
                </button>
              </div>

              {selectedTournamentId === tournament.id ? (
                <div className="border-t border-gray-800 p-5">
                  {loadingRegistrations ? (
                    <LoadingSpinner size="sm" label="Loading registrations..." />
                  ) : registrations.length === 0 ? (
                    <EmptyState icon="R" title="No registrations yet" />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-500 text-left border-b border-gray-800">
                            <th className="pb-2 pr-4">Team</th>
                            <th className="pb-2 pr-4">Captain</th>
                            <th className="pb-2 pr-4">Email</th>
                            <th className="pb-2 pr-4">Status</th>
                            <th className="pb-2 pr-4">Payment</th>
                            <th className="pb-2 pr-4">Roster</th>
                            <th className="pb-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {registrations.map((registration) => (
                            <tr key={registration.id} className="text-gray-300">
                              <td className="py-2 pr-4 font-medium text-white">{registration.teamName}</td>
                              <td className="py-2 pr-4">{registration.captainName}</td>
                              <td className="py-2 pr-4 text-gray-400">{registration.contactEmail}</td>
                              <td className="py-2 pr-4">
                                <StatusBadge status={registration.status} />
                              </td>
                              <td className="py-2 pr-4">
                                {registration.paymentStatus ? (
                                  <StatusBadge status={registration.paymentStatus} />
                                ) : (
                                  <span className="text-gray-500">Pending</span>
                                )}
                              </td>
                              <td className="py-2 pr-4 text-xs text-gray-400">
                                {registration.rosterSubmitted ? 'Submitted' : 'Not yet'}
                                {registration.rosterFileName ? (
                                  <p className="text-gray-500 mt-1">{registration.rosterFileName}</p>
                                ) : null}
                              </td>
                              <td className="py-2">
                                <div className="flex flex-col gap-2">
                                  <select
                                    value={registration.status}
                                    onChange={(event) =>
                                      handleRegistrationStatusChange(registration.id, event.target.value)
                                    }
                                    className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded px-2 py-1 text-xs"
                                  >
                                    {REGISTRATION_STATUSES.map((status) => (
                                      <option key={status} value={status}>
                                        {status}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    value={registration.paymentStatus ?? 'PENDING'}
                                    onChange={(event) =>
                                      handleRegistrationPaymentChange(registration.id, event.target.value)
                                    }
                                    className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded px-2 py-1 text-xs"
                                  >
                                    {PAYMENT_STATUSES.map((status) => (
                                      <option key={status} value={status}>
                                        {status}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

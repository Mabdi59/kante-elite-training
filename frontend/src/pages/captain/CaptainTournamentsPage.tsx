import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createCaptainRegistration, getCaptainRegistrations, getTournaments } from '../../services/api'
import type { TeamRegistration, TeamRegistrationFormData, Tournament } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'
import StatusBadge from '../../components/StatusBadge'
import {
  formatTournamentDate,
  formatTournamentDateRange,
  getTournamentRegistrationState,
} from '../../utils/tournament'

const emptyForm = (
  tournamentId: number,
  captainName = '',
  contactEmail = '',
): TeamRegistrationFormData => ({
  teamName: '',
  captainName,
  contactEmail,
  phone: '',
  clubName: '',
  tournamentId,
})

export default function CaptainTournamentsPage() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([])
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [form, setForm] = useState<TeamRegistrationFormData>(
    emptyForm(0, user?.name ?? '', user?.email ?? ''),
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')


  useEffect(() => {
    document.title = 'Tournaments | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    Promise.all([getTournaments(), getCaptainRegistrations()])
      .then(([tournamentData, registrationData]) => {
        setTournaments(tournamentData)
        setRegistrations(registrationData)
      })
      .catch(() => setError('Could not load tournaments.'))
      .finally(() => setLoading(false))
  }, [])

  const registrationCounts = useMemo(() => {
    return registrations.reduce<Record<number, number>>((acc, registration) => {
      acc[registration.tournamentId] = (acc[registration.tournamentId] ?? 0) + 1
      return acc
    }, {})
  }, [registrations])

  const openRegistration = (tournament: Tournament) => {
    setSelectedTournament(tournament)
    setForm(emptyForm(tournament.id, user?.name ?? '', user?.email ?? ''))
    setError('')
  }

  const closeRegistration = () => {
    setSelectedTournament(null)
    setForm(emptyForm(0, user?.name ?? '', user?.email ?? ''))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const created = await createCaptainRegistration(form)
      setRegistrations((current) => [created, ...current])
      closeRegistration()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not register your team.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading tournaments..." />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Tournaments</h1>
          <p className="text-gray-400 text-sm mt-2">
            Browse upcoming tournaments and register your team when you are ready.
          </p>
        </div>
        <Link
          to="/captain/registrations"
          className="bg-[#1a1a1a] hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          View My Registrations
        </Link>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      {selectedTournament ? (
        <form onSubmit={handleSubmit} className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-white text-xl font-bold">Register for {selectedTournament.name}</h2>
              <p className="text-gray-400 text-sm mt-1">
                Enter your team details. You can manage payment, roster, and updates later from your Team Portal.
              </p>
            </div>
            <button
              type="button"
              onClick={closeRegistration}
              className="text-sm text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Team Name</label>
              <input
                required
                value={form.teamName}
                onChange={(event) => setForm((current) => ({ ...current, teamName: event.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Captain Name</label>
              <input
                required
                value={form.captainName}
                onChange={(event) => setForm((current) => ({ ...current, captainName: event.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Contact Email</label>
              <input
                type="email"
                required
                value={form.contactEmail}
                onChange={(event) => setForm((current) => ({ ...current, contactEmail: event.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Phone</label>
              <input
                value={form.phone ?? ''}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
                placeholder="Optional"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Club Name</label>
              <input
                value={form.clubName ?? ''}
                onChange={(event) => setForm((current) => ({ ...current, clubName: event.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-5 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? 'Registering...' : 'Register Team'}
            </button>
            <button
              type="button"
              onClick={closeRegistration}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tournaments.map((tournament) => {
          const registrationState = getTournamentRegistrationState(tournament)
          const spotsLeft = registrationState.spotsLeft
          const canRegister = registrationState.canRegister
          const ownedCount = registrationCounts[tournament.id] ?? 0

          return (
            <div key={tournament.id} className="bg-[#111] border border-[#222] rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-white font-bold text-lg">{tournament.name}</h3>
                    <StatusBadge status={tournament.status} />
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{tournament.location}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {formatTournamentDateRange(tournament.startDate, tournament.endDate)}
                  </p>
                </div>
                {ownedCount > 0 ? (
                  <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">
                    {ownedCount} registered
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-400 mb-4">
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Age Group</p>
                  <p className="text-white">{tournament.ageGroup || 'Open'}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Division</p>
                  <p className="text-white">{tournament.division || 'Open'}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Teams</p>
                  <p className="text-white">
                    {tournament.registeredTeams} / {tournament.maxTeams}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
                  </p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Deadline</p>
                  <p className={registrationState.isDeadlinePassed ? 'text-red-400' : 'text-white'}>
                    {tournament.registrationDeadline
                      ? formatTournamentDate(tournament.registrationDeadline)
                      : 'Open'}
                  </p>
                </div>
              </div>

              {tournament.description ? (
                <p className="text-gray-500 text-sm mb-4">{tournament.description}</p>
              ) : null}

              {canRegister ? (
                <button
                  onClick={() => openRegistration(tournament)}
                  className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-4 py-2 rounded-lg text-sm"
                >
                  Register a Team
                </button>
              ) : (
                <div className="text-sm text-gray-500">
                  {tournament.status === 'COMPLETED'
                    ? 'Tournament ended.'
                    : tournament.status === 'CANCELLED'
                      ? 'Tournament cancelled.'
                      : registrationState.isDeadlinePassed
                        ? 'Registration closed.'
                        : 'Team spots are full.'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

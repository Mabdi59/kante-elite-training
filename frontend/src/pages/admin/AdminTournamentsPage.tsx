import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteTournament, duplicateTournament, getAdminTournaments } from '../../services/api'
import type { Tournament } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'

export default function AdminTournamentsPage() {
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null)
  const [actionBusyId, setActionBusyId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAdminTournaments()
      setTournaments(data)
      setError('')
    } catch {
      setError('Failed to load tournaments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target
      if (target instanceof Element && target.closest('[data-tournament-actions]')) {
        return
      }
      setOpenActionMenuId(null)
    }

    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [])

  const openCreate = () => {
    navigate('/admin/tournaments/workflow?step=details')
  }

  const openWorkflow = (tournamentId: number) => {
    navigate(`/admin/tournaments/${tournamentId}/workflow?step=teams`)
  }

  const handleDuplicateTournament = async (tournament: Tournament, includeData: boolean) => {
    const confirmed = window.confirm(
      includeData
        ? `Copy ${tournament.name} with teams, players, schedule, and results?`
        : `Copy ${tournament.name} without teams, players, schedule, or results?`,
    )
    if (!confirmed) return

    setActionBusyId(tournament.id)
    setOpenActionMenuId(null)
    try {
      const duplicated = await duplicateTournament(tournament.id, includeData)
      await load()
      navigate(
        `/admin/tournaments/${duplicated.id}/workflow?step=${includeData ? 'teams' : 'details'}`,
      )
    } catch {
      setError(
        includeData
          ? 'Failed to copy tournament with teams.'
          : 'Failed to copy tournament without teams.',
      )
    } finally {
      setActionBusyId(null)
    }
  }

  const handleDeleteTournament = async (tournament: Tournament) => {
    if (!window.confirm(`Delete ${tournament.name}? This cannot be undone.`)) return

    setActionBusyId(tournament.id)
    setOpenActionMenuId(null)
    try {
      await deleteTournament(tournament.id)
      setTournaments((prev) => prev.filter((item) => item.id !== tournament.id))
    } catch {
      setError('Failed to delete tournament.')
    } finally {
      setActionBusyId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading tournaments..." />

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-8 px-8 py-4 mb-6 bg-gray-950/95 backdrop-blur border-b border-gray-900">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-white text-3xl font-black">Tournaments</h1>
            <p className="text-gray-400 text-sm mt-1">
              Open any tournament to manage teams, players, format, schedule, and results in one workflow.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-2.5 rounded-lg text-sm shadow-lg shadow-green-500/10"
          >
            + New Tournament
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      ) : null}

      {tournaments.length === 0 ? (
        <EmptyState
          icon="Trophy"
          title="No tournaments yet"
          description="Create your first tournament to start building the full workflow."
          action={
            <button
              onClick={openCreate}
              className="bg-green-500 text-black font-bold px-5 py-2 rounded-lg text-sm"
            >
              + New Tournament
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              role="button"
              tabIndex={0}
              onClick={() => openWorkflow(tournament.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openWorkflow(tournament.id)
                }
              }}
              className="relative bg-gray-900 border border-gray-800 rounded-xl cursor-pointer hover:border-cyan-500/40 transition-colors"
            >
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
                    {tournament.division ? (
                      <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                        {tournament.division}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {tournament.location}, {tournament.startDate}
                    {tournament.endDate ? ` to ${tournament.endDate}` : ''}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {tournament.registeredTeams} / {tournament.maxTeams} teams registered
                    {tournament.registrationDeadline
                      ? `, deadline ${tournament.registrationDeadline}`
                      : ''}
                    {(tournament.entryFee ?? 0) > 0 ? `, $${tournament.entryFee} entry` : ''}
                  </p>
                </div>

                <div className="relative shrink-0" data-tournament-actions>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setOpenActionMenuId((current) =>
                        current === tournament.id ? null : tournament.id,
                      )
                    }}
                    disabled={actionBusyId === tournament.id}
                    aria-label={`Tournament actions for ${tournament.name}`}
                    className="w-9 h-9 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-lg leading-none disabled:opacity-50 flex items-center justify-center"
                  >
                    ...
                  </button>

                  {openActionMenuId === tournament.id ? (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-gray-950 border border-gray-800 rounded-xl shadow-xl overflow-hidden z-20"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleDuplicateTournament(tournament, true)}
                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-900"
                      >
                        Copy tournament (With teams)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateTournament(tournament, false)}
                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-900 border-t border-gray-800"
                      >
                        Copy tournament (Without teams)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTournament(tournament)}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-900 border-t border-gray-800"
                      >
                        Delete tournament
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

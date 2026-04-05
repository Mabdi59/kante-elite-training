import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTournaments } from '../services/api'
import type { Tournament } from '../types'
import StatusBadge from '../components/StatusBadge'

function TournamentCard({ tournament: t }: { tournament: Tournament }) {
  const spotsLeft = t.maxTeams - t.registeredTeams
  const isDeadlinePassed =
    t.registrationDeadline ? new Date(t.registrationDeadline) < new Date() : false
  const canRegister =
    spotsLeft > 0 && t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && !isDeadlinePassed

  return (
    <Link
      to={`/tournaments/${t.id}`}
      className="block bg-gray-900 border border-gray-800 hover:border-cyan-800 rounded-2xl p-6 flex flex-col transition-colors group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white text-xl font-black leading-tight group-hover:text-cyan-300 transition-colors">{t.name}</h3>
          <p className="text-gray-400 text-sm mt-0.5">{t.location}</p>
        </div>
        <StatusBadge status={t.status} className="ml-2 shrink-0 mt-0.5" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {t.ageGroup && (
          <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
            {t.ageGroup}
          </span>
        )}
        {t.division && (
          <span className="text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
            {t.division}
          </span>
        )}
        {(t.entryFee ?? 0) > 0 && (
          <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-0.5 rounded-full">
            ${t.entryFee} entry
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm text-gray-400 mb-4 flex-1">
        <div className="flex justify-between">
          <span>Start Date</span>
          <span className="text-white">{t.startDate}</span>
        </div>
        {t.endDate && t.endDate !== t.startDate && (
          <div className="flex justify-between">
            <span>End Date</span>
            <span className="text-white">{t.endDate}</span>
          </div>
        )}
        {t.registrationDeadline && (
          <div className="flex justify-between">
            <span>Reg. Deadline</span>
            <span className={isDeadlinePassed ? 'text-red-400' : 'text-white'}>
              {t.registrationDeadline}
              {isDeadlinePassed && ' (closed)'}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Teams Registered</span>
          <span className="text-white">{t.registeredTeams} / {t.maxTeams}</span>
        </div>
        <div className="flex justify-between">
          <span>Spots Left</span>
          <span className={spotsLeft > 3 ? 'text-green-400' : spotsLeft > 0 ? 'text-yellow-400' : 'text-red-400'}>
            {spotsLeft > 0 ? spotsLeft : 'Full'}
          </span>
        </div>
      </div>

      {t.description && (
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{t.description}</p>
      )}

      {canRegister ? (
        <div className="block w-full text-center bg-green-500 group-hover:bg-green-400 text-black font-bold py-2.5 rounded-xl transition-colors text-sm">
          View & Register
        </div>
      ) : (
        <div className="w-full text-center bg-gray-800 text-gray-400 font-semibold py-2.5 rounded-xl text-sm group-hover:bg-gray-700 transition-colors">
          {t.status === 'COMPLETED'
            ? 'View Results'
            : t.status === 'CANCELLED'
            ? 'Cancelled'
            : isDeadlinePassed
            ? 'View Tournament'
            : 'Team Spots Full'}
        </div>
      )}
    </Link>
  )
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    document.title = 'Youth Soccer Tournaments | Kante Elite Training — Columbus, Ohio'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

  useEffect(() => {
    getTournaments()
      .then(setTournaments)
      .catch(() => { /* silenced */ })
      .finally(() => setLoading(false))
  }, [])

  const allStatuses = [...new Set(tournaments.map((t) => t.status))]
  const filtered = (filterStatus ? tournaments.filter((t) => t.status === filterStatus) : tournaments).sort(
    (a, b) => {
      const aOpen = a.status !== 'COMPLETED' && a.status !== 'CANCELLED'
      const bOpen = b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
      if (aOpen !== bOpen) return aOpen ? -1 : 1
      return a.startDate.localeCompare(b.startDate)
    },
  )
  const openTournaments = tournaments.filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED',
  )
  const closingSoon = tournaments.filter((t) => {
    if (!t.registrationDeadline) return false
    const today = new Date()
    const deadline = new Date(t.registrationDeadline)
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  })

  return (
    <div className="min-h-screen bg-black px-4 py-20">
      <div className="page-shell max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="mb-4 text-3xl font-black text-white sm:text-4xl md:text-5xl">TOURNAMENTS</h1>
          <p className="mx-auto max-w-2xl text-base text-gray-400 sm:text-lg">
            Public registration is open. Review the details, choose your tournament, and register your team in a few minutes.
          </p>
          {!loading && tournaments.length > 0 ? (
            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-400 text-sm mb-2">Available Now</p>
                <p className="text-3xl font-black text-green-400">{openTournaments.length}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-400 text-sm mb-2">Closing Soon</p>
                <p className="text-3xl font-black text-amber-400">{closingSoon.length}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-400 text-sm mb-2">Total Listings</p>
                <p className="text-3xl font-black text-white">{tournaments.length}</p>
              </div>
            </div>
          ) : null}
        </div>

        {!loading && tournaments.length > 0 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setFilterStatus('')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${!filterStatus ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
            >
              All
            </button>
            {allStatuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${filterStatus === s ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-center">Loading tournaments…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-lg font-semibold text-white mb-2">
              {filterStatus ? `No ${filterStatus.toLowerCase()} tournaments` : 'No tournaments yet'}
            </p>
            <p className="text-sm">Check back soon for upcoming events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

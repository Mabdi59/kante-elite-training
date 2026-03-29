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
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 flex flex-col transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white text-xl font-black leading-tight">{t.name}</h3>
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
        <Link
          to={`/tournaments/${t.id}/register`}
          className="block w-full text-center bg-green-500 hover:bg-green-400 text-black font-bold py-2.5 rounded-xl transition-colors text-sm"
        >
          Register Team
        </Link>
      ) : (
        <div className="w-full text-center bg-gray-800 text-gray-500 font-semibold py-2.5 rounded-xl text-sm">
          {t.status === 'COMPLETED'
            ? 'Tournament Ended'
            : t.status === 'CANCELLED'
            ? 'Cancelled'
            : isDeadlinePassed
            ? 'Registration Closed'
            : 'Team Spots Full'}
        </div>
      )}
    </div>
  )
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    getTournaments()
      .then(setTournaments)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const allStatuses = [...new Set(tournaments.map((t) => t.status))]
  const filtered = filterStatus ? tournaments.filter((t) => t.status === filterStatus) : tournaments

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-white text-5xl font-black mb-4">TOURNAMENTS</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Compete at the highest level. Register your team for upcoming tournaments.
          </p>
        </div>

        {!loading && tournaments.length > 0 && (
          <div className="flex gap-2 justify-center flex-wrap mb-10">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

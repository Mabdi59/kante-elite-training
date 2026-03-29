import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTournaments } from '../services/api'
import type { Tournament } from '../types'

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const spotsLeft = tournament.maxTeams - tournament.registeredTeams

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white text-xl font-black">{tournament.name}</h3>
          <p className="text-gray-400 text-sm mt-1">{tournament.location}</p>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            tournament.status === 'UPCOMING'
              ? 'bg-cyan-500/20 text-cyan-400'
              : tournament.status === 'ONGOING'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          {tournament.status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-400 mb-4">
        <div className="flex justify-between">
          <span>Start Date</span>
          <span className="text-white">{tournament.startDate}</span>
        </div>
        {tournament.endDate && (
          <div className="flex justify-between">
            <span>End Date</span>
            <span className="text-white">{tournament.endDate}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Teams</span>
          <span className="text-white">
            {tournament.registeredTeams} / {tournament.maxTeams}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Spots Left</span>
          <span className={spotsLeft > 0 ? 'text-green-400' : 'text-red-400'}>
            {spotsLeft > 0 ? spotsLeft : 'Full'}
          </span>
        </div>
      </div>

      {tournament.description && (
        <p className="text-gray-500 text-sm mb-4">{tournament.description}</p>
      )}

      {spotsLeft > 0 && tournament.status !== 'COMPLETED' && (
        <Link
          to={`/tournaments/${tournament.id}/register`}
          className="block w-full text-center bg-green-500 hover:bg-green-400 text-black font-bold py-2 rounded-lg transition-colors"
        >
          Register Team
        </Link>
      )}
    </div>
  )
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTournaments()
      .then(setTournaments)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-white text-5xl font-black mb-4">TOURNAMENTS</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Compete at the highest level. Register your team for upcoming tournaments.
          </p>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center">Loading tournaments…</p>
        ) : tournaments.length === 0 ? (
          <div className="text-center text-gray-400">
            <p>No tournaments available at the moment.</p>
            <p className="text-sm mt-2">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { getStaffPlayers } from '../../services/api'
import type { PlayerProfile } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'

export default function StaffPlayersPage() {
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getStaffPlayers()
      .then(setPlayers)
      .catch(() => setError('Could not load player records.'))
      .finally(() => setLoading(false))
  }, [])

  const filteredPlayers = players.filter((player) => {
    const query = search.toLowerCase()
    return (
      player.name.toLowerCase().includes(query) ||
      (player.parentUserEmail ?? '').toLowerCase().includes(query) ||
      (player.preferredPosition ?? '').toLowerCase().includes(query)
    )
  })

  if (loading) return <LoadingSpinner label="Loading players..." />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white text-3xl font-black">Players</h1>
        <p className="text-gray-400 text-sm mt-2">
          Review player and parent details so you can support families quickly.
        </p>
      </div>

      {error ? (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      ) : null}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by player, parent email, or position..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full max-w-md bg-[#111] border border-[#222] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
        />
      </div>

      {filteredPlayers.length === 0 ? (
        <EmptyState
          icon="P"
          title="No players found"
          description={search ? 'Try a different search term.' : 'Player records will appear here.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => (
            <div key={player.id} className="bg-[#111] border border-[#222] rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-white font-semibold">{player.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {player.parentUserEmail ?? 'Standalone player'}
                  </p>
                </div>
                <span className={`text-xs ${player.active ? 'text-amber-500' : 'text-red-400'}`}>
                  {player.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                {player.age ? (
                  <p className="text-gray-400">
                    <span className="text-gray-600">Age:</span> {player.age}
                  </p>
                ) : null}
                {player.dateOfBirth ? (
                  <p className="text-gray-400">
                    <span className="text-gray-600">Date of birth:</span> {player.dateOfBirth}
                  </p>
                ) : null}
                {player.skillLevel ? (
                  <p className="text-gray-400">
                    <span className="text-gray-600">Skill level:</span> {player.skillLevel}
                  </p>
                ) : null}
                {player.preferredPosition ? (
                  <p className="text-gray-400">
                    <span className="text-gray-600">Position:</span> {player.preferredPosition}
                  </p>
                ) : null}
                {player.notes ? (
                  <p className="text-gray-500 italic text-xs mt-2 whitespace-pre-line">{player.notes}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

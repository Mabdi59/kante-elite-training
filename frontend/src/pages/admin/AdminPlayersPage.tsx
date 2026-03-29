import { useEffect, useState } from 'react'
import { getAdminPlayers } from '../../services/api'
import type { PlayerProfile } from '../../types'

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAdminPlayers()
      .then(setPlayers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = players.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.parentUserEmail.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) return <div className="text-gray-400">Loading…</div>

  const skillColors: Record<string, string> = {
    BEGINNER: 'bg-blue-500/10 text-blue-400',
    INTERMEDIATE: 'bg-yellow-500/10 text-yellow-400',
    ADVANCED: 'bg-green-500/10 text-green-400',
    ELITE: 'bg-purple-500/10 text-purple-400',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-3xl font-black">Players</h1>
        <p className="text-gray-400 text-sm">{filtered.length} player(s)</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or parent email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No player profiles found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">{p.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{p.parentUserEmail}</p>
                </div>
                {p.skillLevel && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${skillColors[p.skillLevel.toUpperCase()] ?? 'bg-gray-700 text-gray-300'}`}
                  >
                    {p.skillLevel}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm">
                {p.age && (
                  <p className="text-gray-400">
                    <span className="text-gray-600">Age:</span> {p.age}
                  </p>
                )}
                {p.preferredPosition && (
                  <p className="text-gray-400">
                    <span className="text-gray-600">Position:</span> {p.preferredPosition}
                  </p>
                )}
                {p.notes && (
                  <p className="text-gray-500 italic text-xs mt-2 line-clamp-2">{p.notes}</p>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-800">
                <span
                  className={`text-xs ${p.active ? 'text-green-400' : 'text-red-400'}`}
                >
                  {p.active ? '● Active' : '● Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

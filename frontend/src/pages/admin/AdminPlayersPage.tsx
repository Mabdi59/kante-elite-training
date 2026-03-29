import { useEffect, useState } from 'react'
import { getAdminPlayers } from '../../services/api'
import type { PlayerProfile } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAdminPlayers()
      .then(setPlayers)
      .catch(() => setError('Could not load players. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = players.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.parentUserEmail.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) return <LoadingSpinner label="Loading players…" />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-3xl font-black">Players</h1>
        <p className="text-gray-400 text-sm">{filtered.length} {filtered.length === 1 ? 'player' : 'players'}</p>
      </div>

      {error && <div className="mb-6"><ErrorBanner message={error} onDismiss={() => setError('')} /></div>}

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
        <EmptyState icon="👦" title="No players found" description="Try a different name or email." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">{p.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{p.parentUserEmail}</p>
                </div>
                {p.skillLevel && <StatusBadge status={p.skillLevel} />}
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
                <span className={`text-xs ${p.active ? 'text-green-400' : 'text-red-400'}`}>
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

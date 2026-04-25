import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

interface BookingResult {
  id: number
  playerName: string
  programName: string
  bookingDate: string
  email: string
  bookingStatus: string
}

interface UserResult {
  id: number
  email: string
  name: string
  role: string
}

interface SearchResults {
  bookings: BookingResult[]
  users: UserResult[]
}

export default function AdminSearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()


  useEffect(() => {
    document.title = 'Search | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`)
        setResults(res.data)
      } catch {
        setError('Search failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Global Search</h1>
        <p className="mt-1 text-sm text-gray-400">Search across bookings and users.</p>
      </div>

      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, program…"
          className="w-full input-field-default rounded-xl pl-10"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {results && !loading && (
        <div className="space-y-6">
          {/* Bookings */}
          <div>
            <h2 className="mb-3 text-base font-bold text-white">
              Bookings
              <span className="ml-2 text-sm font-normal text-gray-500">({results.bookings?.length ?? 0})</span>
            </h2>
            {results.bookings?.length === 0 ? (
              <p className="text-sm text-gray-400">No booking results.</p>
            ) : (
              <div className="space-y-2">
                {results.bookings?.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => navigate('/admin/bookings')}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-left hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{b.playerName}</span>
                      <span className="text-xs text-gray-500">{b.bookingDate}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">{b.programName} · {b.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Users */}
          <div>
            <h2 className="mb-3 text-base font-bold text-white">
              Users
              <span className="ml-2 text-sm font-normal text-gray-500">({results.users?.length ?? 0})</span>
            </h2>
            {results.users?.length === 0 ? (
              <p className="text-sm text-gray-400">No user results.</p>
            ) : (
              <div className="space-y-2">
                {results.users?.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => navigate('/admin/users')}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-left hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{u.name || u.email}</span>
                      <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-400">{u.role}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">{u.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!results && !loading && query.trim() === '' && (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center text-gray-400">
          Start typing to search…
        </div>
      )}
    </div>
  )
}

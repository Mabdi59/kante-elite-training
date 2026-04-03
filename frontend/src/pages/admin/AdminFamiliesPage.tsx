import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminFamilies } from '../../services/api'
import type { FamilyListItem } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'

export default function AdminFamiliesPage() {
  const [families, setFamilies] = useState<FamilyListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAdminFamilies()
      .then(setFamilies)
      .catch(() => setError('Could not load families. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = families.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) return <LoadingSpinner label="Loading families..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Families</h1>
          <p className="text-gray-400 text-sm mt-1">
            {families.length} {families.length === 1 ? 'family' : 'families'} registered
          </p>
        </div>
        <Link
          to="/admin/families/onboard"
          className="bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          + Add Family
        </Link>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No matches found' : 'No families yet'}
          description={
            search
              ? 'Try a different search term.'
              : 'Get started by onboarding a family.'
          }
          action={
            !search ? (
              <Link
                to="/admin/families/onboard"
                className="bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Add Family
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((family) => (
            <Link
              key={family.id}
              to={`/admin/families/${family.id}`}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate group-hover:text-green-400 transition-colors">
                    {family.name}
                  </p>
                  <p className="text-gray-400 text-sm truncate">{family.email}</p>
                  {family.phone && (
                    <p className="text-gray-500 text-xs mt-0.5">{family.phone}</p>
                  )}
                </div>
                <svg
                  className="h-4 w-4 text-gray-600 group-hover:text-green-400 shrink-0 mt-1 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 text-xs font-medium px-2.5 py-1 rounded-full">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="8" r="2.5" />
                    <path d="M4 20a5 5 0 0 1 10 0" />
                    <circle cx="17" cy="9" r="2" />
                    <path d="M15 20a4 4 0 0 1 5-3.87" />
                  </svg>
                  {family.playerCount} {family.playerCount === 1 ? 'player' : 'players'}
                </span>
                <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 text-xs font-medium px-2.5 py-1 rounded-full">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 2v4M16 2v4" />
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                  {family.upcomingSessionCount} upcoming
                </span>
              </div>

              <p className="text-gray-600 text-xs mt-3">
                Joined {new Date(family.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

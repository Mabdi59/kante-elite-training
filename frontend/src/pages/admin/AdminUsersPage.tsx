import { useEffect, useState } from 'react'
import { getAdminUsers, updateUserRole } from '../../services/api'
import type { AdminUser } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'

const ALL_ROLES = ['ADMIN', 'STAFF', 'COACH', 'PARENT', 'PLAYER', 'TEAM_CAPTAIN', 'USER']

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch(() => setError('Could not load users. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const handleRoleChange = async (id: number, role: string) => {
    setUpdatingId(id)
    try {
      const updated = await updateUserRole(id, role)
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    } catch {
      setError('Failed to update role. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) return <LoadingSpinner label="Loading users…" />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-3xl font-black">Users</h1>
        <p className="text-gray-400 text-sm">{filtered.length} {filtered.length === 1 ? 'user' : 'users'}</p>
      </div>

      {error && <div className="mb-6"><ErrorBanner message={error} onDismiss={() => setError('')} /></div>}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="👥" title="No users found" description="Try a different name or email." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800 text-left">
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((u) => (
                <tr key={u.id} className="text-gray-300">
                  <td className="py-3 pr-4 text-gray-500">#{u.id}</td>
                  <td className="py-3 pr-4 font-medium text-white">{u.name}</td>
                  <td className="py-3 pr-4 text-gray-400">{u.email}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={u.role} />
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={updatingId === u.id}
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 cursor-pointer focus:outline-none"
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r} className="bg-gray-900 text-white">
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="py-3 text-gray-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

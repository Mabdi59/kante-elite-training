import { useEffect, useState } from 'react'
import { getAdminUsers } from '../../services/api'
import type { AdminUser } from '../../types'

const roleColor: Record<string, string> = {
  ADMIN: 'text-red-400',
  COACH: 'text-yellow-400',
  USER: 'text-blue-400',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-400">Loading users…</div>

  return (
    <div>
      <h1 className="text-white text-3xl font-black mb-8">Users</h1>

      {users.length === 0 ? (
        <p className="text-gray-400">No users yet.</p>
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
              {users.map((u) => (
                <tr key={u.id} className="text-gray-300">
                  <td className="py-3 pr-4 text-gray-500">#{u.id}</td>
                  <td className="py-3 pr-4 font-medium text-white">{u.name}</td>
                  <td className="py-3 pr-4 text-gray-400">{u.email}</td>
                  <td className={`py-3 pr-4 font-semibold ${roleColor[u.role] ?? 'text-gray-400'}`}>
                    {u.role}
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

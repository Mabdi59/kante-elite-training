import { useEffect, useState } from 'react'
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
  updateUserRole,
} from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import type { AdminUser, AdminUserFormData, UserRole } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'

const ALL_ROLES: UserRole[] = ['ADMIN', 'STAFF', 'COACH', 'PARENT', 'PLAYER', 'TEAM_CAPTAIN', 'USER']

const emptyForm: AdminUserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'USER',
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<AdminUserFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    getAdminUsers()
      .then(setUsers)
      .catch(() => setError('Could not load users. Please refresh.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditingUser(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEdit = (selected: AdminUser) => {
    setEditingUser(selected)
    setForm({
      name: selected.name,
      email: selected.email,
      password: '',
      role: selected.role,
    })
    setError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingUser(null)
    setForm(emptyForm)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (editingUser) {
        const payload = {
          name: form.name,
          email: form.email,
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        }
        const updated = await updateAdminUser(editingUser.id, payload)
        setUsers((prev) => prev.map((item) => (item.id === editingUser.id ? updated : item)))
      } else {
        const created = await createAdminUser({
          ...form,
          password: form.password ?? '',
        })
        setUsers((prev) => [created, ...prev])
      }
      closeForm()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save this user.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleRoleChange = async (id: number, role: string) => {
    setUpdatingId(id)
    try {
      const updated = await updateUserRole(id, role)
      setUsers((prev) => prev.map((item) => (item.id === id ? updated : item)))
    } catch {
      setError('Failed to update role. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (selected: AdminUser) => {
    if (selected.email === currentUser?.email) {
      setError('You cannot delete the account you are using right now.')
      return
    }

    if (!window.confirm(`Delete ${selected.name}? This will also remove linked coach and player records.`)) {
      return
    }

    try {
      await deleteAdminUser(selected.id)
      setUsers((prev) => prev.filter((item) => item.id !== selected.id))
    } catch {
      setError('Failed to delete user.')
    }
  }

  const filtered = users.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) return <LoadingSpinner label="Loading users..." />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-3xl font-black">Users</h1>
          <p className="text-gray-400 text-sm mt-1">
            {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg text-sm"
        >
          + Add User
        </button>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSave}
          className={`bg-gray-900 border rounded-xl p-6 mb-6 space-y-4 ${
            editingUser ? 'border-blue-500/30' : 'border-green-500/30'
          }`}
        >
          <h2 className="text-white font-bold text-xl">
            {editingUser ? 'Edit User' : 'Create User'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                {ALL_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">
                {editingUser ? 'New Password' : 'Password'}
              </label>
              <input
                type="password"
                required={!editingUser}
                minLength={8}
                value={form.password ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder={editingUser ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="Users" title="No users found" description="Try a different name or email." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800 text-left">
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Joined</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((item) => (
                <tr key={item.id} className="text-gray-300">
                  <td className="py-3 pr-4 text-gray-500">#{item.id}</td>
                  <td className="py-3 pr-4 font-medium text-white">{item.name}</td>
                  <td className="py-3 pr-4 text-gray-400">{item.email}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.role} />
                      <select
                        value={item.role}
                        onChange={(e) => handleRoleChange(item.id, e.target.value)}
                        disabled={updatingId === item.id}
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300"
                      >
                        {ALL_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-500 text-xs">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs"
                      >
                        Delete
                      </button>
                    </div>
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

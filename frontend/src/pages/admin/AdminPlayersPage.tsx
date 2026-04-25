import { useEffect, useState } from 'react'
import {
  createAdminPlayer,
  deleteAdminPlayer,
  getAdminPlayers,
  getAdminUsers,
  updateAdminPlayer,
} from '../../services/api'
import type { AdminPlayerFormData, AdminUser, PlayerProfile } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'
import { calculateAgeFromDateOfBirth } from '../../utils/playerAge'

const SKILL_LEVEL_OPTIONS = [
  'Beginner',
  'Developing',
  'Intermediate',
  'Advanced',
  'Elite',
]

const PREFERRED_POSITION_OPTIONS = [
  'Goalkeeper',
  'Defender',
  'Center Back',
  'Full Back',
  'Wing Back',
  'Defensive Midfielder',
  'Central Midfielder',
  'Attacking Midfielder',
  'Winger',
  'Forward',
  'Striker',
  'Utility / Multiple Positions',
]

const emptyForm: AdminPlayerFormData = {
  parentUserId: undefined,
  name: '',
  dateOfBirth: '',
  age: undefined,
  skillLevel: '',
  preferredPosition: '',
  notes: '',
  active: true,
}

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<PlayerProfile | null>(null)
  const [form, setForm] = useState<AdminPlayerFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([getAdminPlayers(), getAdminUsers()])
      .then(([playerData, userData]) => {
        setPlayers(playerData)
        setUsers(userData)
      })
      .catch(() => setError('Could not load players. Please refresh.'))
      .finally(() => setLoading(false))
  }


  useEffect(() => {
    document.title = 'Players | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(load, [])

  const openCreate = () => {
    setEditingPlayer(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEdit = (player: PlayerProfile) => {
    setEditingPlayer(player)
    setForm({
      parentUserId: player.parentUserId,
      name: player.name,
      dateOfBirth: player.dateOfBirth ?? '',
      age: calculateAgeFromDateOfBirth(player.dateOfBirth?.toString()) ?? player.age,
      skillLevel: player.skillLevel ?? '',
      preferredPosition: player.preferredPosition ?? '',
      notes: player.notes ?? '',
      active: player.active,
    })
    setError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingPlayer(null)
    setForm(emptyForm)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload: AdminPlayerFormData = {
        ...form,
        dateOfBirth: form.dateOfBirth || undefined,
        age: calculateAgeFromDateOfBirth(form.dateOfBirth) ?? form.age,
      }

      if (editingPlayer) {
        const updated = await updateAdminPlayer(editingPlayer.id, payload)
        setPlayers((prev) => prev.map((item) => (item.id === editingPlayer.id ? updated : item)))
      } else {
        const created = await createAdminPlayer(payload)
        setPlayers((prev) => [created, ...prev])
      }
      closeForm()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save this player profile.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (player: PlayerProfile) => {
    if (!window.confirm(`Delete ${player.name}?`)) {
      return
    }

    try {
      await deleteAdminPlayer(player.id)
      setPlayers((prev) => prev.filter((item) => item.id !== player.id))
    } catch {
      setError('Could not delete player profile.')
    }
  }

  const filtered = players.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.parentUserEmail ?? 'standalone').toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) return <LoadingSpinner label="Loading players..." />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-3xl font-black">Players</h1>
          <p className="text-gray-400 text-sm mt-1">
            {filtered.length} {filtered.length === 1 ? 'player' : 'players'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg text-sm"
        >
          + Add Player
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
            editingPlayer ? 'border-blue-500/30' : 'border-green-500/30'
          }`}
        >
          <h2 className="text-white font-bold text-xl">
            {editingPlayer ? 'Edit Player' : 'Create Player'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Parent User (Optional)</label>
              <select
                value={form.parentUserId || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    parentUserId: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">No parent account yet</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Leave this blank if the player does not have a linked parent account yet.
              </p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Player Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dateOfBirth: e.target.value,
                    age: calculateAgeFromDateOfBirth(e.target.value),
                  }))
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Age</label>
              <input
                type="number"
                min={1}
                value={calculateAgeFromDateOfBirth(form.dateOfBirth) ?? form.age ?? ''}
                readOnly
                disabled
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-400 text-sm cursor-not-allowed disabled:opacity-100"
              />
              <p className="mt-1 text-xs text-gray-500">Calculated automatically from date of birth.</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Skill Level</label>
              <select
                value={form.skillLevel ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, skillLevel: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">Select skill level</option>
                {SKILL_LEVEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Preferred Position</label>
              <select
                value={form.preferredPosition ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, preferredPosition: e.target.value }))
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">Select preferred position</option>
                {PREFERRED_POSITION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Notes</label>
              <textarea
                rows={3}
                value={form.notes ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.active ?? true}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 accent-green-500"
                />
                Active
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingPlayer ? 'Save Changes' : 'Create Player'}
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
          placeholder="Search by player or parent email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field-default max-w-md"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="Players" title="No players found" description="Add a player to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3 gap-3">
                <div>
                  <p className="text-white font-semibold">{item.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {item.parentUserEmail ?? 'Standalone player'}
                  </p>
                </div>
                {item.skillLevel ? <StatusBadge status={item.skillLevel} /> : null}
              </div>

              <div className="space-y-1 text-sm">
                {item.age ? (
                  <p className="text-gray-400">
                    <span className="text-gray-600">Age:</span> {item.age}
                  </p>
                ) : null}
                {item.preferredPosition ? (
                  <p className="text-gray-400">
                    <span className="text-gray-600">Position:</span> {item.preferredPosition}
                  </p>
                ) : null}
                {item.notes ? (
                  <p className="text-gray-500 italic text-xs mt-2 line-clamp-2">{item.notes}</p>
                ) : null}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                <span className={`text-xs ${item.active ? 'text-green-400' : 'text-red-400'}`}>
                  {item.active ? 'Active' : 'Inactive'}
                </span>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

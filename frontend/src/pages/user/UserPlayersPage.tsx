import { useEffect, useState } from 'react'
import {
  addPlayerProfile,
  getMyPlayers,
  removePlayerProfile,
  updatePlayerProfile,
} from '../../services/api'
import type { PlayerProfile, PlayerProfileFormData } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'
import { calculateAgeFromDateOfBirth } from '../../utils/playerAge'

const emptyForm: PlayerProfileFormData = {
  name: '',
  dateOfBirth: '',
  age: undefined,
  skillLevel: '',
  preferredPosition: '',
  notes: '',
}

export default function UserPlayersPage() {
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<PlayerProfile | null>(null)
  const [form, setForm] = useState<PlayerProfileFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMyPlayers()
      .then(setPlayers)
      .catch(() => setError('Could not load your player profiles.'))
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditingPlayer(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (player: PlayerProfile) => {
    setEditingPlayer(player)
    setForm({
      name: player.name,
      dateOfBirth: player.dateOfBirth ?? '',
      age: calculateAgeFromDateOfBirth(player.dateOfBirth?.toString()) ?? player.age,
      skillLevel: player.skillLevel ?? '',
      preferredPosition: player.preferredPosition ?? '',
      notes: player.notes ?? '',
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setEditingPlayer(null)
    setForm(emptyForm)
    setShowForm(false)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload: PlayerProfileFormData = {
        ...form,
        dateOfBirth: form.dateOfBirth || undefined,
        age: calculateAgeFromDateOfBirth(form.dateOfBirth) ?? form.age,
      }

      if (editingPlayer) {
        const updated = await updatePlayerProfile(editingPlayer.id, payload)
        setPlayers((current) => current.map((player) => (player.id === editingPlayer.id ? updated : player)))
      } else {
        const created = await addPlayerProfile(payload)
        setPlayers((current) => [...current, created])
      }
      closeForm()
    } catch {
      setError('Could not save the player profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (player: PlayerProfile) => {
    if (!window.confirm(`Remove ${player.name}?`)) return

    try {
      await removePlayerProfile(player.id)
      setPlayers((current) => current.filter((item) => item.id !== player.id))
    } catch {
      setError('Could not remove that player profile.')
    }
  }

  if (loading) return <LoadingSpinner label="Loading players..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Players</h1>
          <p className="text-gray-400 text-sm mt-2">
            Save player details so future bookings are faster and easier to manage.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary text-sm"
        >
          Add Player
        </button>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      {showForm ? (
        <form onSubmit={handleSave} className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <h2 className="text-white text-xl font-bold">
            {editingPlayer ? 'Edit Player Profile' : 'New Player Profile'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Player Name</label>
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="input-field-default"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth ?? ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    dateOfBirth: event.target.value,
                    age: calculateAgeFromDateOfBirth(event.target.value),
                  }))
                }
                className="input-field-default"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Age</label>
              <input
                type="number"
                min={3}
                max={25}
                value={calculateAgeFromDateOfBirth(form.dateOfBirth) ?? form.age ?? ''}
                readOnly
                disabled
                className="input-field-default text-gray-400 cursor-not-allowed disabled:opacity-100"
              />
              <p className="mt-1 text-xs text-gray-500">Calculated automatically from date of birth.</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Skill Level</label>
              <select
                value={form.skillLevel ?? ''}
                onChange={(event) => setForm((current) => ({ ...current, skillLevel: event.target.value }))}
                className="input-field-default"
              >
                <option value="">Select level</option>
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
                <option value="ELITE">ELITE</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Preferred Position</label>
              <input
                value={form.preferredPosition ?? ''}
                onChange={(event) =>
                  setForm((current) => ({ ...current, preferredPosition: event.target.value }))
                }
                className="input-field-default"
                placeholder="Example: Midfielder"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Notes</label>
              <textarea
                rows={3}
                value={form.notes ?? ''}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                className="input-field-default resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingPlayer ? 'Save Changes' : 'Add Player'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {players.length === 0 ? (
        <EmptyState
          icon="P"
          title="No player profiles yet"
          description="Add your first player to keep booking details organized."
          action={
            <button onClick={openCreate} className="btn-primary">
              Add Player
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {players.map((player) => (
            <div key={player.id} className="bg-[#111] border border-[#222] rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-white font-semibold text-lg">{player.name}</p>
                  <p className={`text-xs ${player.active ? 'text-green-400' : 'text-red-400'}`}>
                    {player.active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(player)}
                    className="text-amber-500 hover:text-amber-400 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(player)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-400">
                {player.age ? <p>Age: {player.age}</p> : null}
                {player.dateOfBirth ? <p>Date of birth: {player.dateOfBirth}</p> : null}
                {player.skillLevel ? (
                  <p>
                    Level: <span className="text-white">{player.skillLevel}</span>
                  </p>
                ) : null}
                {player.preferredPosition ? (
                  <p>
                    Position: <span className="text-white">{player.preferredPosition}</span>
                  </p>
                ) : null}
                {player.notes ? <p className="italic text-gray-500 text-xs mt-2">{player.notes}</p> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

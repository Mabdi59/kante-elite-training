import { useEffect, useState } from 'react'
import {
  addPlayerProfile,
  getMyPlayers,
  updatePlayerProfile,
} from '../../services/api'
import type { PlayerProfile, PlayerProfileFormData } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
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

export default function PlayerProfilePage() {
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<PlayerProfileFormData>(emptyForm)


  useEffect(() => {
    document.title = 'My Profile | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    getMyPlayers()
      .then((data) => {
        setPlayers(data)
        if (data[0]) {
          setForm({
            name: data[0].name,
            dateOfBirth: data[0].dateOfBirth ?? '',
            age: calculateAgeFromDateOfBirth(data[0].dateOfBirth?.toString()) ?? data[0].age,
            skillLevel: data[0].skillLevel ?? '',
            preferredPosition: data[0].preferredPosition ?? '',
            notes: data[0].notes ?? '',
          })
        }
      })
      .catch(() => setError('Could not load your player profile.'))
      .finally(() => setLoading(false))
  }, [])

  const profile = players[0] ?? null

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

      const savedProfile = profile
        ? await updatePlayerProfile(profile.id, payload)
        : await addPlayerProfile(payload)

      setPlayers([savedProfile])
    } catch {
      setError('Could not save your player profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading profile..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Player Profile</h1>
          <p className="text-gray-400 text-sm mt-2">
            Keep your training details current so every session is tailored to you.
          </p>
        </div>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      <form onSubmit={handleSave} className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
        <h2 className="text-white text-xl font-bold">
          {profile ? 'Update Your Profile' : 'Set Up Your Profile'}
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
              rows={4}
              value={form.notes ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className="input-field-default resize-none"
              placeholder="Share anything that will help guide your training."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : profile ? 'Save Changes' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { getMyCoachProfile, updateMyCoachProfile } from '../../services/api'
import type { CoachProfile, CoachProfileFormData } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

export default function CoachProfilePage() {
  const [profile, setProfile] = useState<CoachProfile | null>(null)
  const [form, setForm] = useState<CoachProfileFormData>({ bio: '', specialties: '', certifications: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyCoachProfile()
      .then((p) => {
        setProfile(p)
        if (!p) {
          setError('No coach profile found. Contact an admin to get set up.')
          return
        }
        setForm({ bio: p.bio ?? '', specialties: p.specialties ?? '', certifications: p.certifications ?? '' })
      })
      .catch(() => setError('Could not load your profile. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const updated = await updateMyCoachProfile(form)
      setProfile(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Could not save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading your profile…" />

  return (
    <div>
      <h1 className="text-white text-3xl font-black mb-8">My Profile</h1>

      {error && <div className="mb-6"><ErrorBanner message={error} onDismiss={() => setError('')} /></div>}

      {profile && (
        <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6 max-w-2xl">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Bio</label>
            <textarea
              value={form.bio ?? ''}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Tell players about your background…"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Specialties</label>
            <input
              type="text"
              value={form.specialties ?? ''}
              onChange={(e) => setForm({ ...form, specialties: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="e.g. Dribbling, Defending, U12-U16"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Certifications</label>
            <input
              type="text"
              value={form.certifications ?? ''}
              onChange={(e) => setForm({ ...form, certifications: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="e.g. UEFA B, FA Level 2"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
            {saved && <span className="text-green-400 text-sm">Saved!</span>}
          </div>
        </form>
      )}
    </div>
  )
}

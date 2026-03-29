import { useEffect, useState } from 'react'
import {
  getAdminTournaments,
  createTournament,
  deleteTournament,
  getTournamentRegistrations,
  updateRegistrationStatus,
} from '../../services/api'
import type { Tournament, TeamRegistration } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'

const TOURNAMENT_STATUSES = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']

const emptyForm: Partial<Tournament> = {
  name: '', location: '', startDate: '', endDate: '', maxTeams: 16,
  description: '', status: 'UPCOMING', ageGroup: '', division: '',
  registrationDeadline: '', entryFee: 0, notes: '',
}

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null)
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([])
  const [regLoading, setRegLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Tournament>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    getAdminTournaments()
      .then(setTournaments)
      .catch(() => setError('Failed to load tournaments.'))
      .finally(() => setLoading(false))
  }, [])

  const loadRegistrations = async (id: number) => {
    if (selectedTournament === id) {
      setSelectedTournament(null)
      return
    }
    setSelectedTournament(id)
    setRegLoading(true)
    try {
      const regs = await getTournamentRegistrations(id)
      setRegistrations(regs)
    } catch {
      setError('Failed to load registrations.')
    } finally {
      setRegLoading(false)
    }
  }

  const handleRegStatusChange = async (regId: number, status: string) => {
    try {
      const updated = await updateRegistrationStatus(regId, status)
      setRegistrations((prev) => prev.map((r) => (r.id === regId ? updated : r)))
    } catch {
      setError('Failed to update registration status.')
    }
  }

  const handleDeleteTournament = async (id: number) => {
    if (!window.confirm('Delete this tournament? This cannot be undone.')) return
    try {
      await deleteTournament(id)
      setTournaments((prev) => prev.filter((t) => t.id !== id))
      if (selectedTournament === id) setSelectedTournament(null)
    } catch {
      setError('Failed to delete tournament.')
    }
  }

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      const created = await createTournament(form)
      setTournaments((prev) => [created, ...prev])
      setShowForm(false)
      setForm(emptyForm)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Save failed.'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  const set = (field: keyof Tournament, val: unknown) =>
    setForm((prev) => ({ ...prev, [field]: val }))

  if (loading) return <LoadingSpinner label="Loading tournaments…" />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-3xl font-black">Tournaments</h1>
        <button
          onClick={() => { setShowForm((s) => !s); setSaveError('') }}
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg text-sm"
        >
          {showForm ? '✕ Cancel' : '+ New Tournament'}
        </button>
      </div>

      {error && <div className="mb-6"><ErrorBanner message={error} onDismiss={() => setError('')} /></div>}

      {showForm && (
        <form onSubmit={handleSave}
          className="bg-gray-900 border border-green-500/30 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-white font-bold text-xl">Create Tournament</h2>

          {saveError && <ErrorBanner message={saveError} onDismiss={() => setSaveError('')} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Tournament Name *</label>
              <input required value={form.name ?? ''} onChange={(e) => set('name', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="e.g. Kanté Elite Summer Cup 2026" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Location *</label>
              <input required value={form.location ?? ''} onChange={(e) => set('location', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Status</label>
              <select value={form.status ?? 'UPCOMING'} onChange={(e) => set('status', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                {TOURNAMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Start Date *</label>
              <input required type="date" value={form.startDate ?? ''} onChange={(e) => set('startDate', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">End Date</label>
              <input type="date" value={form.endDate ?? ''} onChange={(e) => set('endDate', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Registration Deadline</label>
              <input type="date" value={form.registrationDeadline ?? ''} onChange={(e) => set('registrationDeadline', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Max Teams</label>
              <input type="number" min={2} value={form.maxTeams ?? 16}
                onChange={(e) => set('maxTeams', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Age Group</label>
              <input value={form.ageGroup ?? ''} onChange={(e) => set('ageGroup', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="e.g. U12, U15-U18" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Division</label>
              <input value={form.division ?? ''} onChange={(e) => set('division', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="e.g. Elite, Recreational" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Entry Fee ($)</label>
              <input type="number" min={0} value={form.entryFee ?? 0}
                onChange={(e) => set('entryFee', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Description</label>
              <textarea rows={3} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Tournament'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {tournaments.length === 0 ? (
        <EmptyState
          icon="🥇"
          title="No tournaments yet"
          description="Create your first tournament to start accepting team registrations."
          action={
            <button onClick={() => setShowForm(true)} className="bg-green-500 text-black font-bold px-5 py-2 rounded-lg text-sm">
              + New Tournament
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {tournaments.map((t) => (
            <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-5 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="text-white font-bold">{t.name}</h3>
                    <StatusBadge status={t.status} />
                    {t.ageGroup && (
                      <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">{t.ageGroup}</span>
                    )}
                    {t.division && (
                      <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">{t.division}</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {t.location} · {t.startDate}{t.endDate ? ` – ${t.endDate}` : ''}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {t.registeredTeams} / {t.maxTeams} teams registered
                    {t.registrationDeadline && ` · Deadline: ${t.registrationDeadline}`}
                    {(t.entryFee ?? 0) > 0 && ` · $${t.entryFee} entry`}
                  </p>
                </div>
                <div className="flex gap-3 ml-4 shrink-0">
                  <button
                    onClick={() => loadRegistrations(t.id)}
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    {selectedTournament === t.id ? 'Hide' : 'Registrations'}
                  </button>
                  <button
                    onClick={() => handleDeleteTournament(t.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {selectedTournament === t.id && (
                <div className="border-t border-gray-800 p-5">
                  {regLoading ? (
                    <LoadingSpinner size="sm" label="Loading registrations…" />
                  ) : registrations.length === 0 ? (
                    <EmptyState icon="📋" title="No registrations yet" />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-500 text-left border-b border-gray-800">
                            <th className="pb-2 pr-4">Team</th>
                            <th className="pb-2 pr-4">Captain</th>
                            <th className="pb-2 pr-4">Email</th>
                            <th className="pb-2 pr-4">Status</th>
                            <th className="pb-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {registrations.map((r) => (
                            <tr key={r.id} className="text-gray-300">
                              <td className="py-2 pr-4 font-medium text-white">{r.teamName}</td>
                              <td className="py-2 pr-4">{r.captainName}</td>
                              <td className="py-2 pr-4 text-gray-400">{r.contactEmail}</td>
                              <td className="py-2 pr-4">
                                <StatusBadge status={r.status} />
                              </td>
                              <td className="py-2">
                                <select
                                  value={r.status}
                                  onChange={(e) => handleRegStatusChange(r.id, e.target.value)}
                                  className="bg-gray-800 border border-gray-700 text-gray-300 rounded px-2 py-1 text-xs"
                                >
                                  {['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'].map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

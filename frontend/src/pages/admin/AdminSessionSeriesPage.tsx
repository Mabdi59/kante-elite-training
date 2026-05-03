import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  cancelAdminSessionSeriesFuture,
  cancelGeneratedTrainingSession,
  createAdminSessionSeries,
  deleteAdminSessionSeries,
  getAdminPlayers,
  getAdminPrograms,
  getAdminSessionSeries,
  getAdminSessionSeriesSessions,
  getAdminUsers,
  previewAdminSessionSeries,
  updateAdminSessionSeries,
} from '../../services/api'
import type {
  AdminUser,
  PlayerProfile,
  Program,
  SessionSeries,
  SessionSeriesFormData,
  SessionSeriesPreviewItem,
  TrainingSession,
} from '../../types'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'
import LoadingSpinner from '../../components/LoadingSpinner'

const days = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

const initialForm: SessionSeriesFormData = {
  programId: 0,
  coachUserId: undefined,
  playerProfileIds: [],
  title: '',
  startDate: '',
  endDate: '',
  weekdays: 'MONDAY',
  startTime: '16:00',
  durationMinutes: 60,
  capacity: 1,
  location: '',
  notes: '',
  active: true,
}

function formatDate(value?: string) {
  if (!value) return 'Unscheduled'
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusClass(status: TrainingSession['status']) {
  switch (status) {
    case 'SCHEDULED':
      return 'border-green-500/30 bg-green-500/10 text-green-300'
    case 'COMPLETED':
      return 'border-blue-500/30 bg-blue-500/10 text-blue-300'
    case 'CANCELLED':
      return 'border-red-500/30 bg-red-500/10 text-red-300'
    default:
      return 'border-white/15 bg-white/5 text-white'
  }
}

function formFromSeries(series: SessionSeries): SessionSeriesFormData {
  return {
    programId: series.programId,
    coachUserId: series.coachUserId,
    playerProfileIds: series.players.map((player) => player.id),
    title: series.title ?? '',
    startDate: series.startDate,
    endDate: series.endDate,
    weekdays: series.weekdays,
    startTime: series.startTime,
    durationMinutes: series.durationMinutes,
    capacity: series.capacity,
    location: series.location ?? '',
    notes: series.notes ?? '',
    active: series.active,
  }
}

export default function AdminSessionSeriesPage() {
  const [series, setSeries] = useState<SessionSeries[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [preview, setPreview] = useState<SessionSeriesPreviewItem[]>([])
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SessionSeriesFormData>(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [error, setError] = useState('')

  const coaches = useMemo(() => users.filter((user) => user.role === 'COACH'), [users])
  const selectedSeries = useMemo(
    () => series.find((item) => item.id === selectedSeriesId) ?? null,
    [selectedSeriesId, series],
  )

  useEffect(() => {
    document.title = 'Recurring Sessions | Kante Elite Training'
    return () => {
      document.title = 'Kante Elite Training'
    }
  }, [])

  useEffect(() => {
    Promise.all([getAdminSessionSeries(), getAdminPrograms(), getAdminUsers(), getAdminPlayers()])
      .then(([seriesData, programData, userData, playerData]) => {
        setSeries(seriesData)
        setPrograms(programData)
        setUsers(userData)
        setPlayers(playerData.filter((player) => player.active))
        setSelectedSeriesId(seriesData[0]?.id ?? null)
        setForm((prev) => ({
          ...prev,
          programId: programData[0]?.id ?? 0,
        }))
      })
      .catch(() => setError('Unable to load recurring session data.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedSeriesId) {
      setSessions([])
      return
    }
    setLoadingSessions(true)
    getAdminSessionSeriesSessions(selectedSeriesId)
      .then(setSessions)
      .catch(() => setError('Unable to load generated sessions.'))
      .finally(() => setLoadingSessions(false))
  }, [selectedSeriesId])

  const updateField = <K extends keyof SessionSeriesFormData>(key: K, value: SessionSeriesFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleDay = (day: string) => {
    const current = new Set(form.weekdays.split(',').filter(Boolean))
    if (current.has(day)) {
      current.delete(day)
    } else {
      current.add(day)
    }
    const next = days.filter((item) => current.has(item)).join(',')
    updateField('weekdays', next || day)
  }

  const togglePlayer = (id: number) => {
    const current = new Set(form.playerProfileIds ?? [])
    if (current.has(id)) {
      current.delete(id)
    } else {
      current.add(id)
    }
    const next = Array.from(current)
    updateField('playerProfileIds', next)
    updateField('capacity', Math.max(form.capacity, next.length || 1))
  }

  const resetForm = () => {
    setEditingId(null)
    setPreview([])
    setForm({
      ...initialForm,
      programId: programs[0]?.id ?? 0,
    })
  }

  const refreshSeries = async () => {
    const next = await getAdminSessionSeries()
    setSeries(next)
    if (selectedSeriesId && next.some((item) => item.id === selectedSeriesId)) return
    setSelectedSeriesId(next[0]?.id ?? null)
  }

  const handlePreview = async () => {
    setError('')
    try {
      setPreview(await previewAdminSessionSeries(form))
    } catch {
      setError('Unable to preview this recurring pattern.')
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        const updated = await updateAdminSessionSeries(editingId, form)
        setSeries((prev) => prev.map((item) => (item.id === editingId ? updated : item)))
        setSelectedSeriesId(updated.id)
      } else {
        const created = await createAdminSessionSeries(form)
        setSeries((prev) => [created, ...prev])
        setSelectedSeriesId(created.id)
      }
      resetForm()
    } catch {
      setError('Unable to save recurring session series.')
    } finally {
      setSaving(false)
    }
  }

  const editSeries = (item: SessionSeries) => {
    setEditingId(item.id)
    setForm(formFromSeries(item))
    setPreview([])
  }

  const deactivateSeries = async (id: number) => {
    if (!window.confirm('Deactivate this series and cancel future generated sessions?')) return
    setError('')
    try {
      await deleteAdminSessionSeries(id)
      await refreshSeries()
      if (selectedSeriesId === id) {
        setSessions([])
      }
    } catch {
      setError('Unable to deactivate recurring session series.')
    }
  }

  const cancelFuture = async (id: number) => {
    if (!window.confirm('Cancel all future generated sessions for this series?')) return
    setError('')
    try {
      await cancelAdminSessionSeriesFuture(id)
      await refreshSeries()
      setSessions(await getAdminSessionSeriesSessions(id))
    } catch {
      setError('Unable to cancel future sessions.')
    }
  }

  const cancelSession = async (id: number) => {
    if (!window.confirm('Cancel this generated session?')) return
    setError('')
    try {
      await cancelGeneratedTrainingSession(id)
      if (selectedSeriesId) {
        setSessions(await getAdminSessionSeriesSessions(selectedSeriesId))
      }
    } catch {
      setError('Unable to cancel session.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <LoadingSpinner label="Loading recurring sessions..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Scheduling
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">Recurring Sessions</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-400">
            Build recurring training patterns that generate TrainingSession records directly.
          </p>
        </div>
        {editingId ? (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/5"
          >
            Cancel Edit
          </button>
        ) : null}
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Series' : 'Create Series'}</h2>
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4 lg:grid-cols-12">
          <input
            value={form.title ?? ''}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Series title"
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white lg:col-span-4"
          />
          <select
            value={form.programId || ''}
            onChange={(event) => updateField('programId', Number(event.target.value))}
            required
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white lg:col-span-4"
          >
            <option value="">Select program</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
          <select
            value={form.coachUserId ?? ''}
            onChange={(event) => updateField('coachUserId', event.target.value ? Number(event.target.value) : undefined)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white lg:col-span-4"
          >
            <option value="">No coach assigned</option>
            {coaches.map((coach) => (
              <option key={coach.id} value={coach.id}>
                {coach.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={form.startDate}
            onChange={(event) => updateField('startDate', event.target.value)}
            required
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white lg:col-span-3"
          />
          <input
            type="date"
            value={form.endDate ?? ''}
            onChange={(event) => updateField('endDate', event.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white lg:col-span-3"
          />
          <input
            type="time"
            value={form.startTime}
            onChange={(event) => updateField('startTime', event.target.value)}
            required
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white lg:col-span-2"
          />
          <input
            type="number"
            min={15}
            step={15}
            value={form.durationMinutes}
            onChange={(event) => updateField('durationMinutes', Number(event.target.value))}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white lg:col-span-2"
          />
          <input
            type="number"
            min={1}
            value={form.capacity}
            onChange={(event) => updateField('capacity', Number(event.target.value))}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white lg:col-span-2"
          />

          <div className="lg:col-span-12">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Days</p>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => {
                const checked = form.weekdays.split(',').includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                      checked
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                )
              })}
            </div>
          </div>

          <input
            value={form.location ?? ''}
            onChange={(event) => updateField('location', event.target.value)}
            placeholder="Location"
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white lg:col-span-6"
          />
          <input
            value={form.notes ?? ''}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Internal notes"
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white lg:col-span-6"
          />

          <div className="lg:col-span-12">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Assigned Players
            </p>
            <div className="grid max-h-44 gap-2 overflow-y-auto rounded-lg border border-gray-800 bg-black/20 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {players.length === 0 ? (
                <p className="text-sm text-gray-500">No active player profiles are available.</p>
              ) : (
                players.map((player) => (
                  <label key={player.id} className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={(form.playerProfileIds ?? []).includes(player.id)}
                      onChange={() => togglePlayer(player.id)}
                    />
                    <span>{player.name}</span>
                    {player.parentUserEmail ? (
                      <span className="truncate text-xs text-gray-500">{player.parentUserEmail}</span>
                    ) : null}
                  </label>
                ))
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-300 lg:col-span-3">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => updateField('active', event.target.checked)}
            />
            Active series
          </label>

          <div className="flex flex-wrap gap-3 lg:col-span-9 lg:justify-end">
            <button
              type="button"
              onClick={handlePreview}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/5"
            >
              Preview
            </button>
            <button
              type="submit"
              disabled={saving || !form.programId}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Series'}
            </button>
          </div>
        </form>

        {preview.length > 0 ? (
          <div className="mt-5 rounded-lg border border-gray-800 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">Preview</h3>
              <span className="text-xs text-gray-500">{preview.length} potential sessions</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {preview.slice(0, 18).map((item) => (
                <div key={`${item.date}-${item.startTime}`} className="rounded-lg border border-gray-800 bg-gray-950 p-3">
                  <p className="text-sm font-semibold text-white">{formatDate(item.date)} at {item.startTime}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.dayOfWeek}</p>
                  {item.conflict ? (
                    <p className="mt-2 text-xs text-red-300">{item.conflictReason}</p>
                  ) : (
                    <p className="mt-2 text-xs text-green-300">Available</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h2 className="text-xl font-bold text-white">Series</h2>
          <div className="mt-4 space-y-3">
            {series.length === 0 ? (
              <EmptyState title="No recurring sessions" description="Create a series to start generating sessions." />
            ) : (
              series.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedSeriesId(item.id)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    selectedSeriesId === item.id
                      ? 'border-amber-500/40 bg-amber-500/10'
                      : 'border-gray-800 bg-gray-950 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{item.title || item.programName || 'Recurring sessions'}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {item.weekdays.split(',').join(', ')} at {item.startTime}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${item.active ? 'bg-green-500/10 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-400">
                    <span>{item.upcomingSessions} upcoming</span>
                    <span>{item.completedSessions} complete</span>
                    <span>{item.players.length} players</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Generated Sessions</h2>
              <p className="mt-1 text-sm text-gray-500">
                {selectedSeries ? selectedSeries.title || selectedSeries.programName : 'Select a series'}
              </p>
            </div>
            {selectedSeries ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => editSeries(selectedSeries)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-white/5"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => cancelFuture(selectedSeries.id)}
                  className="rounded-lg border border-amber-500/30 px-3 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/10"
                >
                  Cancel Future
                </button>
                <button
                  type="button"
                  onClick={() => deactivateSeries(selectedSeries.id)}
                  className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10"
                >
                  Deactivate
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-5 space-y-3">
            {loadingSessions ? (
              <div className="py-12">
                <LoadingSpinner label="Loading generated sessions..." />
              </div>
            ) : sessions.length === 0 ? (
              <EmptyState title="No generated sessions" description="Generated TrainingSession records will appear here." />
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {formatDate(session.scheduledDate)} at {session.startTime}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {session.programName} · {session.coachName || 'No coach'} · {session.registrationCount}/{session.capacity} registered
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-1 text-xs ${statusClass(session.status)}`}>
                        {session.status}
                      </span>
                      {session.status !== 'CANCELLED' ? (
                        <button
                          type="button"
                          onClick={() => cancelSession(session.id)}
                          className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {session.roster && session.roster.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {session.roster.map((registration) => (
                        <span key={registration.id} className="rounded-full bg-white/5 px-2 py-1 text-xs text-gray-300">
                          {registration.participantName}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

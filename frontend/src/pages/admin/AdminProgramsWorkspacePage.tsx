import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  addAdminProgramParticipant,
  createProgram,
  deleteProgram,
  getAdminPlayers,
  getAdminProgramWorkflow,
  getAdminPrograms,
  getAdminUsers,
  removeAdminProgramParticipant,
  updateProgram,
} from '../../services/api'
import type {
  AdminUser,
  ManagedParticipant,
  ParticipantAssignmentFormData,
  PlayerProfile,
  Program,
  ProgramWorkflow,
} from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'
import StatusBadge from '../../components/StatusBadge'
import DatePickerField from '../../components/DatePickerField'

const PROGRAM_STATUSES = ['UPCOMING', 'ACTIVE', 'COMPLETED'] as const
const PARTICIPANT_MODES = ['USER', 'PLAYER', 'MANUAL'] as const

type ParticipantMode = (typeof PARTICIPANT_MODES)[number]

type ProgramFormState = {
  name: string
  slug: string
  shortDescription: string
  description: string
  location: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  capacity: number
  status: string
  price: number
  priceLabel: string
  durationMinutes: number
  featuresText: string
  icon: string
  whoItsFor: string
  displayOrder: number
  active: boolean
}

const emptyForm: ProgramFormState = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  location: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  capacity: 20,
  status: 'UPCOMING',
  price: 0,
  priceLabel: 'per program',
  durationMinutes: 60,
  featuresText: '',
  icon: 'Soccer',
  whoItsFor: '',
  displayOrder: 0,
  active: true,
}

function splitDateTime(value?: string) {
  if (!value) return { date: '', time: '' }
  return { date: value.slice(0, 10), time: value.length >= 16 ? value.slice(11, 16) : '' }
}

function combineDateTime(date: string, time: string) {
  if (!date) return undefined
  return `${date}T${time || '00:00'}`
}

function toFormState(program?: Program): ProgramFormState {
  if (!program) return emptyForm
  const start = splitDateTime(program.startAt)
  const end = splitDateTime(program.endAt)
  return {
    name: program.name ?? '',
    slug: program.slug ?? '',
    shortDescription: program.shortDescription ?? '',
    description: program.description ?? '',
    location: program.location ?? '',
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    capacity: Number(program.capacity ?? 20),
    status: program.status ?? 'UPCOMING',
    price: Number(program.price ?? 0),
    priceLabel: program.priceLabel ?? 'per program',
    durationMinutes: Number(program.durationMinutes ?? 60),
    featuresText: (program.features ?? []).join('\n'),
    icon: program.icon ?? 'Soccer',
    whoItsFor: program.whoItsFor ?? '',
    displayOrder: Number(program.displayOrder ?? 0),
    active: true,
  }
}

function buildProgramPayload(form: ProgramFormState): Partial<Program> {
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    location: form.location.trim(),
    startAt: combineDateTime(form.startDate, form.startTime),
    endAt: combineDateTime(form.endDate, form.endTime),
    capacity: Math.max(1, Number(form.capacity) || 20),
    status: form.status,
    price: Number(form.price) || 0,
    priceLabel: form.priceLabel.trim(),
    durationMinutes: Math.max(15, Number(form.durationMinutes) || 60),
    features: form.featuresText.split('\n').map((line) => line.trim()).filter(Boolean),
    icon: form.icon.trim(),
    whoItsFor: form.whoItsFor.trim(),
    displayOrder: Math.max(0, Number(form.displayOrder) || 0),
    active: form.active,
  }
}

function formatSchedule(startAt?: string, endAt?: string) {
  if (!startAt && !endAt) return 'Schedule not set'
  const start = startAt ? new Date(startAt) : null
  const end = endAt ? new Date(endAt) : null
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
  if (start && end) return `${start.toLocaleString([], options)} to ${end.toLocaleString([], options)}`
  if (start) return `Starts ${start.toLocaleString([], options)}`
  return `Ends ${end?.toLocaleString([], options)}`
}

export default function AdminProgramsWorkspacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [programs, setPrograms] = useState<Program[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [workflow, setWorkflow] = useState<ProgramWorkflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [participantError, setParticipantError] = useState('')
  const [saving, setSaving] = useState(false)
  const [participantSaving, setParticipantSaving] = useState(false)
  const [removingParticipantId, setRemovingParticipantId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null)
  const [creatingNew, setCreatingNew] = useState(false)
  const [form, setForm] = useState<ProgramFormState>(emptyForm)
  const [participantMode, setParticipantMode] = useState<ParticipantMode>('USER')
  const [participantSearch, setParticipantSearch] = useState('')
  const [participantForm, setParticipantForm] = useState<ParticipantAssignmentFormData>({})

  const filteredPrograms = useMemo(() => programs.filter((program) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return program.name.toLowerCase().includes(term) || program.slug.toLowerCase().includes(term) || (program.location ?? '').toLowerCase().includes(term)
  }), [programs, search])

  const filteredUsers = useMemo(() => users.filter((user) => {
    const term = participantSearch.trim().toLowerCase()
    if (!term) return true
    return user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
  }).slice(0, 50), [participantSearch, users])

  const filteredPlayers = useMemo(() => players.filter((player) => {
    const term = participantSearch.trim().toLowerCase()
    if (!term) return true
    return player.name.toLowerCase().includes(term) || player.parentUserEmail.toLowerCase().includes(term)
  }).slice(0, 50), [participantSearch, players])

  useEffect(() => {
    setLoading(true)
    Promise.all([getAdminPrograms(), getAdminUsers(), getAdminPlayers()])
      .then(([programData, userData, playerData]) => {
        setPrograms(programData)
        setUsers(userData)
        setPlayers(playerData)
        if (programData.length > 0) setSelectedProgramId(programData[0].id)
      })
      .catch(() => setError('Failed to load program scheduling.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (creatingNew || selectedProgramId === null) {
      setWorkflow(null)
      return
    }

    setWorkspaceLoading(true)
    getAdminProgramWorkflow(selectedProgramId)
      .then((data) => {
        setWorkflow(data)
        setForm(toFormState(data.program))
        setSaveError('')
        setParticipantError('')
      })
      .catch(() => setError('Failed to load this program workspace.'))
      .finally(() => setWorkspaceLoading(false))
  }, [creatingNew, selectedProgramId])

  const participantCount = workflow?.participantCount ?? 0
  const capacity = Math.max(1, Number(form.capacity) || 20)
  const capacityReached = workflow?.capacityReached ?? participantCount >= capacity

  const syncProgramInList = (program: Program) => {
    setPrograms((prev) => {
      const exists = prev.some((item) => item.id === program.id)
      if (!exists) return [program, ...prev]
      return prev.map((item) => (item.id === program.id ? program : item))
    })
  }

  const openCreate = () => {
    setCreatingNew(true)
    setSelectedProgramId(null)
    setWorkflow(null)
    setForm(emptyForm)
    setSaveError('')
    setParticipantError('')
  }

  useEffect(() => {
    if (searchParams.get('create') !== '1') return
    openCreate()
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  const openProgram = (programId: number) => {
    setCreatingNew(false)
    setSelectedProgramId(programId)
  }

  const cancelCreate = () => {
    setCreatingNew(false)
    setSaveError('')
    if (programs.length > 0) setSelectedProgramId(programs[0].id)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      const payload = buildProgramPayload(form)
      if (creatingNew) {
        const created = await createProgram(payload)
        syncProgramInList(created)
        setCreatingNew(false)
        setSelectedProgramId(created.id)
      } else if (selectedProgramId !== null) {
        const updated = await updateProgram(selectedProgramId, payload)
        syncProgramInList(updated)
        const refreshed = await getAdminProgramWorkflow(selectedProgramId)
        setWorkflow(refreshed)
        setForm(toFormState(refreshed.program))
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save this program.'
      setSaveError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (selectedProgramId === null || creatingNew) return
    const currentProgram = programs.find((program) => program.id === selectedProgramId)
    if (!currentProgram) return
    if (!window.confirm(`Delete ${currentProgram.name}? This cannot be undone.`)) return

    try {
      await deleteProgram(selectedProgramId)
      const nextPrograms = programs.filter((program) => program.id !== selectedProgramId)
      setPrograms(nextPrograms)
      setWorkflow(null)
      setSelectedProgramId(nextPrograms[0]?.id ?? null)
      setCreatingNew(false)
    } catch {
      setError('Failed to delete program.')
    }
  }

  const handleAddParticipant = async () => {
    if (selectedProgramId === null || creatingNew || capacityReached) return

    setParticipantSaving(true)
    setParticipantError('')
    try {
      await addAdminProgramParticipant(selectedProgramId, participantForm)
      const refreshed = await getAdminProgramWorkflow(selectedProgramId)
      setWorkflow(refreshed)
      syncProgramInList(refreshed.program)
      setParticipantForm({})
      setParticipantSearch('')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not add this participant.'
      setParticipantError(message)
    } finally {
      setParticipantSaving(false)
    }
  }

  const handleRemoveParticipant = async (participant: ManagedParticipant) => {
    if (selectedProgramId === null || creatingNew) return
    if (!window.confirm(`Remove ${participant.name} from this program?`)) return

    setRemovingParticipantId(participant.id)
    setParticipantError('')
    try {
      await removeAdminProgramParticipant(selectedProgramId, participant.id)
      const refreshed = await getAdminProgramWorkflow(selectedProgramId)
      setWorkflow(refreshed)
      syncProgramInList(refreshed.program)
    } catch {
      setParticipantError('Could not remove this participant.')
    } finally {
      setRemovingParticipantId(null)
    }
  }

  const participantCanSubmit =
    !capacityReached &&
    ((participantMode === 'USER' && Boolean(participantForm.userId)) ||
      (participantMode === 'PLAYER' && Boolean(participantForm.playerProfileId)) ||
      (participantMode === 'MANUAL' &&
        Boolean(participantForm.manualName?.trim()) &&
        Boolean(participantForm.manualEmail?.trim())))

  const currentProgramTitle =
    creatingNew ? 'New Program' : workflow?.program.name ?? 'Program Workspace'

  if (loading) return <LoadingSpinner label="Loading programs..." />

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-8 px-8 py-4 mb-6 bg-gray-950/95 backdrop-blur border-b border-gray-900">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-white text-3xl font-black">Programs</h1>
            <p className="text-gray-400 text-sm mt-1">
              Create programs, set schedules, and manage participants in one workspace.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-2.5 rounded-lg text-sm shadow-lg shadow-green-500/10"
          >
            + New Program
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <label className="block text-gray-400 text-sm mb-2">Find program</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, slug, or location"
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          {filteredPrograms.length === 0 ? (
            <EmptyState
              icon="Schedule"
              title="No programs yet"
              description="Create your first program to start scheduling and managing participants."
            />
          ) : (
            <div className="space-y-3">
              {filteredPrograms.map((program) => {
                const selected = !creatingNew && selectedProgramId === program.id
                const count = selected
                  ? workflow?.participantCount ?? program.participantCount ?? 0
                  : program.participantCount ?? 0
                const programCapacity = Math.max(1, Number(program.capacity ?? 20))

                return (
                  <button
                    key={program.id}
                    type="button"
                    onClick={() => openProgram(program.id)}
                    className={`w-full text-left bg-gray-900 border rounded-xl p-4 transition-colors ${
                      selected ? 'border-cyan-500/50' : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-semibold truncate">{program.name}</p>
                          {program.status ? <StatusBadge status={program.status} /> : null}
                        </div>
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                          {program.shortDescription || 'No short description yet.'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">#{program.displayOrder}</span>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs">
                      <p className="text-gray-500">{formatSchedule(program.startAt, program.endAt)}</p>
                      <p className="text-gray-500">
                        {count} / {programCapacity} participants
                        {program.location ? `, ${program.location}` : ''}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {creatingNew || selectedProgramId !== null ? (
            <>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-2">
                      Program Workspace
                    </p>
                    <h2 className="text-white text-2xl font-black">{currentProgramTitle}</h2>
                    <p className="text-gray-400 text-sm mt-2">
                      Update the details, schedule, and participant limit from one place.
                    </p>
                  </div>
                  {!creatingNew && workflow ? (
                    <div className="text-right">
                      <p className="text-gray-500 text-xs">Current capacity</p>
                      <p className="text-white font-semibold">
                        {workflow.participantCount} / {Math.max(1, Number(workflow.program.capacity ?? 20))}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {workspaceLoading ? (
                <LoadingSpinner label="Loading program workspace..." />
              ) : (
                <div className="space-y-6">
                  {saveError ? (
                    <ErrorBanner message={saveError} onDismiss={() => setSaveError('')} />
                  ) : null}

                  <form onSubmit={handleSave} className="space-y-6">
                    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                        <div>
                          <h3 className="text-white font-bold text-xl">Details</h3>
                          <p className="text-gray-400 text-sm mt-1">
                            Core information, pricing, and visibility.
                          </p>
                        </div>
                        <StatusBadge status={form.status} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Program Name</label>
                          <input
                            required
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="Elite Finishing Program"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Slug</label>
                          <input
                            required
                            value={form.slug}
                            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="elite-finishing-program"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-gray-400 text-sm mb-1">Short Description</label>
                          <input
                            value={form.shortDescription}
                            onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="A quick summary for cards and previews"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-gray-400 text-sm mb-1">Description</label>
                          <textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm resize-none"
                            placeholder="Describe what this program covers and who it helps."
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Location</label>
                          <input
                            value={form.location}
                            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="Columbus, Ohio"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Who It Is For</label>
                          <input
                            value={form.whoItsFor}
                            onChange={(e) => setForm((prev) => ({ ...prev, whoItsFor: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="Ages 10 to 16, serious development focus"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Price</label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.price}
                            onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) || 0 }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Price Label</label>
                          <input
                            value={form.priceLabel}
                            onChange={(e) => setForm((prev) => ({ ...prev, priceLabel: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="per player"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Duration in Minutes</label>
                          <input
                            type="number"
                            min={15}
                            step={15}
                            value={form.durationMinutes}
                            onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) || 60 }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Capacity</label>
                          <input
                            type="number"
                            min={1}
                            value={form.capacity}
                            onChange={(e) => setForm((prev) => ({ ...prev, capacity: Math.max(1, Number(e.target.value) || 1) }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Status</label>
                          <select
                            value={form.status}
                            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                          >
                            {PROGRAM_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Display Order</label>
                          <input
                            type="number"
                            min={0}
                            value={form.displayOrder}
                            onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: Math.max(0, Number(e.target.value) || 0) }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Icon Label</label>
                          <input
                            value={form.icon}
                            onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="Soccer"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-gray-400 text-sm mb-1">Features</label>
                          <textarea
                            rows={5}
                            value={form.featuresText}
                            onChange={(e) => setForm((prev) => ({ ...prev, featuresText: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm resize-none"
                            placeholder={'One feature per line\nFocused technical work\nClear weekly progress'}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 text-sm text-gray-300">
                            <input
                              type="checkbox"
                              checked={form.active}
                              onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                              className="w-4 h-4 accent-green-500"
                            />
                            Visible on the public site
                          </label>
                        </div>
                      </div>
                    </section>

                    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                      <div className="mb-5">
                        <h3 className="text-white font-bold text-xl">Schedule</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Set the start and end window for this program.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Start Date</label>
                          <DatePickerField value={form.startDate} onChange={(value) => setForm((prev) => ({ ...prev, startDate: value }))} />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Start Time</label>
                          <input
                            type="time"
                            value={form.startTime}
                            onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">End Date</label>
                          <DatePickerField value={form.endDate} onChange={(value) => setForm((prev) => ({ ...prev, endDate: value }))} />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">End Time</label>
                          <input
                            type="time"
                            value={form.endTime}
                            onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                    </section>

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="text-sm text-gray-500">
                        {creatingNew ? 'Create the program first, then add participants.' : 'Save changes to keep the schedule and details in sync.'}
                      </div>
                      <div className="flex items-center gap-3">
                        {creatingNew ? (
                          <button
                            type="button"
                            onClick={cancelCreate}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleDelete}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-5 py-2 rounded-lg text-sm"
                          >
                            Delete Program
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-2 rounded-lg text-sm disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : creatingNew ? 'Create Program' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </form>

                  <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                      <div>
                        <h3 className="text-white font-bold text-xl">Participants</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Add registered users, player profiles, or manual guest entries.
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-xs">Current count</p>
                        <p className="text-white font-semibold">
                          {participantCount} / {capacity}
                        </p>
                      </div>
                    </div>

                    {participantError ? (
                      <div className="mb-4">
                        <ErrorBanner
                          message={participantError}
                          onDismiss={() => setParticipantError('')}
                        />
                      </div>
                    ) : null}

                    {creatingNew ? (
                      <div className="bg-black border border-gray-800 rounded-xl px-4 py-5 text-sm text-gray-400">
                        Save the program first, then add participants.
                      </div>
                    ) : (
                      <>
                        <div className="bg-black border border-gray-800 rounded-xl p-4 mb-5">
                          <div className="flex items-center gap-2 flex-wrap mb-4">
                            {PARTICIPANT_MODES.map((mode) => {
                              const label =
                                mode === 'USER'
                                  ? 'Existing User'
                                  : mode === 'PLAYER'
                                    ? 'Player Profile'
                                    : 'Manual Entry'
                              return (
                                <button
                                  key={mode}
                                  type="button"
                                  onClick={() => {
                                    setParticipantMode(mode)
                                    setParticipantForm({})
                                    setParticipantSearch('')
                                  }}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    participantMode === mode
                                      ? 'bg-cyan-500 text-black'
                                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                  }`}
                                >
                                  {label}
                                </button>
                              )
                            })}
                          </div>

                          {capacityReached ? (
                            <div className="mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
                              Capacity has been reached. Increase the program capacity to add more participants.
                            </div>
                          ) : null}

                          {(participantMode === 'USER' || participantMode === 'PLAYER') && (
                            <>
                              <label className="block text-gray-400 text-sm mb-1">Search</label>
                              <input
                                type="text"
                                value={participantSearch}
                                onChange={(e) => setParticipantSearch(e.target.value)}
                                placeholder={
                                  participantMode === 'USER'
                                    ? 'Search users by name or email'
                                    : 'Search players by name or parent email'
                                }
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm mb-4"
                              />
                            </>
                          )}

                          {participantMode === 'USER' ? (
                            <div>
                              <label className="block text-gray-400 text-sm mb-1">Select User</label>
                              <select
                                value={participantForm.userId ?? ''}
                                onChange={(e) =>
                                  setParticipantForm({
                                    userId: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                              >
                                <option value="">Choose a user</option>
                                {filteredUsers.map((user) => (
                                  <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : null}

                          {participantMode === 'PLAYER' ? (
                            <div>
                              <label className="block text-gray-400 text-sm mb-1">Select Player</label>
                              <select
                                value={participantForm.playerProfileId ?? ''}
                                onChange={(e) =>
                                  setParticipantForm({
                                    playerProfileId: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                              >
                                <option value="">Choose a player</option>
                                {filteredPlayers.map((player) => (
                                  <option key={player.id} value={player.id}>
                                    {player.name} ({player.parentUserEmail})
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : null}

                          {participantMode === 'MANUAL' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-gray-400 text-sm mb-1">Name</label>
                                <input
                                  value={participantForm.manualName ?? ''}
                                  onChange={(e) =>
                                    setParticipantForm((prev) => ({ ...prev, manualName: e.target.value }))
                                  }
                                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                                  placeholder="Guest participant name"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-400 text-sm mb-1">Email</label>
                                <input
                                  type="email"
                                  value={participantForm.manualEmail ?? ''}
                                  onChange={(e) =>
                                    setParticipantForm((prev) => ({ ...prev, manualEmail: e.target.value }))
                                  }
                                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                                  placeholder="guest@example.com"
                                />
                              </div>
                            </div>
                          ) : null}

                          <div className="mt-4 flex justify-end">
                            <button
                              type="button"
                              disabled={!participantCanSubmit || participantSaving}
                              onClick={handleAddParticipant}
                              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                            >
                              {participantSaving ? 'Adding...' : 'Add Participant'}
                            </button>
                          </div>
                        </div>

                        {workflow?.participants.length ? (
                          <div className="space-y-3">
                            {workflow.participants.map((participant) => (
                              <div
                                key={participant.id}
                                className="bg-black border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                              >
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-white font-medium">{participant.name}</p>
                                    <StatusBadge status={participant.participantType} />
                                  </div>
                                  <p className="text-gray-400 text-sm mt-1">
                                    {participant.email || 'No email provided'}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  disabled={removingParticipantId === participant.id}
                                  onClick={() => handleRemoveParticipant(participant)}
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                                >
                                  {removingParticipantId === participant.id ? 'Removing...' : 'Remove'}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-black border border-dashed border-gray-800 rounded-xl px-4 py-8 text-center text-sm text-gray-500">
                            No participants yet. Add someone from the options above.
                          </div>
                        )}
                      </>
                    )}
                  </section>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon="Schedule"
              title="Select a program"
              description="Choose a program from the list to manage details, scheduling, and participants."
            />
          )}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  addAdminEventParticipant,
  createEvent,
  createMediaPost,
  deleteEvent,
  getAdminEventWorkflow,
  getAdminEvents,
  getAdminPlayers,
  getAdminUsers,
  removeAdminEventParticipant,
  updateEvent,
} from '../../services/api'
import type {
  AdminUser,
  Event,
  EventWorkflow,
  ManagedParticipant,
  ParticipantAssignmentFormData,
  PlayerProfile,
} from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'
import StatusBadge from '../../components/StatusBadge'
import DatePickerField from '../../components/DatePickerField'
import SocialSharePanel from '../../components/SocialSharePanel'

const EVENT_STATUSES = ['UPCOMING', 'ACTIVE', 'COMPLETED'] as const
const EVENT_TYPES = ['CAMP', 'CLINIC', 'WORKSHOP', 'TRYOUT', 'TOURNAMENT', 'OTHER'] as const
const PARTICIPANT_MODES = ['USER', 'PLAYER', 'MANUAL'] as const

type ParticipantMode = (typeof PARTICIPANT_MODES)[number]

type EventFormState = {
  title: string
  description: string
  location: string
  venue: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  capacity: number
  status: string
  type: string
  ageGroup: string
  intensity: string
  coachName: string
  primaryMediaUrl: string
  secondaryMediaUrl: string
  price: number
  featured: boolean
  active: boolean
  displayOrder: number
}

const emptyForm: EventFormState = {
  title: '',
  description: '',
  location: '',
  venue: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  capacity: 20,
  status: 'UPCOMING',
  type: 'CAMP',
  ageGroup: '',
  intensity: '',
  coachName: '',
  primaryMediaUrl: '',
  secondaryMediaUrl: '',
  price: 0,
  featured: false,
  active: true,
  displayOrder: 0,
}

function splitDateTime(value?: string, fallbackDate?: string) {
  if (!value) return { date: fallbackDate ?? '', time: '' }
  return { date: value.slice(0, 10), time: value.length >= 16 ? value.slice(11, 16) : '' }
}

function combineDateTime(date: string, time: string) {
  if (!date) return undefined
  return `${date}T${time || '00:00'}`
}

function toFormState(event?: Event): EventFormState {
  if (!event) return emptyForm
  const start = splitDateTime(event.startAt, event.startDate)
  const end = splitDateTime(event.endAt, event.endDate)
  return {
    title: event.title ?? '',
    description: event.description ?? '',
    location: event.location ?? '',
    venue: event.venue ?? '',
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    capacity: Number(event.capacity ?? event.spotsTotal ?? 20),
    status: event.status ?? 'UPCOMING',
    type: event.type ?? 'CAMP',
    ageGroup: event.ageGroup ?? '',
    intensity: event.intensity ?? '',
    coachName: event.coachName ?? '',
    primaryMediaUrl: event.primaryMediaUrl ?? '',
    secondaryMediaUrl: event.secondaryMediaUrl ?? '',
    price: Number(event.price ?? 0),
    featured: event.featured ?? false,
    active: event.active ?? true,
    displayOrder: Number(event.displayOrder ?? 0),
  }
}

function buildEventPayload(form: EventFormState): Partial<Event> {
  const startAt = combineDateTime(form.startDate, form.startTime)
  const endAt = combineDateTime(form.endDate, form.endTime)
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    location: form.location.trim(),
    venue: form.venue.trim(),
    startDate: form.startDate,
    endDate: form.endDate || undefined,
    startAt,
    endAt,
    capacity: Math.max(1, Number(form.capacity) || 20),
    spotsTotal: Math.max(1, Number(form.capacity) || 20),
    status: form.status,
    type: form.type,
    ageGroup: form.ageGroup.trim(),
    intensity: form.intensity.trim(),
    coachName: form.coachName.trim() || undefined,
    primaryMediaUrl: form.primaryMediaUrl.trim() || undefined,
    secondaryMediaUrl: form.secondaryMediaUrl.trim() || undefined,
    price: Number(form.price) || 0,
    featured: form.featured,
    active: form.active,
    displayOrder: Math.max(0, Number(form.displayOrder) || 0),
  }
}

function EventMediaPreview({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src) {
    return <span className="text-sm text-gray-500">No {label.toLowerCase()} selected</span>
  }

  if (failed) {
    return (
      <div className="px-4 text-center">
        <p className="text-sm font-semibold text-red-300">Image could not load.</p>
        <p className="mt-2 break-all text-xs text-gray-500">{src}</p>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={`${label} preview`}
      onError={() => setFailed(true)}
      className="h-full w-full object-contain"
    />
  )
}

function formatSchedule(startAt?: string, endAt?: string, startDate?: string, endDate?: string) {
  if (!startAt && !endAt && !startDate && !endDate) return 'Schedule not set'
  if (startAt || endAt) {
    const start = startAt ? new Date(startAt) : null
    const end = endAt ? new Date(endAt) : null
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
    if (start && end) return `${start.toLocaleString([], options)} to ${end.toLocaleString([], options)}`
    if (start) return `Starts ${start.toLocaleString([], options)}`
    return `Ends ${end?.toLocaleString([], options)}`
  }
  return endDate && endDate !== startDate ? `${startDate} to ${endDate}` : (startDate ?? 'Schedule not set')
}

export default function AdminEventsWorkspacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [workflow, setWorkflow] = useState<EventWorkflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [participantError, setParticipantError] = useState('')
  const [saving, setSaving] = useState(false)
  const [mediaUploadingSlot, setMediaUploadingSlot] = useState<'primary' | 'secondary' | null>(null)
  const [participantSaving, setParticipantSaving] = useState(false)
  const [removingParticipantId, setRemovingParticipantId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE')
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [creatingNew, setCreatingNew] = useState(false)
  const [form, setForm] = useState<EventFormState>(emptyForm)
  const [participantMode, setParticipantMode] = useState<ParticipantMode>('USER')
  const [participantSearch, setParticipantSearch] = useState('')
  const [participantForm, setParticipantForm] = useState<ParticipantAssignmentFormData>({})

  const filteredEvents = useMemo(() => events.filter((event) => {
    if (visibilityFilter === 'ACTIVE' && event.active === false) return false
    if (visibilityFilter === 'ARCHIVED' && event.active !== false) return false
    const term = search.trim().toLowerCase()
    if (!term) return true
    return event.title.toLowerCase().includes(term) || event.location.toLowerCase().includes(term) || (event.type ?? '').toLowerCase().includes(term)
  }), [events, search, visibilityFilter])

  const filteredUsers = useMemo(() => users.filter((user) => {
    const term = participantSearch.trim().toLowerCase()
    if (!term) return true
    return user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
  }).slice(0, 50), [participantSearch, users])

  const filteredPlayers = useMemo(() => players.filter((player) => {
    const term = participantSearch.trim().toLowerCase()
    if (!term) return true
    return (
      player.name.toLowerCase().includes(term) ||
      (player.parentUserEmail ?? '').toLowerCase().includes(term)
    )
  }).slice(0, 50), [participantSearch, players])


  useEffect(() => {
    document.title = 'Events | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([getAdminEvents(), getAdminUsers(), getAdminPlayers()])
      .then(([eventData, userData, playerData]) => {
        setEvents(eventData)
        setUsers(userData)
        setPlayers(playerData)
        const firstActive = eventData.find((event) => event.active !== false)
        if (firstActive) setSelectedEventId(firstActive.id)
      })
      .catch(() => setError('Failed to load event scheduling.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (creatingNew || selectedEventId === null) {
      setWorkflow(null)
      return
    }

    setWorkspaceLoading(true)
    getAdminEventWorkflow(selectedEventId)
      .then((data) => {
        setWorkflow(data)
        setForm(toFormState(data.event))
        setSaveError('')
        setParticipantError('')
      })
      .catch(() => setError('Failed to load this event workspace.'))
      .finally(() => setWorkspaceLoading(false))
  }, [creatingNew, selectedEventId])

  const participantCount = workflow?.participantCount ?? 0
  const capacity = Math.max(1, Number(form.capacity) || 20)
  const capacityReached = workflow?.capacityReached ?? participantCount >= capacity

  const syncEventInList = (event: Event) => {
    setEvents((prev) => {
      const exists = prev.some((item) => item.id === event.id)
      if (!exists) return [event, ...prev]
      return prev.map((item) => (item.id === event.id ? event : item))
    })
  }

  const openCreate = () => {
    setCreatingNew(true)
    setSelectedEventId(null)
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

  const openEvent = (eventId: number) => {
    setCreatingNew(false)
    setSelectedEventId(eventId)
  }

  const cancelCreate = () => {
    setCreatingNew(false)
    setSaveError('')
    if (events.length > 0) setSelectedEventId(events[0].id)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      const payload = buildEventPayload(form)
      if (creatingNew) {
        const created = await createEvent(payload)
        syncEventInList(created)
        setCreatingNew(false)
        setSelectedEventId(created.id)
      } else if (selectedEventId !== null) {
        const updated = await updateEvent(selectedEventId, payload)
        syncEventInList(updated)
        const refreshed = await getAdminEventWorkflow(selectedEventId)
        setWorkflow(refreshed)
        setForm(toFormState(refreshed.event))
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save this event.'
      setSaveError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleMediaUpload = async (slot: 'primary' | 'secondary', file?: File) => {
    if (!file) return

    setMediaUploadingSlot(slot)
    setSaveError('')
    try {
      const media = await createMediaPost(
        file,
        `${form.title || 'Summer Training'} promotional poster`,
        'TRAINING_PHOTO',
        `${form.title || 'Summer Training'} ${slot === 'primary' ? 'primary' : 'secondary'} promotional poster`,
      )
      const field = slot === 'primary' ? 'primaryMediaUrl' : 'secondaryMediaUrl'
      setForm((prev) => ({ ...prev, [field]: media.mediaUrl }))
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not upload this event image.'
      setSaveError(message)
    } finally {
      setMediaUploadingSlot(null)
    }
  }

  const handleDelete = async () => {
    if (selectedEventId === null || creatingNew) return
    const currentEvent = events.find((event) => event.id === selectedEventId)
    if (!currentEvent) return
    if (!window.confirm(`Delete ${currentEvent.title}? This cannot be undone.`)) return

    try {
      await deleteEvent(selectedEventId)
      const nextEvents = events.filter((event) => event.id !== selectedEventId)
      setEvents(nextEvents)
      setWorkflow(null)
      setSelectedEventId(nextEvents[0]?.id ?? null)
      setCreatingNew(false)
    } catch {
      setError('Failed to delete event.')
    }
  }

  const handleAddParticipant = async () => {
    if (selectedEventId === null || creatingNew || capacityReached) return

    setParticipantSaving(true)
    setParticipantError('')
    try {
      await addAdminEventParticipant(selectedEventId, participantForm)
      const refreshed = await getAdminEventWorkflow(selectedEventId)
      setWorkflow(refreshed)
      syncEventInList(refreshed.event)
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
    if (selectedEventId === null || creatingNew) return
    if (!window.confirm(`Remove ${participant.name} from this event?`)) return

    setRemovingParticipantId(participant.id)
    setParticipantError('')
    try {
      await removeAdminEventParticipant(selectedEventId, participant.id)
      const refreshed = await getAdminEventWorkflow(selectedEventId)
      setWorkflow(refreshed)
      syncEventInList(refreshed.event)
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

  const currentEventTitle = creatingNew ? 'New Event' : workflow?.event.title ?? 'Event Workspace'
  const shareableEvent = workflow?.event
  const eventShareText = shareableEvent
    ? [
        shareableEvent.description,
        shareableEvent.price ? `Register online. Price: $${shareableEvent.price}.` : 'Register online with Kante Elite Training.',
      ].filter(Boolean).join(' ')
    : undefined

  if (loading) return <LoadingSpinner label="Loading events..." />

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-8 px-8 py-4 mb-6 bg-gray-950/95 backdrop-blur border-b border-gray-900">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-white text-3xl font-black">Events</h1>
            <p className="text-gray-400 text-sm mt-1">
              Create events, set schedules, and manage participants from one workflow.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-2.5 rounded-lg text-sm shadow-lg shadow-green-500/10"
          >
            + New Event
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
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-gray-800 bg-black p-1">
              {(['ACTIVE', 'ARCHIVED'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setVisibilityFilter(filter)}
                  className={`rounded-md px-3 py-2 text-xs font-bold uppercase transition-colors ${
                    visibilityFilter === filter
                      ? 'bg-amber-500 text-black'
                      : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                  }`}
                >
                  {filter === 'ACTIVE' ? 'Active' : 'Archived'}
                </button>
              ))}
            </div>
            <label className="block text-gray-400 text-sm mb-2">Find event</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, location, or type"
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          {filteredEvents.length === 0 ? (
            <EmptyState
              icon="Calendar"
              title="No events yet"
              description="Create your first event to start scheduling and tracking attendance."
            />
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const selected = !creatingNew && selectedEventId === event.id
                const count = selected
                  ? workflow?.participantCount ?? event.participantCount ?? 0
                  : event.participantCount ?? 0
                const eventCapacity = Math.max(1, Number(event.capacity ?? event.spotsTotal ?? 20))

                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => openEvent(event.id)}
                    className={`w-full text-left bg-gray-900 border rounded-xl p-4 transition-colors ${
                      selected ? 'border-cyan-500/50' : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-semibold truncate">{event.title}</p>
                          <StatusBadge status={event.status} />
                        </div>
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                          {event.description || 'No event description yet.'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">{event.type}</span>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs">
                      <p className="text-gray-500">
                        {formatSchedule(event.startAt, event.endAt, event.startDate, event.endDate)}
                      </p>
                      <p className="text-gray-500">
                        {count} / {eventCapacity} participants
                        {event.location ? `, ${event.location}` : ''}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {creatingNew || selectedEventId !== null ? (
            <>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs uppercase text-amber-500 mb-2">
                      Event Workspace
                    </p>
                    <h2 className="text-white text-2xl font-black">{currentEventTitle}</h2>
                    <p className="text-gray-400 text-sm mt-2">
                      Update the event details, schedule, and participant limit from one place.
                    </p>
                  </div>
                  {!creatingNew && workflow ? (
                    <div className="text-right">
                      <p className="text-gray-500 text-xs">Current capacity</p>
                      <p className="text-white font-semibold">
                        {workflow.participantCount} / {Math.max(1, Number(workflow.event.capacity ?? workflow.event.spotsTotal ?? 20))}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {workspaceLoading ? (
                <LoadingSpinner label="Loading event workspace..." />
              ) : (
                <div className="space-y-6">
                  {saveError ? (
                    <ErrorBanner message={saveError} onDismiss={() => setSaveError('')} />
                  ) : null}

                  {!creatingNew && shareableEvent ? (
                    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                      <div className="mb-4">
                        <p className="text-xs font-black uppercase text-amber-500">Promote Event</p>
                        <h3 className="mt-1 text-xl font-bold text-white">Share this event</h3>
                        <p className="mt-1 text-sm text-gray-400">
                          Use this to post the event to Instagram Stories, Snapchat, Facebook, or send the registration link directly.
                        </p>
                      </div>
                      <SocialSharePanel
                        title={shareableEvent.title}
                        text={eventShareText}
                        url={`/events/${shareableEvent.id}/register`}
                        imageUrl={form.primaryMediaUrl || shareableEvent.primaryMediaUrl || shareableEvent.mediaUrls?.[0]}
                        imageType="IMAGE"
                        variant="compact"
                      />
                    </section>
                  ) : null}

                  <form onSubmit={handleSave} className="space-y-6">
                    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                        <div>
                          <h3 className="text-white font-bold text-xl">Details</h3>
                          <p className="text-gray-400 text-sm mt-1">
                            Core event information, type, and attendance settings.
                          </p>
                        </div>
                        <StatusBadge status={form.status} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-gray-400 text-sm mb-1">Event Title</label>
                          <input
                            required
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="Summer Skills Clinic"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-gray-400 text-sm mb-1">Description</label>
                          <textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm resize-none"
                            placeholder="Describe the event and what participants should expect."
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Location</label>
                          <input
                            required
                            value={form.location}
                            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="Columbus, Ohio"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Venue</label>
                          <input
                            required
                            value={form.venue}
                            onChange={(e) => setForm((prev) => ({ ...prev, venue: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="Training Ground A"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Type</label>
                          <select
                            value={form.type}
                            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                          >
                            {EVENT_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Status</label>
                          <select
                            value={form.status}
                            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                          >
                            {EVENT_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Age Group</label>
                          <input
                            value={form.ageGroup}
                            onChange={(e) => setForm((prev) => ({ ...prev, ageGroup: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="U12 to U16"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Intensity</label>
                          <input
                            value={form.intensity}
                            onChange={(e) => setForm((prev) => ({ ...prev, intensity: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="High"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Lead Coach</label>
                          <input
                            value={form.coachName}
                            onChange={(e) => setForm((prev) => ({ ...prev, coachName: e.target.value }))}
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="e.g. Coach Kante"
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
                          <label className="flex items-center gap-2 text-sm text-gray-300">
                            <input
                              type="checkbox"
                              checked={form.featured}
                              onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                              className="w-4 h-4 accent-amber-500"
                            />
                            Featured event
                          </label>
                        </div>

                        <div>
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
                        <h3 className="text-white font-bold text-xl">Event Media</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Upload the Summer Training promotional posters here, then save changes so they appear on the public pages.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="rounded-xl border border-gray-800 bg-black p-4">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div>
                              <p className="text-white font-semibold">Primary poster</p>
                              <p className="text-gray-500 text-xs">Used first on Events and featured cards.</p>
                            </div>
                            {mediaUploadingSlot === 'primary' ? (
                              <span className="text-xs font-bold uppercase text-amber-400">Uploading...</span>
                            ) : null}
                          </div>

                          <div className="mb-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
                            <EventMediaPreview src={form.primaryMediaUrl} label="Primary event promotional poster" />
                          </div>

                          <label className="block text-gray-400 text-sm mb-1">Upload image</label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={mediaUploadingSlot !== null}
                            onChange={(e) => handleMediaUpload('primary', e.target.files?.[0])}
                            className="mb-3 block w-full text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-2 file:text-sm file:font-bold file:text-black hover:file:bg-amber-400 disabled:opacity-50"
                          />

                          <label className="block text-gray-400 text-sm mb-1">Image URL</label>
                          <input
                            value={form.primaryMediaUrl}
                            onChange={(e) => setForm((prev) => ({ ...prev, primaryMediaUrl: e.target.value }))}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="/api/uploads/media/example.jpg"
                          />
                        </div>

                        <div className="rounded-xl border border-gray-800 bg-black p-4">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div>
                              <p className="text-white font-semibold">Secondary poster</p>
                              <p className="text-gray-500 text-xs">Used as supporting promo media.</p>
                            </div>
                            {mediaUploadingSlot === 'secondary' ? (
                              <span className="text-xs font-bold uppercase text-amber-400">Uploading...</span>
                            ) : null}
                          </div>

                          <div className="mb-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
                            <EventMediaPreview src={form.secondaryMediaUrl} label="Secondary event promotional poster" />
                          </div>

                          <label className="block text-gray-400 text-sm mb-1">Upload image</label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={mediaUploadingSlot !== null}
                            onChange={(e) => handleMediaUpload('secondary', e.target.files?.[0])}
                            className="mb-3 block w-full text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-2 file:text-sm file:font-bold file:text-black hover:file:bg-amber-400 disabled:opacity-50"
                          />

                          <label className="block text-gray-400 text-sm mb-1">Image URL</label>
                          <input
                            value={form.secondaryMediaUrl}
                            onChange={(e) => setForm((prev) => ({ ...prev, secondaryMediaUrl: e.target.value }))}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="/api/uploads/media/example.jpg"
                          />
                        </div>
                      </div>
                    </section>

                    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                      <div className="mb-5">
                        <h3 className="text-white font-bold text-xl">Schedule</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Set the event date and time window.
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
                        {creatingNew ? 'Create the event first, then add participants.' : 'Save changes to keep the schedule and participant count aligned.'}
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
                            Delete Event
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={saving || mediaUploadingSlot !== null}
                          className="bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-2 rounded-lg text-sm disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : creatingNew ? 'Create Event' : 'Save Changes'}
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
                        Save the event first, then add participants.
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
                                      ? 'bg-amber-500 text-black'
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
                              Capacity has been reached. Increase event capacity to add more participants.
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
                                    {player.name} ({player.parentUserEmail ?? 'No parent account'})
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
                              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
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
              icon="Calendar"
              title="Select an event"
              description="Choose an event from the list to manage details, scheduling, and participants."
            />
          )}
        </div>
      </div>
    </div>
  )
}

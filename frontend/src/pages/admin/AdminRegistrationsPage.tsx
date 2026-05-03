import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  buildAdminRegistrationsCsvUrl,
  cancelRegistration,
  createAdminRegistration,
  deleteAdminRegistration,
  getAdminEvents,
  getAdminPrograms,
  getAdminRegistrations,
  updateAdminRegistration,
  updateUnifiedRegistrationPaymentStatus,
  updateUnifiedRegistrationStatus,
} from '../../services/api'
import { useSearchParams } from 'react-router-dom'
import type {
  Event,
  Program,
  Registration,
  RegistrationFormData,
  RegistrationOfferingType,
  RegistrationPaymentStatus,
  RegistrationStatus,
  TrainingSession,
} from '../../types'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'
import LoadingSpinner from '../../components/LoadingSpinner'

const statuses: RegistrationStatus[] = ['PENDING', 'CONFIRMED', 'WAITLISTED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']
const paymentStatuses: RegistrationPaymentStatus[] = ['NOT_REQUIRED', 'UNPAID', 'PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED', 'WAIVED']
const registrationTypes = ['PROGRAM_BOOKING', 'EVENT_REGISTRATION', 'ADMIN_ENTRY'] as const

const emptyForm: RegistrationFormData = {
  registrationType: 'EVENT_REGISTRATION',
  status: 'CONFIRMED',
  paymentStatus: 'UNPAID',
  participantName: '',
  participantAge: '',
  participantEmail: '',
  participantPhone: '',
  guardianName: '',
  guardianEmail: '',
  guardianPhone: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  medicalNotes: '',
  experienceLevel: '',
  scheduledDate: '',
  scheduledStartTime: '',
  scheduledEndTime: '',
  timezone: 'America/Chicago',
  priceAmount: '',
  amountPaid: '',
  currency: 'USD',
  waiverAccepted: false,
  customerNotes: '',
  adminNotes: '',
}

function formatDate(value?: string) {
  if (!value) return 'Unscheduled'
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusClass(status: RegistrationStatus) {
  switch (status) {
    case 'CONFIRMED':
      return 'border-green-500/30 bg-green-500/10 text-green-300'
    case 'WAITLISTED':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    case 'CANCELLED':
      return 'border-red-500/30 bg-red-500/10 text-red-300'
    case 'COMPLETED':
      return 'border-blue-500/30 bg-blue-500/10 text-blue-300'
    case 'NO_SHOW':
      return 'border-gray-500/30 bg-gray-500/10 text-gray-300'
    default:
      return 'border-white/15 bg-white/5 text-white'
  }
}

function toRegistrationForm(registration: Registration): RegistrationFormData {
  return {
    programId: registration.programId,
    eventId: registration.eventId,
    trainingSessionId: registration.trainingSessionId,
    registrationType: registration.registrationType,
    status: registration.status,
    paymentStatus: registration.paymentStatus,
    participantName: registration.participantName,
    participantAge: registration.participantAge ?? '',
    participantEmail: registration.participantEmail ?? '',
    participantPhone: registration.participantPhone ?? '',
    guardianName: registration.guardianName ?? '',
    guardianEmail: registration.guardianEmail,
    guardianPhone: registration.guardianPhone ?? '',
    emergencyContactName: registration.emergencyContactName ?? '',
    emergencyContactPhone: registration.emergencyContactPhone ?? '',
    medicalNotes: registration.medicalNotes ?? '',
    experienceLevel: registration.experienceLevel ?? '',
    scheduledDate: registration.scheduledDate ?? '',
    scheduledStartTime: registration.scheduledStartTime ?? '',
    scheduledEndTime: registration.scheduledEndTime ?? '',
    timezone: registration.timezone ?? 'America/Chicago',
    priceAmount: registration.priceAmount ?? '',
    amountPaid: registration.amountPaid ?? '',
    currency: registration.currency ?? 'USD',
    waiverAccepted: registration.waiverAccepted,
    customerNotes: registration.customerNotes ?? '',
    adminNotes: registration.adminNotes ?? '',
  }
}

function cleanPayload(form: RegistrationFormData): RegistrationFormData {
  const payload: RegistrationFormData = {
    ...form,
    participantName: form.participantName.trim(),
    guardianEmail: form.guardianEmail.trim(),
    priceAmount: form.priceAmount === '' ? undefined : Number(form.priceAmount),
    amountPaid: form.amountPaid === '' ? undefined : Number(form.amountPaid),
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (typeof value === 'string' && value.trim() === '') {
      delete payload[key as keyof RegistrationFormData]
    }
  })

  return payload
}

export default function AdminRegistrationsPage() {
  const [searchParams] = useSearchParams()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [typeFilter, setTypeFilter] = useState<RegistrationOfferingType | ''>('')
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | ''>((searchParams.get('status') as RegistrationStatus | null) ?? '')
  const [paymentFilter, setPaymentFilter] = useState<RegistrationPaymentStatus | ''>('')
  const [programFilter, setProgramFilter] = useState('')
  const [eventFilter, setEventFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null)
  const [formData, setFormData] = useState<RegistrationFormData>(emptyForm)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const activeFilters = useMemo(() => ({
    offeringType: typeFilter || undefined,
    status: statusFilter || undefined,
    paymentStatus: paymentFilter || undefined,
    programId: programFilter ? Number(programFilter) : undefined,
    eventId: eventFilter ? Number(eventFilter) : undefined,
    scheduledDate: dateFilter || undefined,
  }), [dateFilter, eventFilter, paymentFilter, programFilter, statusFilter, typeFilter])

  const loadRegistrations = useCallback(() => {
    setLoading(true)
    setError('')
    getAdminRegistrations(activeFilters)
      .then(setRegistrations)
      .catch(() => setError('Unable to load registrations.'))
      .finally(() => setLoading(false))
  }, [activeFilters])

  useEffect(() => {
    loadRegistrations()
  }, [loadRegistrations])

  useEffect(() => {
    Promise.all([getAdminPrograms(), getAdminEvents()])
      .then(([programData, eventData]) => {
        setPrograms(programData)
        setEvents(eventData)
      })
      .catch(() => {
        setPrograms([])
        setEvents([])
      })
  }, [])

  const filteredRegistrations = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return registrations
    return registrations.filter((registration) => [
      registration.registrationCode,
      registration.participantName,
      registration.guardianEmail,
      registration.guardianPhone,
      registration.programName,
      registration.eventTitle,
    ].some((value) => value?.toLowerCase().includes(needle)))
  }, [registrations, search])

  const eventSessions = useMemo(() => events.flatMap((event) =>
    (event.trainingSessions ?? []).map((session) => ({ ...session, eventTitle: session.eventTitle ?? event.title })),
  ), [events])

  const visibleIds = useMemo(() => filteredRegistrations.map((registration) => registration.id), [filteredRegistrations])
  const selectedVisibleCount = useMemo(
    () => selectedIds.filter((id) => visibleIds.includes(id)).length,
    [selectedIds, visibleIds],
  )
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length

  const totals = useMemo(() => ({
    all: registrations.length,
    confirmed: registrations.filter((r) => r.status === 'CONFIRMED').length,
    waitlisted: registrations.filter((r) => r.status === 'WAITLISTED').length,
    unpaid: registrations.filter((r) => ['UNPAID', 'PENDING', 'PARTIALLY_PAID'].includes(r.paymentStatus)).length,
  }), [registrations])

  async function applyStatus(id: number, status: RegistrationStatus) {
    setSavingId(id)
    setError('')
    try {
      const updated = await updateUnifiedRegistrationStatus(id, status)
      setRegistrations((prev) => prev.map((item) => (item.id === id ? updated : item)))
    } catch {
      setError('Unable to update registration status.')
    } finally {
      setSavingId(null)
    }
  }

  async function applyPaymentStatus(id: number, paymentStatus: RegistrationPaymentStatus) {
    setSavingId(id)
    setError('')
    try {
      const updated = await updateUnifiedRegistrationPaymentStatus(id, paymentStatus)
      setRegistrations((prev) => prev.map((item) => (item.id === id ? updated : item)))
    } catch {
      setError('Unable to update payment status.')
    } finally {
      setSavingId(null)
    }
  }

  async function cancel(id: number) {
    setSavingId(id)
    setError('')
    try {
      const updated = await cancelRegistration(id, 'Cancelled from admin registrations dashboard.')
      setRegistrations((prev) => prev.map((item) => (item.id === id ? updated : item)))
    } catch {
      setError('Unable to cancel registration.')
    } finally {
      setSavingId(null)
    }
  }

  function openCreateForm() {
    setEditingRegistration(null)
    setFormData(emptyForm)
    setFormOpen(true)
  }

  function openEditForm(registration: Registration) {
    setEditingRegistration(registration)
    setFormData(toRegistrationForm(registration))
    setFormOpen(true)
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingId(editingRegistration?.id ?? 0)
    setError('')
    try {
      const payload = cleanPayload(formData)
      const saved = editingRegistration
        ? await updateAdminRegistration(editingRegistration.id, payload)
        : await createAdminRegistration(payload)
      setRegistrations((prev) => editingRegistration
        ? prev.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...prev])
      setFormOpen(false)
      setEditingRegistration(null)
      setFormData(emptyForm)
    } catch {
      setError('Unable to save registration. Check required fields and capacity.')
    } finally {
      setSavingId(null)
    }
  }

  async function remove(id: number) {
    if (!window.confirm('Delete this registration permanently? This removes its admin history and payment records too.')) {
      return
    }
    setSavingId(id)
    setError('')
    try {
      await deleteAdminRegistration(id)
      setRegistrations((prev) => prev.filter((item) => item.id !== id))
    } catch {
      setError('Unable to delete registration.')
    } finally {
      setSavingId(null)
    }
  }

  function toggleSelected(id: number) {
    setSelectedIds((prev) => (
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    ))
  }

  function toggleAllVisible() {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleIds.includes(id))
      }
      return Array.from(new Set([...prev, ...visibleIds]))
    })
  }

  async function cancelSelected() {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Cancel ${selectedIds.length} selected registration${selectedIds.length === 1 ? '' : 's'}?`)) {
      return
    }

    setSavingId(0)
    setError('')
    try {
      const updates = await Promise.all(
        selectedIds.map((id) => cancelRegistration(id, 'Cancelled from admin bulk action.')),
      )
      setRegistrations((prev) => prev.map((item) => updates.find((updated) => updated.id === item.id) ?? item))
      setSelectedIds([])
    } catch {
      setError('Unable to cancel selected registrations.')
    } finally {
      setSavingId(null)
    }
  }

  async function deleteSelected() {
    if (selectedIds.length === 0) return
    const label = 'delete permanently'
    if (!window.confirm(`${label} ${selectedIds.length} selected registration${selectedIds.length === 1 ? '' : 's'}?`)) {
      return
    }

    setSavingId(0)
    setError('')
    try {
      await Promise.all(selectedIds.map((id) => deleteAdminRegistration(id)))
      setRegistrations((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
      setSelectedIds([])
    } catch {
      setError('Unable to delete selected registrations.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="section-label">Operations</span>
          <h1 className="mt-1 text-3xl font-black text-white">Registrations</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Manage program bookings, event signups, waitlists, payment state, and roster status from one shared system.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={openCreateForm} className="btn-primary justify-center px-5 py-3">
            Add Registration
          </button>
          <a href={buildAdminRegistrationsCsvUrl(activeFilters)} className="btn-secondary justify-center px-5 py-3">
            Export CSV
          </a>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ['Total', totals.all],
          ['Confirmed', totals.confirmed],
          ['Waitlisted', totals.waitlisted],
          ['Payment follow-up', totals.unpaid],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[#222] bg-[#111] p-4">
            <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#222] bg-[#111] p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.25fr_150px_150px_170px_170px_160px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search player, email, phone, program, or event"
            className="input-field-default"
          />
          <select
            value={typeFilter}
            onChange={(event) => {
              const next = event.target.value as RegistrationOfferingType | ''
              setTypeFilter(next)
              if (next === 'PROGRAM') setEventFilter('')
              if (next === 'EVENT') setProgramFilter('')
            }}
            className="select-field"
          >
            <option value="">All offerings</option>
            <option value="PROGRAM">Programs</option>
            <option value="EVENT">Events</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as RegistrationStatus | '')}
            className="select-field"
          >
            <option value="">All statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value as RegistrationPaymentStatus | '')}
            className="select-field"
          >
            <option value="">All payments</option>
            {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select
            value={programFilter}
            onChange={(event) => {
              setProgramFilter(event.target.value)
              if (event.target.value) {
                setTypeFilter('PROGRAM')
                setEventFilter('')
              }
            }}
            className="select-field"
          >
            <option value="">All programs</option>
            {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
          </select>
          <select
            value={eventFilter}
            onChange={(event) => {
              setEventFilter(event.target.value)
              if (event.target.value) {
                setTypeFilter('EVENT')
                setProgramFilter('')
              }
            }}
            className="select-field"
          >
            <option value="">All events</option>
            {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="input-field-default"
          />
        </div>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      {selectedIds.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-[#15110a] px-5 py-4 shadow-lg shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-black">
              {selectedIds.length}
            </span>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-white">
                {selectedIds.length === 1 ? 'Registration selected' : 'Registrations selected'}
              </p>
              <p className="text-xs text-amber-200/70">Choose an action for the selected rows.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={cancelSelected}
              disabled={savingId !== null}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-gray-200 transition hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={deleteSelected}
              disabled={savingId !== null}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Delete
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M5 7l1 14h12l1-14" />
                <path d="M9 7V4h6v3" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <LoadingSpinner size="lg" label="Loading registrations" />
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <EmptyState
          title="No registrations found"
          description="New program bookings and event registrations will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#222] bg-[#0f0f0f]">
          <div className="hidden grid-cols-[36px_1.35fr_1fr_150px_150px_190px] gap-4 border-b border-[#222] bg-[#151515] px-5 py-3 text-xs font-bold uppercase text-gray-500 lg:grid">
            <label className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleAllVisible}
                className="h-4 w-4 rounded border-white/20 bg-black accent-amber-500"
                aria-label="Select all visible registrations"
              />
            </label>
            <span>Registrant</span>
            <span>Offering</span>
            <span>Status</span>
            <span>Payment</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-[#222]">
            {filteredRegistrations.map((registration) => (
              <div key={registration.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[36px_1.35fr_1fr_150px_150px_190px] lg:items-center">
                <label className="flex items-start pt-1 lg:items-center lg:justify-center lg:pt-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(registration.id)}
                    onChange={() => toggleSelected(registration.id)}
                    className="h-4 w-4 rounded border-white/20 bg-black accent-amber-500"
                    aria-label={`Select registration for ${registration.participantName}`}
                  />
                </label>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-white">{registration.participantName}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${statusClass(registration.status)}`}>
                      {registration.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">{registration.guardianEmail}</p>
                  {registration.guardianPhone ? <p className="text-xs text-gray-500">{registration.guardianPhone}</p> : null}
                  <p className="mt-1 text-xs text-gray-600">{registration.registrationCode}</p>
                </div>
                <div>
                  <p className="font-semibold text-white">{registration.programName ?? registration.eventTitle}</p>
                  <p className="text-xs uppercase tracking-wide text-amber-500">{registration.offeringType.replace('_', ' ')}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {registration.scheduledDate ? `${formatDate(registration.scheduledDate)} ${registration.scheduledStartTime ?? ''}` : registration.eventTitle ? 'Event roster' : 'Program roster'}
                  </p>
                  {registration.waitlistPosition ? (
                    <p className="mt-1 text-xs font-semibold text-amber-300">Waitlist #{registration.waitlistPosition}</p>
                  ) : null}
                </div>
                <select
                  value={registration.status}
                  onChange={(event) => applyStatus(registration.id, event.target.value as RegistrationStatus)}
                  disabled={savingId === registration.id}
                  className="select-field text-xs"
                >
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <select
                  value={registration.paymentStatus}
                  onChange={(event) => applyPaymentStatus(registration.id, event.target.value as RegistrationPaymentStatus)}
                  disabled={savingId === registration.id}
                  className="select-field text-xs"
                >
                  {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(registration)}
                    disabled={savingId === registration.id}
                    className="btn-secondary justify-center px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Edit
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => cancel(registration.id)}
                      disabled={savingId === registration.id || registration.status === 'CANCELLED'}
                      className="btn-secondary justify-center px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(registration.id)}
                      disabled={savingId === registration.id}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 px-4 py-8">
          <form onSubmit={submitForm} className="w-full max-w-5xl rounded-2xl border border-[#2a2a2a] bg-[#111] p-5 shadow-2xl">
            <div className="flex flex-col gap-3 border-b border-[#222] pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="section-label">Admin Registration</p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  {editingRegistration ? 'Edit Registration' : 'Add Registration'}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Create, update, cancel, or delete registrations without leaving the admin workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm font-bold text-gray-300 hover:bg-white/5"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <label className="space-y-2 text-sm font-semibold text-gray-300">
                Offering type
                <select
                  value={formData.eventId ? 'EVENT' : 'PROGRAM'}
                  onChange={(event) => {
                    const next = event.target.value as RegistrationOfferingType
                    setFormData((prev) => ({
                      ...prev,
                      programId: next === 'PROGRAM' ? prev.programId : undefined,
                      eventId: next === 'EVENT' ? prev.eventId : undefined,
                      trainingSessionId: undefined,
                      registrationType: next === 'EVENT' ? 'EVENT_REGISTRATION' : 'PROGRAM_BOOKING',
                    }))
                  }}
                  className="select-field"
                >
                  <option value="EVENT">Event</option>
                  <option value="PROGRAM">Program</option>
                </select>
              </label>

              {formData.eventId || formData.registrationType === 'EVENT_REGISTRATION' ? (
                <label className="space-y-2 text-sm font-semibold text-gray-300">
                  Event
                  <select
                    value={formData.eventId ?? ''}
                    onChange={(event) => setFormData((prev) => ({
                      ...prev,
                      eventId: event.target.value ? Number(event.target.value) : undefined,
                      programId: undefined,
                      trainingSessionId: undefined,
                      registrationType: 'EVENT_REGISTRATION',
                    }))}
                    className="select-field"
                  >
                    <option value="">Choose event</option>
                    {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
                  </select>
                </label>
              ) : (
                <label className="space-y-2 text-sm font-semibold text-gray-300">
                  Program
                  <select
                    value={formData.programId ?? ''}
                    onChange={(event) => setFormData((prev) => ({
                      ...prev,
                      programId: event.target.value ? Number(event.target.value) : undefined,
                      eventId: undefined,
                      trainingSessionId: undefined,
                      registrationType: 'PROGRAM_BOOKING',
                    }))}
                    className="select-field"
                  >
                    <option value="">Choose program</option>
                    {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
                  </select>
                </label>
              )}

              <label className="space-y-2 text-sm font-semibold text-gray-300">
                Summer Training session
                <select
                  value={formData.trainingSessionId ?? ''}
                  onChange={(event) => {
                    const session = eventSessions.find((item) => item.id === Number(event.target.value))
                    setFormData((prev) => ({
                      ...prev,
                      trainingSessionId: session?.id,
                      eventId: session?.eventId ?? prev.eventId,
                      programId: session?.programId ?? prev.programId,
                      scheduledDate: session?.scheduledDate ?? prev.scheduledDate,
                      scheduledStartTime: session?.startTime ?? prev.scheduledStartTime,
                      scheduledEndTime: session?.endTime ?? prev.scheduledEndTime,
                      registrationType: session?.eventId ? 'EVENT_REGISTRATION' : prev.registrationType,
                    }))
                  }}
                  className="select-field"
                >
                  <option value="">No linked session</option>
                  {eventSessions.map((session: TrainingSession) => (
                    <option key={session.id} value={session.id}>
                      {session.eventTitle ?? session.programName} - {formatDate(session.scheduledDate)} {session.startTime}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-semibold text-gray-300">
                Registration type
                <select
                  value={formData.registrationType ?? 'EVENT_REGISTRATION'}
                  onChange={(event) => setFormData((prev) => ({ ...prev, registrationType: event.target.value as RegistrationFormData['registrationType'] }))}
                  className="select-field"
                >
                  {registrationTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="space-y-2 text-sm font-semibold text-gray-300">
                Status
                <select
                  value={formData.status ?? 'CONFIRMED'}
                  onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value as RegistrationStatus }))}
                  className="select-field"
                >
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label className="space-y-2 text-sm font-semibold text-gray-300">
                Payment
                <select
                  value={formData.paymentStatus ?? 'UNPAID'}
                  onChange={(event) => setFormData((prev) => ({ ...prev, paymentStatus: event.target.value as RegistrationPaymentStatus }))}
                  className="select-field"
                >
                  {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input required value={formData.participantName} onChange={(event) => setFormData((prev) => ({ ...prev, participantName: event.target.value }))} placeholder="Player name *" className="input-field-default" />
              <input value={formData.participantAge ?? ''} onChange={(event) => setFormData((prev) => ({ ...prev, participantAge: event.target.value }))} placeholder="Player age" className="input-field-default" />
              <input value={formData.guardianName ?? ''} onChange={(event) => setFormData((prev) => ({ ...prev, guardianName: event.target.value }))} placeholder="Parent / guardian name" className="input-field-default" />
              <input required type="email" value={formData.guardianEmail} onChange={(event) => setFormData((prev) => ({ ...prev, guardianEmail: event.target.value }))} placeholder="Parent / guardian email *" className="input-field-default" />
              <input value={formData.guardianPhone ?? ''} onChange={(event) => setFormData((prev) => ({ ...prev, guardianPhone: event.target.value }))} placeholder="Phone" className="input-field-default" />
              <input type="email" value={formData.participantEmail ?? ''} onChange={(event) => setFormData((prev) => ({ ...prev, participantEmail: event.target.value }))} placeholder="Player email" className="input-field-default" />
              <input type="date" value={formData.scheduledDate ?? ''} onChange={(event) => setFormData((prev) => ({ ...prev, scheduledDate: event.target.value }))} className="input-field-default" />
              <div className="grid grid-cols-2 gap-3">
                <input value={formData.scheduledStartTime ?? ''} onChange={(event) => setFormData((prev) => ({ ...prev, scheduledStartTime: event.target.value }))} placeholder="Start time" className="input-field-default" />
                <input value={formData.scheduledEndTime ?? ''} onChange={(event) => setFormData((prev) => ({ ...prev, scheduledEndTime: event.target.value }))} placeholder="End time" className="input-field-default" />
              </div>
              <input value={formData.experienceLevel ?? ''} onChange={(event) => setFormData((prev) => ({ ...prev, experienceLevel: event.target.value }))} placeholder="Experience level" className="input-field-default" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="0.01" value={formData.priceAmount ?? ''} onChange={(event) => setFormData((prev) => ({ ...prev, priceAmount: event.target.value === '' ? '' : Number(event.target.value) }))} placeholder="Price" className="input-field-default" />
                <input type="number" step="0.01" value={formData.amountPaid ?? ''} onChange={(event) => setFormData((prev) => ({ ...prev, amountPaid: event.target.value === '' ? '' : Number(event.target.value) }))} placeholder="Amount paid" className="input-field-default" />
              </div>
              <textarea value={formData.customerNotes ?? ''} onChange={(event) => setFormData((prev) => ({ ...prev, customerNotes: event.target.value }))} placeholder="Customer notes" className="input-field-default min-h-24 md:col-span-1" />
              <textarea value={formData.adminNotes ?? ''} onChange={(event) => setFormData((prev) => ({ ...prev, adminNotes: event.target.value }))} placeholder="Admin notes" className="input-field-default min-h-24 md:col-span-1" />
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-[#222] pt-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary justify-center px-5 py-3">
                Cancel
              </button>
              <button type="submit" disabled={savingId !== null} className="btn-primary justify-center px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50">
                {editingRegistration ? 'Save Registration' : 'Create Registration'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

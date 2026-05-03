import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { createEventRegistration, getEventById } from '../services/api'
import type { Event, TrainingSession } from '../types'
import { useAuth } from '../context/AuthContext'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import LoadingSpinner from '../components/LoadingSpinner'

const FULL_WEEK_PRICE = 125
const DROP_IN_PRICE = 30

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  })
}

function formatShortDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(value?: string) {
  if (!value) return ''
  const [hourPart, minutePart = '00'] = value.split(':')
  const hour = Number(hourPart)
  if (!Number.isFinite(hour)) return value
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutePart.padStart(2, '0')} ${suffix}`
}

function validateField(name: string, value: string): string {
  switch (name) {
    case 'playerName':
      return value.trim().length < 2 ? 'Player name is required' : ''
    case 'email':
      return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Please enter a valid email address' : ''
    case 'phone':
      return value.trim().length < 7 ? 'Phone number is required' : ''
    default:
      return ''
  }
}

interface FieldProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

function Field({ label, htmlFor, required, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase text-gray-400">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  )
}

type BookingMode = 'FULL_WEEK' | 'DROP_IN'

type WeekGroup = {
  key: string
  label: string
  dateRange: string
  sessions: TrainingSession[]
}

const INITIAL_FORM = {
  playerName: '',
  playerAge: '',
  email: '',
  phone: '',
}

function buildWeekGroups(sessions: TrainingSession[]): WeekGroup[] {
  const grouped = new Map<string, TrainingSession[]>()
  sessions
    .filter((session) => session.status !== 'CANCELLED')
    .sort((a, b) => `${a.scheduledDate}-${a.startTime}`.localeCompare(`${b.scheduledDate}-${b.startTime}`))
    .forEach((session) => {
      const key = String(session.sessionSeriesId ?? session.scheduledDate)
      grouped.set(key, [...(grouped.get(key) ?? []), session])
    })

  return Array.from(grouped.entries()).map(([key, group], index) => {
    const sorted = [...group].sort((a, b) => `${a.scheduledDate}-${a.startTime}`.localeCompare(`${b.scheduledDate}-${b.startTime}`))
    return {
      key,
      label: `Week ${index + 1}`,
      dateRange: `${formatShortDate(sorted[0].scheduledDate)} - ${formatShortDate(sorted[sorted.length - 1].scheduledDate)}`,
      sessions: sorted,
    }
  })
}

export default function EventRegisterPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [bookingMode, setBookingMode] = useState<BookingMode>('FULL_WEEK')
  const [selectedWeekKey, setSelectedWeekKey] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const eventId = Number(id)
    setLoadingEvent(true)
    setNotFound(false)
    setEvent(null)
    if (!Number.isFinite(eventId) || eventId <= 0) {
      setNotFound(true)
      setLoadingEvent(false)
      return
    }

    getEventById(eventId)
      .then((nextEvent) => {
        setEvent(nextEvent)
        setNotFound(false)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingEvent(false))
  }, [id])

  const weekGroups = useMemo(() => buildWeekGroups(event?.trainingSessions ?? []), [event?.trainingSessions])
  const selectedWeek = weekGroups.find((week) => week.key === selectedWeekKey) ?? weekGroups[0]
  const selectedSession = selectedWeek?.sessions.find((session) => session.id === selectedSessionId) ?? selectedWeek?.sessions[0]
  const hasSessions = weekGroups.length > 0
  const selectedSessionIds = bookingMode === 'FULL_WEEK'
    ? selectedWeek?.sessions.map((session) => session.id) ?? []
    : selectedSession ? [selectedSession.id] : []
  const selectedPrice = bookingMode === 'FULL_WEEK' ? FULL_WEEK_PRICE : DROP_IN_PRICE
  const perDayPrice = Math.round(FULL_WEEK_PRICE / 5)
  const mediaUrls = event?.mediaUrls?.length
    ? event.mediaUrls
    : [event?.primaryMediaUrl, event?.secondaryMediaUrl].filter(Boolean) as string[]

  useEffect(() => {
    if (weekGroups.length && !selectedWeekKey) {
      setSelectedWeekKey(weekGroups[0].key)
    }
  }, [selectedWeekKey, weekGroups])

  useEffect(() => {
    if (selectedWeek?.sessions.length && !selectedWeek.sessions.some((session) => session.id === selectedSessionId)) {
      setSelectedSessionId(selectedWeek.sessions[0].id)
    }
  }, [selectedSessionId, selectedWeek])

  useEffect(() => {
    if (!user) return
    setForm((prev) => ({
      ...prev,
      email: prev.email || user.email,
    }))
  }, [user])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  function validateAll(): boolean {
    const fields = ['playerName', 'email', 'phone'] as const
    const nextErrors: Record<string, string> = {}
    let valid = true

    fields.forEach((field) => {
      const fieldError = validateField(field, form[field])
      if (fieldError) {
        nextErrors[field] = fieldError
        valid = false
      }
    })

    if (!selectedSessionIds.length) {
      setError('Choose a Summer Training week and session before registering.')
      valid = false
    }

    setFieldErrors((prev) => ({ ...prev, ...nextErrors }))
    setTouched((prev) => ({ ...prev, ...Object.fromEntries(fields.map((field) => [field, true])) }))
    return valid
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!event || !validateAll()) return

    setSubmitting(true)
    setError('')
    try {
      await createEventRegistration(event.id, {
        ...form,
        packageType: bookingMode,
        trainingSessionIds: selectedSessionIds,
      })
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      setError(message ?? 'Could not submit your registration. Please try again or contact us.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-black px-4 pb-16 pt-20">
        <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center">
          <LoadingSpinner size="lg" label="Loading Summer Training" />
        </div>
      </div>
    )
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-black px-4 pb-16 pt-20">
        <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center">
          <EmptyState
            title="Summer Training not found"
            description="This event does not exist anymore or is no longer accepting registrations."
            action={(
              <Link to="/events" className="btn-primary justify-center px-6 py-3">
                View Summer Training
              </Link>
            )}
          />
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 pb-16 pt-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75 10.5 18.75 19.5 5.25" />
          </svg>
        </div>
        <span className="mb-2 section-label">You&apos;re In</span>
        <h1 className="mb-3 text-4xl font-black text-white">Registration Submitted</h1>
        <p className="mx-auto mb-2 max-w-md text-gray-400">
          Your Summer Training registration has been received.
        </p>
        <p className="mx-auto mb-8 max-w-sm text-sm text-gray-500">
          Watch for a confirmation email shortly. We&apos;ll follow up with any extra player details we still need.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/events" className="btn-secondary px-6 py-3">Back to Summer Training</Link>
          <Link to="/" className="btn-primary px-6 py-3">Go to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-4 pb-16 pt-20 md:pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 pt-6">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 19.5-7.5-7.5 7.5-7.5" />
            </svg>
            Back to Summer Training
          </Link>
        </div>

        <div className="mb-10 text-center">
          <span className="section-label">Summer Training</span>
          <h1 className="mt-1 text-4xl font-black text-white md:text-6xl">{event.title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-400">
            Choose a week, pick your session path, and reserve a spot for technical, athletic, tactical, and mental development.
          </p>
        </div>

        {mediaUrls.length ? (
          <div className="mb-10 grid gap-4 md:grid-cols-2">
            {mediaUrls.map((url) => (
              <div key={url} className="overflow-hidden rounded-xl border border-[#222] bg-[#0f0f0f]">
                <img
                  src={url}
                  alt="Summer Training promotional poster"
                  className="h-auto w-full object-contain"
                  loading="eager"
                />
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <section className="card p-6 sm:p-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="section-label">Step 1</p>
                  <h2 className="mt-1 text-2xl font-black text-white">Choose Your Week</h2>
                </div>
                <div className="rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-300">
                  5 Days of Training
                </div>
              </div>

              {hasSessions ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {weekGroups.map((week) => (
                    <button
                      key={week.key}
                      type="button"
                      onClick={() => setSelectedWeekKey(week.key)}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        selectedWeek?.key === week.key
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-[#222] bg-black hover:border-amber-500/40'
                      }`}
                    >
                      <span className="text-xs font-bold uppercase text-amber-500">{week.label}</span>
                      <span className="mt-1 block text-lg font-black text-white">{week.dateRange}</span>
                      <span className="mt-2 block text-sm text-gray-400">Tue - Sat</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-5">
                  <p className="font-bold text-amber-300">No sessions are available to pick yet.</p>
                  <p className="mt-2 text-sm text-gray-300">
                    Once the Summer Training sessions are seeded, this section will show each date, time, coach, and spots remaining.
                  </p>
                </div>
              )}
            </section>

            <section className="card p-6 sm:p-8">
              <div className="mb-6">
                <p className="section-label">Step 2</p>
                <h2 className="mt-1 text-2xl font-black text-white">Pick a Registration Type</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setBookingMode('FULL_WEEK')}
                  className={`rounded-xl border p-5 text-left transition-colors ${
                    bookingMode === 'FULL_WEEK'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-[#222] bg-black hover:border-amber-500/40'
                  }`}
                >
                  <span className="text-xs font-bold uppercase text-amber-500">Full Week</span>
                  <span className="mt-2 block text-3xl font-black text-white">${FULL_WEEK_PRICE}</span>
                  <span className="mt-1 block text-sm text-gray-400">5 Days of Training</span>
                  <span className="mt-3 block text-sm font-semibold text-green-400">Only ${perDayPrice} per day</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBookingMode('DROP_IN')}
                  className={`rounded-xl border p-5 text-left transition-colors ${
                    bookingMode === 'DROP_IN'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-[#222] bg-black hover:border-amber-500/40'
                  }`}
                >
                  <span className="text-xs font-bold uppercase text-amber-500">Drop-In</span>
                  <span className="mt-2 block text-3xl font-black text-white">${DROP_IN_PRICE}</span>
                  <span className="mt-1 block text-sm text-gray-400">Individual training day</span>
                  <span className="mt-3 block text-sm font-semibold text-gray-300">Choose one session below</span>
                </button>
              </div>
            </section>

            <section className="card p-6 sm:p-8">
              <div className="mb-6">
                <p className="section-label">Step 3</p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  {bookingMode === 'FULL_WEEK' ? 'Review Weekly Sessions' : 'Pick a Session'}
                </h2>
              </div>

              {hasSessions ? (
                <div className="space-y-3">
                  {selectedWeek?.sessions.map((session) => {
                  const spotsLeft = Math.max(session.capacity - session.registrationCount, 0)
                  const selectable = bookingMode === 'DROP_IN'
                  const selected = bookingMode === 'FULL_WEEK' || selectedSession?.id === session.id
                  return (
                    <button
                      key={session.id}
                      type="button"
                      disabled={!selectable}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`w-full rounded-xl border p-4 text-left transition-colors ${
                        selected
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-[#222] bg-black hover:border-amber-500/40'
                      } ${!selectable ? 'cursor-default' : ''}`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-black text-white">{formatDate(session.scheduledDate)}</p>
                          <p className="mt-1 text-sm text-gray-400">
                            {formatTime(session.startTime)}{session.endTime ? ` - ${formatTime(session.endTime)}` : ''}
                          </p>
                        </div>
                        <div className="text-sm text-gray-300 sm:text-right">
                          <p>{session.coachLabel ?? session.coachName ?? 'Coach Kante and Coach Tony'}</p>
                          <p className={spotsLeft <= 3 ? 'font-semibold text-amber-400' : 'text-gray-500'}>
                            {spotsLeft} spots left
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-[#2a2a2a] bg-black p-5 text-sm text-gray-300">
                  No sessions are available to pick yet. Once the Summer Training sessions are seeded, this section will show each date, time, coach, and spots remaining.
                </div>
              )}
            </section>

            <section className="card p-6 sm:p-8">
              <div className="mb-6">
                <p className="section-label">Step 4</p>
                <h2 className="mt-1 text-2xl font-black text-white">Player Details</h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Player Name" htmlFor="playerName" required error={touched.playerName ? fieldErrors.playerName : ''}>
                  <input
                    id="playerName"
                    name="playerName"
                    value={form.playerName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Player full name"
                    autoComplete="name"
                    className={touched.playerName && fieldErrors.playerName ? 'input-field-error' : 'input-field-default'}
                  />
                </Field>

                <Field label="Player Age" htmlFor="playerAge">
                  <input
                    id="playerAge"
                    name="playerAge"
                    value={form.playerAge}
                    onChange={handleChange}
                    placeholder="Age"
                    className="input-field-default"
                  />
                </Field>

                <Field label="Email Address" htmlFor="email" required error={touched.email ? fieldErrors.email : ''}>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    autoComplete="email"
                    readOnly={!!user}
                    className={touched.email && fieldErrors.email ? 'input-field-error' : 'input-field-default'}
                  />
                </Field>

                <Field label="Phone" htmlFor="phone" required error={touched.phone ? fieldErrors.phone : ''}>
                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Best contact number"
                    autoComplete="tel"
                    className={touched.phone && fieldErrors.phone ? 'input-field-error' : 'input-field-default'}
                  />
                </Field>
              </div>

              {error ? (
                <div className="mt-5">
                  <ErrorBanner message={error} onDismiss={() => setError('')} />
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting || !selectedSessionIds.length}
                className="btn-primary mt-6 w-full justify-center py-4 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:shadow-none"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    Submitting...
                  </span>
                ) : (
                  hasSessions ? `Register for ${selectedWeek?.label ?? 'Summer Training'}` : 'Sessions Not Available Yet'
                )}
              </button>
            </section>
          </form>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <span className="mb-1 block text-xs font-bold uppercase text-amber-500">Summary</span>
              <h3 className="mb-4 text-xl font-black text-white">{event.title}</h3>

              <div className="space-y-4 text-sm text-gray-300">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">Week</span>
                  <span className="text-right font-semibold text-white">
                    {selectedWeek ? `${selectedWeek.label} · ${selectedWeek.dateRange}` : 'Not available yet'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">Package</span>
                  <span className="text-right font-semibold text-white">
                    {bookingMode === 'FULL_WEEK' ? '5 Days of Training' : 'Drop-in Session'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">Sessions</span>
                  <span className="text-right font-semibold text-white">
                    {selectedSessionIds.length} selected
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">Coaches</span>
                  <span className="text-right font-semibold text-white">Coach Kante & Coach Tony</span>
                </div>
                <div className="border-t border-[#222] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Due at registration</span>
                    <span className="text-3xl font-black text-amber-500">${selectedPrice}</span>
                  </div>
                  {bookingMode === 'FULL_WEEK' ? (
                    <p className="mt-2 text-xs text-green-400">Only ${perDayPrice} per day</p>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500">Drop-in rate</p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

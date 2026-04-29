import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { createEventRegistration, getEvents } from '../services/api'
import type { Event } from '../types'
import { useAuth } from '../context/AuthContext'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import LoadingSpinner from '../components/LoadingSpinner'

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function validateField(name: string, value: string): string {
  switch (name) {
    case 'playerName':
      return value.trim().length < 2 ? 'Player name is required' : ''
    case 'email':
      return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Please enter a valid email address' : ''
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
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
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

const INITIAL_FORM = {
  playerName: '',
  email: '',
}

export default function EventRegisterPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [form, setForm] = useState(INITIAL_FORM)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    document.title = 'Event Registration | Kante Elite Training'
    return () => {
      document.title = 'Kante Elite Training, Columbus Youth Soccer Academy'
    }
  }, [])

  useEffect(() => {
    getEvents()
      .then((events) => {
        const found = events.find((entry) => entry.id === Number(id))
        if (found) {
          setEvent(found)
          return
        }
        setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingEvent(false))
  }, [id])

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
    const fields = ['playerName', 'email'] as const
    const nextErrors: Record<string, string> = {}
    let valid = true

    fields.forEach((field) => {
      const fieldError = validateField(field, form[field])
      if (fieldError) {
        nextErrors[field] = fieldError
        valid = false
      }
    })

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
      await createEventRegistration(event.id, form)
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
          <LoadingSpinner size="lg" label="Loading event details" />
        </div>
      </div>
    )
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-black px-4 pb-16 pt-20">
        <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center">
          <EmptyState
            title="Event not found"
            description="This event does not exist anymore or is no longer accepting registrations."
            action={(
              <Link to="/events" className="btn-primary justify-center px-6 py-3">
                View all events
              </Link>
            )}
          />
        </div>
      </div>
    )
  }

  const isSoldOut = event.status === 'SOLD_OUT' || event.spotsLeft === 0

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 pb-16 pt-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75 10.5 18.75 19.5 5.25" />
          </svg>
        </div>
        <span className="mb-2 section-label">You&apos;re In</span>
        <h1 className="mb-3 text-4xl font-black text-white">Registration Submitted!</h1>
        <p className="mx-auto mb-2 max-w-md text-gray-400">
          Your registration for <span className="font-semibold text-white">{event.title}</span> has been received.
        </p>
        <p className="mx-auto mb-8 max-w-sm text-sm text-gray-500">
          Watch for a confirmation email shortly. We&apos;ll follow up with any extra player details we still need.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/events" className="btn-secondary px-6 py-3">Back to Events</Link>
          <Link to="/" className="btn-primary px-6 py-3">Go to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-4 pb-16 pt-20 md:pt-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 pt-6">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 19.5-7.5-7.5 7.5-7.5" />
            </svg>
            Back to Events
          </Link>
        </div>

        <div className="mb-10 text-center">
          <span className="section-label">Event Registration</span>
          <h1 className="mt-1 text-4xl font-black text-white md:text-5xl">{event.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            Reserve your spot with the player name and best email. We&apos;ll follow up with anything else we need before the event.
          </p>
        </div>

        <div className="lg:flex lg:items-start lg:gap-8">
          <div className="min-w-0 flex-1">
            {isSoldOut ? (
              <EmptyState
                icon={(
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                )}
                title="This event is sold out"
                description="All available spots have been filled. You can browse upcoming events or contact us to ask about future openings."
                action={(
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link to="/events" className="btn-secondary justify-center px-5 py-2.5">
                      View other events
                    </Link>
                    <Link to="/contact" className="btn-primary justify-center px-5 py-2.5">
                      Contact us
                    </Link>
                  </div>
                )}
              />
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="card p-6 sm:p-8">
                  <h2 className="mb-1 text-2xl font-black text-white">Reserve Your Spot</h2>
                  <p className="mb-6 text-sm text-gray-500">
                    We keep event registration simple. Share the player name and best email, and we&apos;ll follow up if we need anything else before camp.
                  </p>

                  <div className="space-y-5">
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

                    <Field label="Email Address" htmlFor="email" required error={touched.email ? fieldErrors.email : ''}>
                      <>
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
                        {user ? (
                          <p className="mt-2 text-xs text-gray-600">
                            Using your signed in account email.
                          </p>
                        ) : null}
                      </>
                    </Field>
                  </div>

                  {error ? (
                    <div className="mt-5">
                      <ErrorBanner message={error} onDismiss={() => setError('')} />
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary mt-6 w-full justify-center py-4 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:shadow-none"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                        Submitting...
                      </span>
                    ) : (
                      `Register for ${event.title}`
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-6 flex-shrink-0 lg:mt-0 lg:w-80">
            <div className="card sticky top-24 p-6">
              {event.type ? (
                <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-amber-500">
                  {event.type}
                </span>
              ) : null}
              <h3 className="mb-4 text-lg font-black leading-tight text-white">{event.title}</h3>

              <div className="space-y-3 text-sm text-gray-300">
                {event.coachName ? (
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    <span>Led by {event.coachName}</span>
                  </div>
                ) : null}

                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <div>
                    <p>{formatDate(event.startDate)}</p>
                    {event.endDate ? <p className="mt-0.5 text-xs text-gray-500">to {formatDate(event.endDate)}</p> : null}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span>{event.venue}, {event.location}</span>
                </div>

                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span>{event.ageGroup}</span>
                </div>

                {event.intensity ? (
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                    </svg>
                    <span>Intensity: {event.intensity}</span>
                  </div>
                ) : null}

                {event.spotsLeft !== null && event.spotsLeft > 0 ? (
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                    <span className={event.spotsLeft <= 5 ? 'font-semibold text-amber-400' : ''}>
                      {event.spotsLeft} {event.spotsLeft === 1 ? 'spot' : 'spots'} remaining
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 border-t border-[#222] pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Registration Fee</span>
                  <span className="text-2xl font-black text-amber-500">${event.price.toFixed(0)}</span>
                </div>
              </div>

              {event.description ? (
                <p className="mt-4 text-xs leading-relaxed text-gray-500">{event.description}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

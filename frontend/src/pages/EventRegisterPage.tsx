import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getEvents, createEventRegistration } from '../services/api'
import type { Event } from '../types'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'

const ageGroups = [
  'Under 8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', '18+',
]

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
    case 'phone':
      return value.replace(/\D/g, '').length < 10 ? 'Please enter a valid phone number' : ''
    case 'playerAge':
      return !value ? 'Please select an age group' : ''
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
      <label htmlFor={htmlFor} className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-red-400 text-xs flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

const INITIAL_FORM = {
  playerName: '',
  playerAge: '',
  parentName: '',
  email: '',
  phone: '',
  notes: '',
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
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

  useEffect(() => {
    getEvents()
      .then((events) => {
        const found = events.find((e) => e.id === Number(id))
        if (found) {
          setEvent(found)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingEvent(false))
  }, [id])

  useEffect(() => {
    if (!user) return
    const shouldPrefillContactName =
      user.role !== 'ADMIN' && user.role !== 'TEAM_CAPTAIN' && user.role !== 'COACH'

    setForm((prev) => ({
      ...prev,
      email: prev.email || user.email,
      parentName: prev.parentName || (shouldPrefillContactName ? user.name : ''),
    }))
  }, [user])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  function handleBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  function validateAll(): boolean {
    const fields = ['playerName', 'playerAge', 'email', 'phone'] as const
    const errors: Record<string, string> = {}
    let ok = true
    fields.forEach((f) => {
      const err = validateField(f, form[f])
      if (err) {
        errors[f] = err
        ok = false
      }
    })
    setFieldErrors((prev) => ({ ...prev, ...errors }))
    setTouched((prev) => ({ ...prev, ...Object.fromEntries(fields.map((f) => [f, true])) }))
    return ok
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

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-black px-4 pt-20 pb-16">
        <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center">
          <LoadingSpinner size="lg" label="Loading event details" />
        </div>
      </div>
    )
  }

  // ─── Not found ──────────────────────────────────────────────────────────────
  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-black px-4 pt-20 pb-16">
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

  // ─── Success ────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-black px-4 pt-20 pb-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <span className="section-label mb-2">You're In</span>
        <h1 className="text-white font-black text-4xl mb-3">Registration Submitted!</h1>
        <p className="text-gray-400 max-w-md mx-auto mb-2">
          Your registration for <span className="text-white font-semibold">{event.title}</span> has been received.
        </p>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">
          You'll receive a confirmation email shortly. Coach Kante will follow up with next steps.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/events" className="btn-secondary px-6 py-3">Back to Events</Link>
          <Link to="/" className="btn-primary px-6 py-3">Go to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-4 pt-20 pb-16 md:pt-24">
      <div className="max-w-5xl mx-auto">

        {/* Back link */}
        <div className="pt-6 mb-6">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Events
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <span className="section-label">Event Registration</span>
          <h1 className="text-white font-black text-4xl md:text-5xl mt-1">{event.title}</h1>
          <p className="text-gray-400 mt-3 max-w-md mx-auto">
            Fill in the details below to secure your spot.
          </p>
        </div>

        <div className="lg:flex lg:gap-8 lg:items-start">

          {/* ── Form ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
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
                  <h2 className="text-white font-black text-2xl mb-1">Player & Contact Details</h2>
                  <p className="text-gray-500 text-sm mb-6">Tell us about the player registering for this event.</p>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Player Name" htmlFor="playerName" required error={touched.playerName ? fieldErrors.playerName : ''}>
                        <input
                          id="playerName"
                          className={touched.playerName && fieldErrors.playerName ? 'input-field-error' : 'input-field-default'}
                          name="playerName"
                          value={form.playerName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Player full name"
                          autoComplete="name"
                        />
                      </Field>

                      <Field label="Age Group" htmlFor="playerAge" required error={touched.playerAge ? fieldErrors.playerAge : ''}>
                        <select
                          id="playerAge"
                          className={touched.playerAge && fieldErrors.playerAge ? 'input-field-error' : 'select-field'}
                          name="playerAge"
                          value={form.playerAge}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          <option value="">Select age group...</option>
                          {ageGroups.map((a) => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <Field label="Parent / Guardian Name" htmlFor="parentName">
                      <input
                        id="parentName"
                        className="input-field-default"
                        name="parentName"
                        value={form.parentName}
                        onChange={handleChange}
                        placeholder="Parent or guardian name"
                        autoComplete="name"
                      />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Email Address" htmlFor="email" required error={touched.email ? fieldErrors.email : ''}>
                        <>
                          <input
                            id="email"
                            className={touched.email && fieldErrors.email ? 'input-field-error' : 'input-field-default'}
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="you@example.com"
                            autoComplete="email"
                            readOnly={!!user}
                          />
                          {user && (
                            <p className="text-gray-600 text-xs mt-2">
                              Using your signed in account email.
                            </p>
                          )}
                        </>
                      </Field>

                      <Field label="Phone Number" htmlFor="phone" required error={touched.phone ? fieldErrors.phone : ''}>
                        <input
                          id="phone"
                          className={touched.phone && fieldErrors.phone ? 'input-field-error' : 'input-field-default'}
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="(614) 000-0000"
                          autoComplete="tel"
                        />
                      </Field>
                    </div>

                    <Field label="Notes (optional)" htmlFor="notes">
                      <textarea
                        id="notes"
                        className="textarea-field"
                        rows={3}
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        placeholder="Any questions, special needs, or things Coach Kante should know."
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
                    disabled={submitting}
                    className="btn-primary w-full justify-center mt-6 py-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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

          {/* ── Event Summary ─────────────────────────────────────────── */}
          <div className="lg:w-80 mt-6 lg:mt-0 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              {event.type && (
                <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1 block">
                  {event.type}
                </span>
              )}
              <h3 className="text-white font-black text-lg leading-tight mb-4">{event.title}</h3>

              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <div>
                    <p>{formatDate(event.startDate)}</p>
                    {event.endDate && <p className="text-gray-500 text-xs mt-0.5">to {formatDate(event.endDate)}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span>{event.venue}, {event.location}</span>
                </div>

                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span>{event.ageGroup}</span>
                </div>

                {event.intensity && (
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                    </svg>
                    <span>Intensity: {event.intensity}</span>
                  </div>
                )}

                {event.spotsLeft !== null && event.spotsLeft > 0 && (
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                    <span className={event.spotsLeft <= 5 ? 'text-amber-400 font-semibold' : ''}>
                      {event.spotsLeft} {event.spotsLeft === 1 ? 'spot' : 'spots'} remaining
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-[#222] mt-5 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Registration Fee</span>
                  <span className="text-amber-500 font-black text-2xl">${event.price.toFixed(0)}</span>
                </div>
              </div>

              {event.description && (
                <p className="text-gray-500 text-xs mt-4 leading-relaxed">{event.description}</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

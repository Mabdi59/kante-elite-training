import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { createProgramCheckout, createProgramRegistration, getAvailability, getEvents, getPaymentsEnabled, getPrograms } from '../services/api'
import type { Event, Program, AvailabilityData, ProgramBookingFormData } from '../types'
import { useAuth } from '../context/AuthContext'
import { getPortalDestination } from '../utils/portal'
import MediaAsset from '../components/MediaAsset'

const experienceLevels = [
  { value: 'beginner', label: 'Beginner, just starting out' },
  { value: 'intermediate', label: 'Intermediate, plays recreationally' },
  { value: 'advanced', label: 'Advanced, competitive club player' },
  { value: 'elite', label: 'Elite, high school or academy level' },
]

const ageGroups = [
  'Under 8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', '18+',
]

function getTomorrowDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function getMaxDate() {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toISOString().split('T')[0]
}

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function isPromotionalProgram(program?: Program | null) {
  return Boolean(program?.campaignLabel || program?.secondaryMediaUrl || program?.seasonLabel)
}

function isSummerTrainingProgram(program?: Program | null) {
  if (!program) return false
  return `${program.name} ${program.slug} ${program.campaignLabel ?? ''}`
    .toLowerCase()
    .includes('summer')
}

function validateField(name: string, value: string): string {
  switch (name) {
    case 'playerName':
      return value.trim().length < 2 ? 'Player name is required' : ''
    case 'email':
      return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Please enter a valid email address' : ''
    case 'phone':
      return value.replace(/\D/g, '').length < 10 ? 'Please enter a valid phone number' : ''
    default:
      return ''
  }
}

interface StepIndicatorProps {
  steps: { number: number; title: string }[]
  current: number
}

function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((s, i) => {
        const done = current > s.number
        const active = current === s.number
        return (
          <div key={s.number} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2.5 ${active ? 'text-white' : done ? 'text-amber-500' : 'text-gray-600'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-all duration-300 ${
                  done
                    ? 'bg-amber-500 text-black'
                    : active
                      ? 'bg-white text-black ring-4 ring-white/20'
                      : 'bg-[#222] text-gray-600'
                }`}
              >
                {done ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : s.number}
              </div>
              <span className="text-xs font-semibold hidden sm:block leading-tight">{s.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 transition-colors duration-300 ${current > s.number ? 'bg-amber-500' : 'bg-[#2a2a2a]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

interface SidebarProps {
  program: Program | null
  date: string
  time: string
  playerName: string
}

function BookingSidebar({ program, date, time, playerName }: SidebarProps) {
  const hasAnyDetail = date || time || playerName

  return (
    <aside className="hidden lg:block lg:w-72 lg:flex-shrink-0 xl:w-80">
      <div className="space-y-4 lg:sticky lg:top-24">
        <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#222] bg-[#161616]">
            <p className="text-amber-500 text-xs font-bold uppercase">Your Booking</p>
            <p className="text-gray-600 text-xs mt-0.5">Most bookings take less than a minute.</p>
          </div>
          <div className="p-5">
            {program ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-[#1e1e1e]">
                  {program.mediaUrl ? (
                    <MediaAsset
                      src={program.mediaUrl}
                      type={program.mediaType ?? 'IMAGE'}
                      alt={`${program.name} program`}
                      loading="eager"
                      className={`h-12 w-12 rounded-xl bg-black ${isPromotionalProgram(program) ? 'object-contain p-1' : 'object-cover'}`}
                    />
                  ) : (
                    <span className="text-2xl">{program.icon}</span>
                  )}
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">{program.name}</p>
                    <p className="text-amber-500 font-black text-sm">{program.priceLabel}</p>
                  </div>
                </div>

                {hasAnyDetail && (
                  <div className="space-y-2.5 text-sm">
                    {date && (
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>
                        <span className="text-gray-200 text-xs">{formatDisplayDate(date)}</span>
                      </div>
                    )}
                    {time && (
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
                        <span className="text-gray-200 text-xs">{time}</span>
                      </div>
                    )}
                    {playerName && (
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                        <span className="text-gray-200 text-xs">{playerName}</span>
                      </div>
                    )}
                  </div>
                )}

                {!hasAnyDetail && (
                  <p className="text-gray-600 text-xs">Complete the steps to finalize your booking.</p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Select a program to get started.</p>
            )}
          </div>
        </div>

        <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-3">
          {[
            { icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, text: 'Instant booking confirmation' },
            { icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>, text: 'Confirmation email sent automatically' },
            { icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>, text: 'Coach Kante follows up before the session' },
            { icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15"/></svg>, text: 'Rescheduling support if needed' },
            { icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6Z"/></svg>, text: 'Call or text us anytime' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-gray-400 text-xs leading-relaxed">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-400 text-xs font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Weekend and evening spots fill quickly. Book early for the best selection.
          </p>
        </div>
      </div>
    </aside>
  )
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
      <label htmlFor={htmlFor} className="block text-gray-400 text-xs font-semibold uppercase mb-2">
        {label}
        {required && <span className="text-amber-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="field-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

const INITIAL_FORM: Omit<ProgramBookingFormData, 'programId'> = {
  bookingDate: '',
  bookingTime: '',
  playerName: '',
  playerAge: '',
  parentName: '',
  email: '',
  phone: '',
  experienceLevel: '',
  notes: '',
}

export default function BookPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
    // Accept both ?program=slug-or-id and ?programId=123 for direct links.
  const preselectedProgramId = searchParams.get('programId') ?? searchParams.get('program')
  const preselectedDate = searchParams.get('date') ?? ''
  const preselectedTime = searchParams.get('time') ?? ''
  const topRef = useRef<HTMLDivElement | null>(null)

  const [programs, setPrograms] = useState<Program[]>([])
  const [summerTrainingEvent, setSummerTrainingEvent] = useState<Event | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)
  const [loadingPrograms, setLoadingPrograms] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [paymentsEnabled, setPaymentsEnabled] = useState(false)

  useEffect(() => {
    getPaymentsEnabled().then(setPaymentsEnabled).catch(() => {})
    getEvents()
      .then((events) => {
        const event = events.find((item) => item.title.toLowerCase() === 'summer training') ?? null
        setSummerTrainingEvent(event)
      })
      .catch(() => setSummerTrainingEvent(null))
    getPrograms()
      .then((p) => {
        setPrograms(p)
        if (preselectedProgramId) {
          const found = p.find(
            (prog) => prog.slug === preselectedProgramId || prog.id === Number(preselectedProgramId),
          )
          if (found) {
            if (isSummerTrainingProgram(found)) {
              setSelectedProgram(found)
              return
            }
            setSelectedProgram(found)
            if (preselectedDate && preselectedTime) {
              setForm((prev) => ({
                ...prev,
                bookingDate: preselectedDate,
                bookingTime: preselectedTime,
              }))
              setStep(3)
            } else if (preselectedDate) {
              setForm((prev) => ({ ...prev, bookingDate: preselectedDate }))
              setStep(2)
            } else {
              setStep(2)
            }
          }
        }
      })
      .catch(() => {
        setError('Unable to load training programs. Please refresh the page and try again.')
      })
      .finally(() => setLoadingPrograms(false))
  }, [preselectedProgramId, preselectedDate, preselectedTime])

  useEffect(() => {
    if (selectedProgram && summerTrainingEvent && isSummerTrainingProgram(selectedProgram)) {
      navigate(`/events/${summerTrainingEvent.id}/register`, { replace: true })
    }
  }, [navigate, selectedProgram, summerTrainingEvent])

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

  useEffect(() => {
    if (!selectedProgram || !form.bookingDate) return
    let active = true
    setLoadingSlots(true)
    setAvailability(null)
    getAvailability(selectedProgram.id, form.bookingDate)
      .then((nextAvailability) => {
        if (active) {
          setAvailability(nextAvailability)
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load available time slots. Please try a different date or refresh.')
        }
      })
      .finally(() => {
        if (active) {
          setLoadingSlots(false)
        }
      })

    return () => {
      active = false
    }
  }, [selectedProgram, form.bookingDate])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    topRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [step])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target
    if (name === 'bookingDate') {
      setForm((prev) => ({ ...prev, bookingDate: value, bookingTime: '' }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
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

  function validateStep3(): boolean {
    const fields = ['playerName', 'email', 'phone'] as const
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

  async function handleCheckout() {
    if (!selectedProgram) return
    setSubmitting(true)
    setError('')

    const payload: ProgramBookingFormData = { programId: selectedProgram.id, ...form }

    if (paymentsEnabled) {
      // Stripe checkout: redirect to hosted Stripe page (supports Apple Pay, Google Pay, card)
      try {
        const checkoutUrl = await createProgramCheckout(payload)
        window.location.href = checkoutUrl
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
            : undefined
        setError(message ?? 'Could not start checkout. Please try again or contact us.')
        setSubmitting(false)
      }
      return
    }

    // Direct booking (no payment required)
    try {
      const registration = await createProgramRegistration(payload)
      navigate(`/book/success?registration_id=${registration.id}&registration_code=${registration.registrationCode}`, {
        state: { registration },
      })
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      setError(message ?? 'Could not confirm your booking. Please try again or contact us.')
      setSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: 'Program' },
    { number: 2, title: 'Date & Time' },
    { number: 3, title: 'Details' },
    { number: 4, title: 'Confirm' },
  ]

  const isTwoColumn = step >= 2 && selectedProgram !== null
  const portal = getPortalDestination(user?.role)
  const portalPath = portal?.path ?? null
  const portalLabel = portal?.returnLabel ?? ''

  return (
    <div className="min-h-screen bg-black px-4 pt-20 pb-16 md:pt-24">
      <div className="max-w-7xl mx-auto">
        {portalPath ? (
          <div className="max-w-5xl mx-auto pt-6 mb-2">
            <Link
              to={portalPath}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {portalLabel}
            </Link>
          </div>
        ) : null}

        <div ref={topRef} className="text-center pt-6 mb-8 md:pt-8">
          <span className="section-label">Booking</span>
          <h1 className="text-white font-black text-4xl md:text-5xl">Book a Session</h1>
          <p className="text-gray-400 mt-3 max-w-md mx-auto">
            Select your program, choose a time, and confirm your session in minutes.
          </p>
          {!portalPath ? (
            <div className="mt-4 flex justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Not ready yet? Back to Home
              </Link>
            </div>
          ) : null}
        </div>

        <div className={`mb-6 bg-[#111] border border-[#1e1e1e] rounded-2xl px-4 py-4 sm:px-6 ${isTwoColumn ? 'max-w-5xl mx-auto' : 'max-w-3xl mx-auto'}`}>
          <StepIndicator steps={steps} current={step} />
        </div>

        <div className={`${isTwoColumn ? 'max-w-5xl' : 'max-w-3xl'} mx-auto`}>
          <div className={`${isTwoColumn ? 'lg:flex lg:gap-8 lg:items-start' : ''}`}>
            <div className="flex-1 min-w-0">
              {step === 1 && (
                <div className="card p-6 sm:p-8">
                  <h2 className="text-white font-black text-2xl mb-2">Choose Your Program</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Not sure which to choose? Use the <span className="text-amber-500/80 font-semibold">Best for:</span> label to see who each program fits best.
                  </p>
                  {loadingPrograms ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton h-[72px] rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {programs.map((program) => (
                        <button
                          key={program.id}
                          type="button"
                          onClick={() => {
                            if (isSummerTrainingProgram(program) && summerTrainingEvent) {
                              navigate(`/events/${summerTrainingEvent.id}/register`)
                              return
                            }
                            setSelectedProgram(program)
                            setStep(2)
                          }}
                          className="w-full rounded-xl border border-[#282828] bg-[#141414] px-5 py-4 text-left transition-all duration-200 group hover:border-amber-500/50 hover:bg-[#1a1500]"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-4">
                              {program.mediaUrl ? (
                                <MediaAsset
                                  src={program.mediaUrl}
                                  type={program.mediaType ?? 'IMAGE'}
                                  alt={`${program.name} program`}
                                  loading="eager"
                                  className={`h-14 w-14 flex-shrink-0 rounded-xl bg-black ${isPromotionalProgram(program) ? 'object-contain p-1' : 'object-cover'}`}
                                />
                              ) : (
                                <span className="text-3xl flex-shrink-0">{program.icon}</span>
                              )}
                              <div className="min-w-0">
                              <p className="text-white font-bold text-sm">{program.name}</p>
                              <p className="text-gray-500 text-xs mt-0.5">{program.shortDescription}</p>
                              {program.whoItsFor && (
                                <p className="text-amber-500/60 text-xs mt-1 font-medium">Best for: {program.whoItsFor}</p>
                              )}
                            </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 border-t border-[#242424] pt-3 sm:flex-shrink-0 sm:border-t-0 sm:pt-0">
                              <span className="text-amber-500 font-black">{program.priceLabel}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                              </svg>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 2 && selectedProgram && (
                <div className="card p-6 sm:p-8">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Change program
                  </button>

                  <h2 className="text-white font-black text-2xl mb-2">Pick a Date & Time</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Bookings are first come, first served. Evening and weekend sessions go fastest.
                  </p>

                  <Field label="Select Date" htmlFor="bookingDate" required>
                    <input
                      id="bookingDate"
                      type="date"
                      name="bookingDate"
                      className="input-field-default"
                      value={form.bookingDate}
                      onChange={handleChange}
                      min={getTomorrowDate()}
                      max={getMaxDate()}
                    />
                  </Field>

                  {form.bookingDate && (
                    <div className="mt-7">
                      <p id="available-time-slots-label" className="block text-gray-400 text-xs font-semibold uppercase mb-3">
                        Available Time Slots <span className="text-amber-500">*</span>
                      </p>
                      {loadingSlots ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-labelledby="available-time-slots-label">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className="skeleton h-10 rounded-lg" />
                          ))}
                        </div>
                      ) : !availability || availability.availableSlots.length === 0 ? (
                        <div className="bg-[#141414] border border-[#222] rounded-xl p-6 text-center">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg></div>
                          <p className="text-white font-bold text-sm mb-1">No slots available</p>
                          <p className="text-gray-400 text-xs">
                            All spots are taken for this day. Please choose a different date.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {availability.availableSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setForm((prev) => ({ ...prev, bookingTime: slot }))}
                              aria-pressed={form.bookingTime === slot}
                              className={`py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                                form.bookingTime === slot
                                  ? 'bg-amber-500 text-black shadow-amber'
                                  : 'bg-[#141414] border border-[#282828] text-gray-300 hover:border-amber-500/40 hover:text-white'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn-primary w-full justify-center mt-6 py-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                    onClick={() => setStep(3)}
                    disabled={!form.bookingDate || !form.bookingTime}
                  >
                    Continue to Details
                  </button>
                </div>
              )}

              {step === 3 && selectedProgram && (
                <div className="card p-6 sm:p-8">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Change date and time
                  </button>

                  <h2 className="text-white font-black text-2xl mb-2">Player & Contact Details</h2>
                  <p className="text-gray-500 text-sm mb-6">Tell us about the player so Coach Kante can prepare for the session.</p>

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
                      <Field label="Age Group" htmlFor="playerAge" required>
                        <select
                          id="playerAge"
                          className="select-field"
                          name="playerAge"
                          value={form.playerAge}
                          onChange={handleChange}
                        >
                          <option value="">Select age group...</option>
                          {ageGroups.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
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
                        onBlur={handleBlur}
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
                          {user ? (
                            <p className="text-gray-600 text-xs mt-2">
                              Using your signed in account email so this booking appears in your portal.
                            </p>
                          ) : null}
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

                    <Field label="Experience Level" htmlFor="experienceLevel">
                      <select
                        id="experienceLevel"
                        className="select-field"
                        name="experienceLevel"
                        value={form.experienceLevel}
                        onChange={handleChange}
                      >
                        <option value="">Select experience level (optional)...</option>
                        {experienceLevels.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Goals or Notes (optional)" htmlFor="notes">
                      <textarea
                        id="notes"
                        className="textarea-field"
                        rows={3}
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        placeholder="Share goals, focus areas, or anything Coach Kante should know before the session."
                      />
                    </Field>
                  </div>

                  <button
                    type="button"
                    className="btn-primary w-full justify-center mt-6 py-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                    onClick={() => {
                      if (validateStep3()) setStep(4)
                    }}
                    disabled={!form.playerName || !form.email || !form.phone}
                  >
                    Review Booking
                  </button>
                </div>
              )}

              {step === 4 && selectedProgram && (
                <div className="card p-6 sm:p-8">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Edit details
                  </button>

                  <h2 className="text-white font-black text-2xl mb-2">Confirm Booking</h2>
                  <p className="text-gray-500 text-sm mb-6">Review your booking below, then confirm your session.</p>

                  <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl overflow-hidden mb-6">
                    <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1e1e1e] bg-[#111]">
                      {selectedProgram.mediaUrl ? (
                        <MediaAsset
                          src={selectedProgram.mediaUrl}
                          type={selectedProgram.mediaType ?? 'IMAGE'}
                          alt={`${selectedProgram.name} program`}
                          loading="eager"
                          className={`h-14 w-14 rounded-xl bg-black ${isPromotionalProgram(selectedProgram) ? 'object-contain p-1' : 'object-cover'}`}
                        />
                      ) : (
                        <span className="text-3xl">{selectedProgram.icon}</span>
                      )}
                      <div>
                        <p className="text-white font-black text-base">{selectedProgram.name}</p>
                        <p className="text-amber-500 font-bold text-sm">{selectedProgram.priceLabel}</p>
                      </div>
                    </div>

                    <div className="px-6 py-5 space-y-3 text-sm">
                      {([
                        ['Date', formatDisplayDate(form.bookingDate)],
                        ['Time', form.bookingTime],
                        ['Player', form.playerName],
                        form.playerAge ? ['Age Group', form.playerAge] : null,
                        form.parentName ? ['Parent / Guardian', form.parentName] : null,
                        ['Email', form.email],
                        ['Phone', form.phone],
                        form.experienceLevel
                          ? ['Experience', experienceLevels.find((l) => l.value === form.experienceLevel)?.label ?? form.experienceLevel]
                          : null,
                      ] as (string[] | null)[])
                        .filter((row): row is string[] => row !== null)
                        .map(([label, value]) => (
                          <div key={label} className="flex justify-between items-start gap-4">
                            <span className="text-gray-500 flex-shrink-0">{label}</span>
                            <span className="text-white font-semibold text-right">{value}</span>
                          </div>
                        ))}
                    </div>

                    <div className="px-6 py-4 border-t border-[#1e1e1e] bg-[#111] flex justify-between items-center">
                      <span className="text-gray-400 font-semibold">Session Rate</span>
                      <span className="text-amber-500 font-black text-xl">{selectedProgram.priceLabel}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 text-sm mb-5 flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={submitting}
                    className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                  >
                    {submitting ? (
                      <>
                        <svg className="w-5 h-5 animate-spin -ml-1 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Confirming your booking...
                      </>
                    ) : (
                      paymentsEnabled ? 'Continue to Payment' : 'Confirm Booking'
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <p className="text-gray-600 text-xs">We will send your confirmation right away and follow up before the session if needed.</p>
                  </div>
                  <p className="text-center text-gray-700 text-xs mt-3">
                    By confirming you agree to our{' '}
                    <Link to="/cancellation-policy" className="underline hover:text-gray-500 transition-colors">
                      Cancellation &amp; Refund Policy
                    </Link>
                    {' '}and{' '}
                    <Link to="/terms" className="underline hover:text-gray-500 transition-colors">
                      Terms of Service
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>

            {isTwoColumn && (
              <BookingSidebar
                program={selectedProgram}
                date={form.bookingDate}
                time={form.bookingTime}
                playerName={form.playerName}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

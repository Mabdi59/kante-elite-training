import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPrograms, getAvailability, createCheckoutSession } from '../services/api'
import type { Program, AvailabilityData, BookingFormData } from '../types'

const experienceLevels = [
  { value: 'beginner', label: 'Beginner — Just starting out' },
  { value: 'intermediate', label: 'Intermediate — Playing recreationally' },
  { value: 'advanced', label: 'Advanced — Competitive club player' },
  { value: 'elite', label: 'Elite — High school / academy level' },
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

interface StepProps {
  number: number
  title: string
  active: boolean
  completed: boolean
}

function Step({ number, title, active, completed }: StepProps) {
  return (
    <div className={`flex items-center gap-2 ${active ? 'text-white' : completed ? 'text-amber-500' : 'text-gray-600'}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
          completed
            ? 'bg-amber-500 text-black'
            : active
            ? 'bg-white text-black'
            : 'bg-[#222] text-gray-500'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <span className="text-xs font-semibold hidden sm:block">{title}</span>
    </div>
  )
}

const INITIAL_FORM: Omit<BookingFormData, 'programId'> = {
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
  const [searchParams] = useSearchParams()
  const preselectedProgramId = searchParams.get('program')

  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [step, setStep] = useState(1)
  const [loadingPrograms, setLoadingPrograms] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [cancelled, setCancelled] = useState(searchParams.get('cancelled') === 'true')

  // Load programs
  useEffect(() => {
    getPrograms()
      .then((p) => {
        setPrograms(p)
        if (preselectedProgramId) {
          const found = p.find((prog) => prog.slug === preselectedProgramId || prog.id === Number(preselectedProgramId))
          if (found) {
            setSelectedProgram(found)
            setStep(2)
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingPrograms(false))
  }, [preselectedProgramId])

  // Load availability when program + date selected
  useEffect(() => {
    if (!selectedProgram || !form.bookingDate) return
    setLoadingSlots(true)
    setAvailability(null)
    getAvailability(selectedProgram.id, form.bookingDate)
      .then(setAvailability)
      .catch(console.error)
      .finally(() => setLoadingSlots(false))
  }, [selectedProgram, form.bookingDate])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
    if (e.target.name === 'bookingDate') {
      setForm((prev) => ({ ...prev, bookingDate: e.target.value, bookingTime: '' }))
    }
  }

  async function handleCheckout() {
    if (!selectedProgram) return
    if (!form.bookingDate || !form.bookingTime) {
      setError('Please select a date and time.')
      return
    }
    if (!form.playerName || !form.email || !form.phone) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const url = await createCheckoutSession({
        programId: selectedProgram.id,
        ...form,
      })
      window.location.href = url
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      setError(message ?? 'Could not start checkout. Please try again.')
      setSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: 'Choose Program' },
    { number: 2, title: 'Pick Date & Time' },
    { number: 3, title: 'Your Details' },
    { number: 4, title: 'Confirm & Pay' },
  ]

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center pt-10 mb-10">
          <p className="section-label">Booking</p>
          <h1 className="text-white font-black text-4xl">Book a Session</h1>
          <p className="text-gray-400 mt-3">Select your program, pick a time, and secure your spot.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-10 bg-[#111] border border-[#222] rounded-xl px-6 py-4">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center">
              <Step
                number={s.number}
                title={s.title}
                active={step === s.number}
                completed={step > s.number}
              />
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-px mx-3 ${step > s.number ? 'bg-amber-500' : 'bg-[#333]'}`} />
              )}
            </div>
          ))}
        </div>

        {cancelled && (
          <div className="bg-amber-900/20 border border-amber-500/30 text-amber-400 rounded-xl px-5 py-4 text-sm mb-6">
            Your payment was cancelled. No charges were made. You can try again below.
          </div>
        )}

        {/* STEP 1: Choose program */}
        {step === 1 && (
          <div className="card p-8">
            <h2 className="text-white font-black text-2xl mb-6">Choose Your Program</h2>
            {loadingPrograms ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-[#1a1a1a] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {programs.map((program) => (
                  <button
                    key={program.id}
                    onClick={() => {
                      setSelectedProgram(program)
                      setStep(2)
                      setCancelled(false)
                    }}
                    className="w-full flex items-center justify-between gap-4 bg-[#1a1a1a] border border-[#333] hover:border-amber-500/50 rounded-xl px-5 py-4 text-left transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{program.icon}</span>
                      <div>
                        <p className="text-white font-bold">{program.name}</p>
                        <p className="text-gray-500 text-xs">{program.shortDescription}</p>
                      </div>
                    </div>
                    <span className="text-amber-500 font-black whitespace-nowrap">{program.priceLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Date & time */}
        {step === 2 && selectedProgram && (
          <div className="card p-8">
            <button onClick={() => setStep(1)} className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-1">
              ← Back
            </button>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{selectedProgram.icon}</span>
              <div>
                <h2 className="text-white font-black text-xl">{selectedProgram.name}</h2>
                <p className="text-amber-500 font-bold">{selectedProgram.priceLabel}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Select Date *
              </label>
              <input
                type="date"
                name="bookingDate"
                className="input-field"
                value={form.bookingDate}
                onChange={handleChange}
                min={getTomorrowDate()}
                max={getMaxDate()}
              />
            </div>

            {form.bookingDate && (
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  Available Time Slots *
                </label>
                {loadingSlots ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-10 bg-[#1a1a1a] rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : availability && availability.availableSlots.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No available slots for this date. Please choose a different day.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availability?.availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setForm((prev) => ({ ...prev, bookingTime: slot }))}
                        className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                          form.bookingTime === slot
                            ? 'bg-amber-500 text-black'
                            : 'bg-[#1a1a1a] border border-[#333] text-gray-300 hover:border-amber-500/50 hover:text-white'
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
              className="btn-primary w-full text-center mt-8 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => setStep(3)}
              disabled={!form.bookingDate || !form.bookingTime}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 3: Player details */}
        {step === 3 && selectedProgram && (
          <div className="card p-8">
            <button onClick={() => setStep(2)} className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-1">
              ← Back
            </button>
            <h2 className="text-white font-black text-2xl mb-6">Player & Contact Details</h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Player Name *
                  </label>
                  <input className="input-field" name="playerName" value={form.playerName} onChange={handleChange} placeholder="Player's full name" required />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Age Group *
                  </label>
                  <select className="select-field" name="playerAge" value={form.playerAge} onChange={handleChange}>
                    <option value="">Select age group...</option>
                    {ageGroups.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Parent / Guardian Name
                </label>
                <input className="input-field" name="parentName" value={form.parentName} onChange={handleChange} placeholder="Parent or guardian name" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input className="input-field" type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Phone Number *
                  </label>
                  <input className="input-field" name="phone" value={form.phone} onChange={handleChange} placeholder="(614) 000-0000" required />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Experience Level
                </label>
                <select className="select-field" name="experienceLevel" value={form.experienceLevel} onChange={handleChange}>
                  <option value="">Select experience level...</option>
                  {experienceLevels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Notes / Goals (optional)
                </label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any specific goals, areas to focus on, or other notes for Coach Kante..."
                />
              </div>
            </div>

            <button
              className="btn-primary w-full text-center mt-8 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => setStep(4)}
              disabled={!form.playerName || !form.email || !form.phone}
            >
              Review Booking →
            </button>
          </div>
        )}

        {/* STEP 4: Confirm */}
        {step === 4 && selectedProgram && (
          <div className="card p-8">
            <button onClick={() => setStep(3)} className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-1">
              ← Back
            </button>
            <h2 className="text-white font-black text-2xl mb-6">Confirm Your Booking</h2>

            <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#222]">
                <span className="text-4xl">{selectedProgram.icon}</span>
                <div>
                  <p className="text-white font-black text-lg">{selectedProgram.name}</p>
                  <p className="text-amber-500 font-bold">{selectedProgram.priceLabel}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ['Date', new Date(form.bookingDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })],
                  ['Time', form.bookingTime],
                  ['Player', form.playerName],
                  form.playerAge ? ['Age Group', form.playerAge] : null,
                  form.parentName ? ['Parent / Guardian', form.parentName] : null,
                  ['Email', form.email],
                  ['Phone', form.phone],
                  form.experienceLevel ? ['Experience', experienceLevels.find(l => l.value === form.experienceLevel)?.label ?? form.experienceLevel] : null,
                ].filter((row): row is string[] => row !== null).map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-semibold text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-4 text-sm text-amber-300 mb-6">
              🔒 You'll be taken to a secure Stripe checkout page. We never store your card details.
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm mb-5">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="btn-primary w-full text-center text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Redirecting to payment...' : `Pay ${selectedProgram.priceLabel} Securely →`}
            </button>

            <p className="text-gray-600 text-xs text-center mt-4">
              Powered by Stripe. Your session is confirmed immediately after payment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

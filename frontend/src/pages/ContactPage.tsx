import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import ErrorBanner from '../components/ErrorBanner'
import HeroSection from '../components/HeroSection'
import PublicProofBand from '../components/PublicProofBand'
import { Section } from '../components/Section'
import { useAuth } from '../context/AuthContext'
import { submitContact } from '../services/api'
import type { ContactFormData } from '../types'

const subjects = [
  'General Inquiry',
  'Private Training',
  'Small Group Training',
  'Speed & Agility',
  'Technical Development',
  'Training Camps',
  'Events & Registration',
  'Other',
]

const initialForm: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

const contactProofItems = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18M8 2v4M16 2v4" />
      </svg>
    ),
    label: 'Reply usually within 24 hours',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6Z" />
      </svg>
    ),
    label: 'Call Coach Kante directly',
    href: 'tel:+16142852317',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
    label: 'Based in Columbus, Ohio',
  },
]

const contactDetails = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
    label: 'Email',
    value: 'kanteelitetraining@gmail.com',
    href: 'mailto:kanteelitetraining@gmail.com',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6Z" />
      </svg>
    ),
    label: 'Phone',
    value: '(614) 285-2317',
    href: 'tel:+16142852317',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
    label: 'Location',
    value: 'Columbus, Ohio',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    label: 'Response Time',
    value: 'Within 24 hours',
  },
]

export default function ContactPage() {
  const { user } = useAuth()
  const [form, setForm] = useState<ContactFormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name,
      email: prev.email || user.email,
    }))
  }, [user])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await submitContact(form)
      setSuccess(true)
      setForm(initialForm)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      setError(message ?? 'Something went wrong. Please try again or email us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <HeroSection
        badge="Get in Touch"
        title="Contact Coach Kante"
        subtitle="Need help choosing the right program, booking a session, or planning your player's next step? Reach out and we usually reply within 24 hours."
        mediaPlacement="CONTACT_HERO"
      />

      <PublicProofBand items={contactProofItems} />

      <Section divider={false} shellClassName="grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-2xl border border-[#222] bg-[#111111] p-6">
              <div className="mb-5">
                <BrandMark size="footer" />
              </div>
              <p className="section-label">Need Help Choosing?</p>
              <h2 className="mb-4 text-3xl font-black text-white">
                Reach Coach <span className="text-amber-500">Directly</span>
              </h2>
              <p className="text-sm leading-relaxed text-gray-400">
                Send a message if you want help choosing the right fit, confirming an age group, or planning the next step for your player.
              </p>
              <div className="mt-6 space-y-3">
                <Link
                  to="/training"
                  className="flex items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] px-4 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-[#3a3a3a] hover:text-white"
                >
                  Explore Training Programs
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500/80" fill="none" viewBox="0 0 24 24" strokeWidth={2.25} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <a
                  href="tel:+16142852317"
                  className="flex items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] px-4 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-[#3a3a3a] hover:text-white"
                >
                  Call (614) 285-2317
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500/80" fill="none" viewBox="0 0 24 24" strokeWidth={2.25} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6Z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <p className="section-label">Reach Us</p>
              <h2 className="mb-6 text-3xl font-black text-white">
                Direct Contact <span className="text-amber-500">Details</span>
              </h2>
              <div className="space-y-6">
                {contactDetails.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
                      {item.icon}
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs font-semibold uppercase text-gray-400">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-semibold text-white transition-colors hover:text-amber-400">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-white">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#222] bg-[#111111] p-6">
              <div className="mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
                <p className="text-sm font-bold text-amber-500">Quick Tip</p>
              </div>
              <p className="text-sm leading-relaxed text-gray-400">
                For the fastest reply, include your player&apos;s age, current level, preferred training type, and the days or times that usually work best.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            {success ? (
              <div className="card p-10 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl font-black text-white">Message Sent</h3>
                <p className="mx-auto mb-6 max-w-sm leading-relaxed text-gray-400">
                  Thanks for reaching out. Coach Kante will reply within 24 hours, and often sooner.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false)
                      setForm({
                        ...initialForm,
                        name: user?.name ?? '',
                        email: user?.email ?? '',
                      })
                    }}
                    className="btn-secondary text-sm"
                  >
                    Send Another Message
                  </button>
                  <Link to="/training" className="btn-primary text-sm">
                    View Programs
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-8">
                <h3 className="mb-2 text-xl font-black text-white">Send a Message</h3>
                <p className="mb-7 text-sm text-gray-500">Questions about program fit, age groups, scheduling, or booking help are all welcome.</p>

                <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-gray-400">
                      Full Name <span className="text-amber-500">*</span>
                    </label>
                    <input
                      className="input-field-default"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-gray-400">
                      Email Address <span className="text-amber-500">*</span>
                    </label>
                    <input
                      className="input-field-default"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-gray-400">
                      Phone Number
                    </label>
                    <input
                      className="input-field-default"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(614) 000-0000"
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-gray-400">
                      Subject
                    </label>
                    <select
                      className="select-field"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                    >
                      <option value="">Select a subject...</option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-xs font-semibold uppercase text-gray-400">
                    Message <span className="text-amber-500">*</span>
                  </label>
                  <textarea
                    className="textarea-field"
                    rows={5}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your player, goals, and any questions you have."
                    required
                    minLength={10}
                  />
                </div>

                {error ? (
                  <div className="mb-5">
                    <ErrorBanner message={error} onDismiss={() => setError('')} />
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  {submitting ? (
                    <>
                      <svg className="-ml-1 mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : 'Send Message'}
                </button>

                <p className="mt-4 text-center text-xs text-gray-600">
                  We respect your privacy and never share your information.
                </p>
              </form>
            )}
          </div>
      </Section>
    </div>
  )
}

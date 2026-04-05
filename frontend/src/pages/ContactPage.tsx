import { useEffect, useState } from 'react'
import { submitContact } from '../services/api'
import type { ContactFormData } from '../types'
import HeroSection from '../components/HeroSection'

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

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Contact | Kante Elite Training — Columbus, Ohio'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

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
    <div className="pt-20">
      <HeroSection
        badge="Get in Touch"
        title="Contact Coach Kante"
        subtitle="Have a question about training, events, or scheduling? We usually reply within 24 hours."
      />

      <section className="bg-black py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <p className="section-label">Reach Us</p>
            <h2 className="text-white font-black text-3xl mb-6">
              We'd Love to <span className="text-amber-500">Hear From You</span>
            </h2>
            <div className="space-y-6">
              {[
                { icon: '📧', label: 'Email', value: 'kanteelitetraining@gmail.com', href: 'mailto:kanteelitetraining@gmail.com' },
                { icon: '📱', label: 'Phone', value: '(614) 285-2317', href: 'tel:+16142852317' },
                { icon: '📍', label: 'Location', value: 'Columbus, Ohio', href: undefined },
                { icon: '⏰', label: 'Response Time', value: 'Within 24 hours', href: undefined },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-lg">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-white font-semibold hover:text-amber-400 transition-colors text-sm">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-white font-semibold text-sm">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-[#111111] border border-[#222] rounded-xl p-6">
              <p className="text-amber-500 font-bold text-sm mb-2">💡 Quick Tip</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                For the fastest response, include your player's age, current level, and the program you are interested in.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            {success ? (
              <div className="card p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-white font-black text-2xl mb-3">Message Sent</h3>
                <p className="text-gray-400 leading-relaxed mb-6 max-w-sm mx-auto">
                  Thanks for reaching out. Coach Kante will reply within 24 hours, and often sooner.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="btn-secondary text-sm"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-8">
                <h3 className="text-white font-black text-xl mb-2">Send a Message</h3>
                <p className="text-gray-500 text-sm mb-7">We usually reply within 24 hours. Many messages are answered sooner.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
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
                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
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
                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
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
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
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

                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 text-sm mb-5 flex items-start gap-3">
                    <span className="flex-shrink-0">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin -ml-1 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : 'Send Message'}
                </button>

                <p className="text-gray-600 text-xs text-center mt-4">
                  We respect your privacy and never share your information.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}


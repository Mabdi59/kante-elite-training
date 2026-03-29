import { useState } from 'react'
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
        subtitle="Have a question about a program, event, or anything else? We typically respond within 24 hours."
      />

      <section className="bg-black py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-2">
            <p className="section-label">Reach Us</p>
            <h2 className="text-white font-black text-3xl mb-8">
              We'd Love to <span className="text-amber-500">Hear From You</span>
            </h2>
            <div className="space-y-6">
              {[
                { icon: '📧', label: 'Email', value: 'info@kanteelitetraining.com', href: 'mailto:info@kanteelitetraining.com' },
                { icon: '📱', label: 'Phone', value: '(614) 555-0100', href: 'tel:+16145550100' },
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
                For the fastest response, include your player's age, current skill level, and which
                program you're interested in.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {success ? (
              <div className="card p-10 text-center">
                <div className="text-6xl mb-6">✅</div>
                <h3 className="text-white font-black text-2xl mb-3">Message Sent!</h3>
                <p className="text-gray-400 leading-relaxed mb-8">
                  Thank you for reaching out. Coach Kante will respond to your inquiry within 24
                  hours.
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
                <h3 className="text-white font-black text-xl mb-7">Send a Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      className="input-field"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <input
                      className="input-field"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
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
                      className="input-field"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(614) 000-0000"
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
                    Message *
                  </label>
                  <textarea
                    className="textarea-field"
                    rows={5}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your player, their goals, and any questions you have..."
                    required
                    minLength={10}
                  />
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm mb-5">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full text-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
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

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const LAST_UPDATED = 'April 25, 2025'
const BUSINESS_NAME = 'Kante Elite Training'
const BUSINESS_EMAIL = 'kanteelitetraining@gmail.com'
const BUSINESS_PHONE = '(614) 285-2317'

export default function CancellationPolicyPage() {
  useEffect(() => {
    document.title = 'Cancellation & Refund Policy — Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  return (
    <div className="min-h-screen bg-black px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Home
          </Link>
          <span className="section-label">Legal</span>
          <h1 className="text-white font-black text-4xl mt-2 mb-2">Cancellation &amp; Refund Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose-dark space-y-8">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-sm text-amber-300 leading-relaxed">
            <p className="font-semibold text-amber-400 mb-1">Quick Summary</p>
            <p>
              Cancel or reschedule at least <strong>24 hours before</strong> your session and we&apos;ll offer a full rescheduling or credit. Cancellations with less than 24 hours&apos; notice and no-shows are non-refundable. Coach-initiated cancellations receive a full refund or reschedule at your choice.
            </p>
          </div>

          <Section title="1. Client Cancellations">
            <div className="space-y-4">
              <PolicyRow
                label="More than 24 hours before the session"
                status="green"
                statusLabel="Full Reschedule / Credit"
                desc="You may cancel or reschedule with no penalty. We will issue a full session credit or reschedule at no extra cost."
              />
              <PolicyRow
                label="Less than 24 hours before the session"
                status="red"
                statusLabel="No Refund"
                desc="Due to the reserved coaching time and preparation involved, cancellations made within 24 hours of the scheduled session are non-refundable."
              />
              <PolicyRow
                label="No-show (failure to attend without notice)"
                status="red"
                statusLabel="No Refund"
                desc="Sessions missed without any notice are considered forfeit. We recommend contacting us as early as possible if you cannot attend."
              />
            </div>
          </Section>

          <Section title="2. Coach-Initiated Cancellations">
            <p>
              If {BUSINESS_NAME} cancels a session due to coach unavailability, weather, or facility issues, you will receive your choice of:
            </p>
            <ul>
              <li>A full refund to your original payment method, or</li>
              <li>A session credit to reschedule at no extra charge</li>
            </ul>
            <p>We will notify you as early as possible in the event of any coach-initiated cancellation.</p>
          </Section>

          <Section title="3. Rescheduling">
            <p>
              You may reschedule a session at any time before the 24-hour cutoff without penalty, subject to availability. To reschedule, contact us at <a href={`mailto:${BUSINESS_EMAIL}`} className="text-amber-500 hover:text-amber-400">{BUSINESS_EMAIL}</a> or call <a href="tel:+16142852317" className="text-amber-500 hover:text-amber-400">{BUSINESS_PHONE}</a>.
            </p>
          </Section>

          <Section title="4. Packages and Multi-Session Bookings">
            <p>
              If you have purchased a package or multiple sessions, unused sessions may be rescheduled subject to availability. Refunds on partially used packages are prorated based on the per-session rate for sessions that have not yet occurred, minus any applicable fees, and only if requested more than 24 hours before the next scheduled session.
            </p>
          </Section>

          <Section title="5. Weather and Safety">
            <p>
              Outdoor sessions may be cancelled or moved indoors due to unsafe weather conditions. In the event of a weather cancellation, we will contact you as soon as possible and offer a full reschedule or credit. Weather cancellations are not subject to the standard cancellation window.
            </p>
          </Section>

          <Section title="6. How to Cancel or Reschedule">
            <p>To cancel or reschedule a session:</p>
            <ul>
              <li>Email us at <a href={`mailto:${BUSINESS_EMAIL}`} className="text-amber-500 hover:text-amber-400">{BUSINESS_EMAIL}</a></li>
              <li>Call or text <a href="tel:+16142852317" className="text-amber-500 hover:text-amber-400">{BUSINESS_PHONE}</a></li>
              <li>Use the messaging feature in your account portal</li>
            </ul>
            <p>Please include your name, session date, and booking reference when contacting us.</p>
          </Section>

          <Section title="7. Refund Processing">
            <p>
              Approved refunds are issued to your original payment method within 5–10 business days, depending on your bank or card provider. Processing time may vary and is outside our control once initiated.
            </p>
          </Section>

          <Section title="8. Contact Us">
            <p>Questions about your booking or refund? We&apos;re happy to help:</p>
            <div className="mt-3 bg-[#111] border border-[#222] rounded-xl p-4 space-y-1 text-sm">
              <p className="text-white font-semibold">{BUSINESS_NAME}</p>
              <p>Email: <a href={`mailto:${BUSINESS_EMAIL}`} className="text-amber-500 hover:text-amber-400">{BUSINESS_EMAIL}</a></p>
              <p>Phone/Text: <a href="tel:+16142852317" className="text-amber-500 hover:text-amber-400">{BUSINESS_PHONE}</a></p>
            </div>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1a1a1a] flex flex-wrap gap-4 text-sm text-gray-500">
          <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
          <Link to="/cookie-policy" className="hover:text-amber-400 transition-colors">Cookie Policy</Link>
          <Link to="/accessibility" className="hover:text-amber-400 transition-colors">Accessibility</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-white font-black text-xl mb-3">{title}</h2>
      <div className="text-gray-400 text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  )
}

function PolicyRow({
  label,
  status,
  statusLabel,
  desc,
}: {
  label: string
  status: 'green' | 'red' | 'yellow'
  statusLabel: string
  desc: string
}) {
  const statusClasses = {
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    red: 'bg-red-900/20 border-red-500/20 text-red-400',
    yellow: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  }
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-white font-semibold text-sm">{label}</p>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusClasses[status]} shrink-0`}>
          {statusLabel}
        </span>
      </div>
      <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
    </div>
  )
}

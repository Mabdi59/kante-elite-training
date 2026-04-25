import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const LAST_UPDATED = 'April 25, 2025'
const BUSINESS_NAME = 'Kante Elite Training'
const BUSINESS_EMAIL = 'kanteelitetraining@gmail.com'
const BUSINESS_PHONE = '(614) 285-2317'

export default function TermsOfServicePage() {
  useEffect(() => {
    document.title = 'Terms of Service | Kante Elite Training'
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
          <h1 className="text-white font-black text-4xl mt-2 mb-2">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose-dark space-y-8">
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6 text-sm text-gray-300 leading-relaxed space-y-3">
            <p>
              Please read these Terms of Service carefully before using the {BUSINESS_NAME} website or booking a training session. By accessing our website or purchasing services, you agree to be bound by these terms.
            </p>
          </div>

          <Section title="1. Services">
            <p>
              {BUSINESS_NAME} provides individual and group youth soccer training sessions in Columbus, Ohio. Services are booked through our website and are subject to availability. We reserve the right to modify, suspend, or discontinue any service with reasonable notice.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              Our training programs are designed for youth players aged U8 through adult. By booking a session for a minor, the parent or legal guardian represents that they have authority to agree to these terms on behalf of the minor and accept full responsibility for the participant.
            </p>
          </Section>

          <Section title="3. Bookings and Payments">
            <ul>
              <li>Sessions are confirmed upon receipt of full payment at the time of booking.</li>
              <li>Prices are displayed on our website and are subject to change without prior notice to new bookings.</li>
              <li>Payment is processed securely through Stripe. We do not store payment card information.</li>
              <li>All bookings are subject to our <Link to="/cancellation-policy" className="text-amber-500 hover:text-amber-400">Cancellation and Refund Policy</Link>.</li>
            </ul>
          </Section>

          <Section title="4. Cancellation and Rescheduling">
            <p>
              Please review our <Link to="/cancellation-policy" className="text-amber-500 hover:text-amber-400">Cancellation Policy</Link> for full details on refunds and rescheduling. In general, cancellations made more than 24 hours before a session may be eligible for rescheduling or credit. Late cancellations and no-shows are not refunded.
            </p>
          </Section>

          <Section title="5. Assumption of Risk and Liability Waiver">
            <p>
              <strong className="text-white">Participation in physical athletic training involves inherent risks</strong>, including but not limited to physical injury, soreness, or illness. By booking and participating in a {BUSINESS_NAME} session, you (or the parent/guardian of a minor participant) voluntarily assume all risks associated with participation.
            </p>
            <p>
              To the maximum extent permitted by applicable law, {BUSINESS_NAME} and its coaches, employees, and affiliates shall not be liable for any injury, loss, damage, or expense arising from participation in training sessions.
            </p>
            <p>
              Additional liability waiver documentation may be required at the time of participation.
            </p>
          </Section>

          <Section title="6. Code of Conduct">
            <p>All participants and guardians are expected to:</p>
            <ul>
              <li>Behave respectfully toward coaches, other players, and facility staff</li>
              <li>Arrive on time and prepared for sessions</li>
              <li>Follow all safety instructions provided by the coach</li>
              <li>Not participate if injured or ill without prior clearance</li>
            </ul>
            <p className="mt-3">
              {BUSINESS_NAME} reserves the right to refuse service or remove any participant who behaves in an unsafe, disruptive, or disrespectful manner, without refund.
            </p>
          </Section>

          <Section title="7. Photography and Media">
            <p>
              {BUSINESS_NAME} may photograph or record training sessions for promotional purposes, including use on our website and social media. By participating, you consent to such use unless you notify us in writing prior to your session.
            </p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              All content on this website | including text, graphics, logos, training materials, and media | is the property of {BUSINESS_NAME} and may not be reproduced, distributed, or used without express written permission.
            </p>
          </Section>

          <Section title="9. Governing Law">
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the State of Ohio, without regard to conflict of law principles. Any disputes arising under these terms shall be resolved in the courts located in Franklin County, Ohio.
            </p>
          </Section>

          <Section title="10. Changes to These Terms">
            <p>
              We may update these Terms of Service at any time. The &ldquo;Last updated&rdquo; date at the top of this page indicates when revisions were last made. Continued use of our website or services after changes constitutes your acceptance of the updated terms.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>Questions about these terms? Contact us:</p>
            <div className="mt-3 bg-[#111] border border-[#222] rounded-xl p-4 space-y-1 text-sm">
              <p className="text-white font-semibold">{BUSINESS_NAME}</p>
              <p>Email: <a href={`mailto:${BUSINESS_EMAIL}`} className="text-amber-500 hover:text-amber-400">{BUSINESS_EMAIL}</a></p>
              <p>Phone: <a href="tel:+16142852317" className="text-amber-500 hover:text-amber-400">{BUSINESS_PHONE}</a></p>
              <p>Columbus, Ohio</p>
            </div>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1a1a1a] flex flex-wrap gap-4 text-sm text-gray-500">
          <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
          <Link to="/cancellation-policy" className="hover:text-amber-400 transition-colors">Cancellation Policy</Link>
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

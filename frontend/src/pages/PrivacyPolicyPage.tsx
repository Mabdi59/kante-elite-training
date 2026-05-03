import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const LAST_UPDATED = 'April 25, 2025'
const BUSINESS_NAME = 'Kante Elite Training'
const BUSINESS_EMAIL = 'kanteelitetraining@gmail.com'
const BUSINESS_PHONE = '(614) 285-2317'

export default function PrivacyPolicyPage() {
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
          <h1 className="text-white font-black text-4xl mt-2 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose-dark space-y-8">
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6 text-sm text-gray-300 leading-relaxed space-y-4">
            <p>
              {BUSINESS_NAME} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
            </p>
            <p>
              By using our website or booking a training session, you agree to the practices described in this policy.
            </p>
          </div>

          <Section title="1. Information We Collect">
            <p>We collect information you provide directly to us, including:</p>
            <ul>
              <li><strong>Contact information</strong> | name, email address, phone number</li>
              <li><strong>Player information</strong> | player name, age, skill level, and training goals</li>
              <li><strong>Account information</strong> | username and password when you register</li>
              <li><strong>Booking details</strong> | selected program, preferred date and time, session notes</li>
              <li><strong>Payment information</strong> | processed securely via Stripe; we do not store card numbers</li>
              <li><strong>Communications</strong> | messages you send us through the contact form or email</li>
            </ul>
            <p className="mt-3">We may also automatically collect technical information such as your browser type, IP address, and pages visited, to help improve site performance.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and confirm session bookings</li>
              <li>Communicate about your scheduled sessions and follow-up</li>
              <li>Send booking confirmations and reminders</li>
              <li>Provide and improve our coaching services</li>
              <li>Respond to questions, requests, or support inquiries</li>
              <li>Comply with applicable laws and protect our legal rights</li>
            </ul>
            <p className="mt-3">We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </Section>

          <Section title="3. Payments">
            <p>
              Payment processing is handled by <strong>Stripe</strong>, a PCI-DSS-compliant payment processor. When you enter payment information, it is transmitted directly to Stripe. We do not store full credit or debit card numbers on our servers. For more information, see <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400">Stripe&apos;s Privacy Policy</a>.
            </p>
          </Section>

          <Section title="4. Cookies">
            <p>
              Our website may use cookies and similar technologies to remember your preferences, keep you signed in, and understand how visitors use our site. You can control cookie settings through your browser. See our <Link to="/cookie-policy" className="text-amber-500 hover:text-amber-400">Cookie Policy</Link> for more detail.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes described in this policy, or as required by applicable law. You may request deletion of your account and associated data at any time by contacting us.
            </p>
          </Section>

          <Section title="6. Children's Privacy">
            <p>
              Our website is not directed to children under the age of 13. When children participate in training, booking and account information is collected from and managed by a parent or legal guardian. If you believe we have inadvertently collected information from a child without parental consent, please contact us and we will promptly address the issue.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of non-essential communications at any time</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at <a href={`mailto:${BUSINESS_EMAIL}`} className="text-amber-500 hover:text-amber-400">{BUSINESS_EMAIL}</a>.</p>
          </Section>

          <Section title="8. Security">
            <p>
              We implement reasonable technical and organizational measures to protect your personal information against unauthorized access, loss, or misuse. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password for your account.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date at the top of this page reflects when it was last revised. Continued use of our site after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p>If you have questions about this Privacy Policy or how we handle your data, please contact us:</p>
            <div className="mt-3 bg-[#111] border border-[#222] rounded-xl p-4 space-y-1 text-sm">
              <p className="text-white font-semibold">{BUSINESS_NAME}</p>
              <p>Email: <a href={`mailto:${BUSINESS_EMAIL}`} className="text-amber-500 hover:text-amber-400">{BUSINESS_EMAIL}</a></p>
              <p>Phone: <a href="tel:+16142852317" className="text-amber-500 hover:text-amber-400">{BUSINESS_PHONE}</a></p>
              <p>Columbus, Ohio</p>
            </div>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1a1a1a] flex flex-wrap gap-4 text-sm text-gray-500">
          <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
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

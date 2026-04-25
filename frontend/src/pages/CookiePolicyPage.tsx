import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const LAST_UPDATED = 'April 25, 2025'
const BUSINESS_NAME = 'Kante Elite Training'
const BUSINESS_EMAIL = 'kanteelitetraining@gmail.com'

export default function CookiePolicyPage() {
  useEffect(() => {
    document.title = 'Cookie Policy — Kante Elite Training'
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
          <h1 className="text-white font-black text-4xl mt-2 mb-2">Cookie Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-8">
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6 text-sm text-gray-300 leading-relaxed">
            <p>
              This Cookie Policy explains what cookies are, how {BUSINESS_NAME} uses them on our website, and the choices you have regarding cookies.
            </p>
          </div>

          <Section title="1. What Are Cookies?">
            <p>
              Cookies are small text files stored on your device by your browser when you visit a website. They help websites remember information about your visit, such as whether you are signed in, your preferences, and how you use the site.
            </p>
            <p>
              Cookies can be &ldquo;persistent&rdquo; (they remain on your device until deleted) or &ldquo;session&rdquo; (they are deleted when you close your browser).
            </p>
          </Section>

          <Section title="2. Cookies We Use">
            <div className="space-y-4">
              <CookieRow
                type="Essential"
                color="blue"
                examples="Authentication token, session identifier"
                purpose="Required for core site functionality — keeping you signed in, securing your session, and enabling booking. These cannot be disabled."
                canDisable={false}
              />
              <CookieRow
                type="Functional"
                color="amber"
                examples="Preferred language, remembered form fields"
                purpose="Remember your preferences to improve your experience. Disabling these may reduce convenience."
                canDisable={true}
              />
              <CookieRow
                type="Analytics"
                color="gray"
                examples="Page views, session duration, navigation paths"
                purpose="Help us understand how visitors use the site so we can improve it. Data is aggregated and anonymous."
                canDisable={true}
              />
            </div>
          </Section>

          <Section title="3. Third-Party Cookies">
            <p>We may use limited third-party services that set their own cookies:</p>
            <ul>
              <li>
                <strong className="text-white">Stripe</strong> — Our payment processor may use cookies to enable secure payment sessions. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400">Stripe&apos;s Privacy Policy</a>.
              </li>
            </ul>
            <p>We do not use advertising or tracking cookies, and we do not share cookie data with advertisers.</p>
          </Section>

          <Section title="4. Managing Cookies">
            <p>
              You can control or delete cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul>
              <li>View what cookies are stored on your device</li>
              <li>Delete individual or all cookies</li>
              <li>Block cookies from specific or all sites</li>
              <li>Set your browser to notify you when a cookie is set</li>
            </ul>
            <p className="mt-3">
              Please note that disabling essential cookies may prevent you from signing in or completing a booking on our site.
            </p>
            <p>
              Browser-specific cookie instructions:
            </p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400">Safari</a></li>
              <li><a href="https://support.microsoft.com/help/4027947" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400">Microsoft Edge</a></li>
            </ul>
          </Section>

          <Section title="5. Changes to This Policy">
            <p>
              We may update this Cookie Policy from time to time. The &ldquo;Last updated&rdquo; date at the top reflects when changes were last made. Continued use of our site after updates constitutes acceptance of the revised policy.
            </p>
          </Section>

          <Section title="6. Contact Us">
            <p>Questions? Contact us at:</p>
            <div className="mt-3 bg-[#111] border border-[#222] rounded-xl p-4 space-y-1 text-sm">
              <p className="text-white font-semibold">{BUSINESS_NAME}</p>
              <p>Email: <a href={`mailto:${BUSINESS_EMAIL}`} className="text-amber-500 hover:text-amber-400">{BUSINESS_EMAIL}</a></p>
            </div>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1a1a1a] flex flex-wrap gap-4 text-sm text-gray-500">
          <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
          <Link to="/cancellation-policy" className="hover:text-amber-400 transition-colors">Cancellation Policy</Link>
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

function CookieRow({
  type,
  color,
  examples,
  purpose,
  canDisable,
}: {
  type: string
  color: 'blue' | 'amber' | 'gray'
  examples: string
  purpose: string
  canDisable: boolean
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    gray: 'bg-gray-700/20 border-gray-600/20 text-gray-400',
  }
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${colorClasses[color]}`}>
          {type}
        </span>
        <span className={`text-xs font-medium ${canDisable ? 'text-gray-400' : 'text-amber-400'}`}>
          {canDisable ? 'Optional' : 'Required'}
        </span>
      </div>
      <p className="text-gray-500 text-xs"><em>Examples: {examples}</em></p>
      <p className="text-gray-400 text-xs leading-relaxed">{purpose}</p>
    </div>
  )
}

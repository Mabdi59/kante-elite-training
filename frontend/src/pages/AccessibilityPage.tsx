import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const LAST_UPDATED = 'April 25, 2025'
const BUSINESS_NAME = 'Kante Elite Training'
const BUSINESS_EMAIL = 'kanteelitetraining@gmail.com'
const BUSINESS_PHONE = '(614) 285-2317'

export default function AccessibilityPage() {
  useEffect(() => {
    document.title = 'Accessibility Statement — Kante Elite Training'
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
          <h1 className="text-white font-black text-4xl mt-2 mb-2">Accessibility Statement</h1>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose-dark space-y-8">
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6 text-sm text-gray-300 leading-relaxed">
            <p>
              {BUSINESS_NAME} is committed to ensuring that our website is accessible to everyone, including people with disabilities. We continually work to improve the accessibility of our digital experience.
            </p>
          </div>

          <Section title="Our Commitment">
            <p>
              We aim to follow the <a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400">Web Content Accessibility Guidelines (WCAG) 2.1</a> at Level AA, which defines requirements for making web content more accessible to people with visual, auditory, cognitive, and motor disabilities.
            </p>
          </Section>

          <Section title="Measures We Have Taken">
            <p>To improve accessibility, we have:</p>
            <ul>
              <li>Used semantic HTML elements throughout the website (headings, landmarks, lists, buttons)</li>
              <li>Ensured all interactive elements are keyboard navigable with visible focus indicators</li>
              <li>Provided descriptive <code>aria-label</code> attributes on icon-only buttons and links</li>
              <li>Ensured sufficient color contrast ratios across text and UI elements</li>
              <li>Added <code>alt</code> text to meaningful images</li>
              <li>Made form inputs clearly labeled with associated <code>label</code> elements</li>
              <li>Implemented <code>role="alert"</code> on error messages for screen reader announcements</li>
              <li>Used a focus-visible outline style (amber ring) to make keyboard focus clearly visible</li>
              <li>Added <code>aria-current="page"</code> on active navigation links</li>
              <li>Ensured modal dialogs trap focus and can be closed with the Escape key</li>
            </ul>
          </Section>

          <Section title="Known Limitations">
            <p>
              While we strive for full accessibility, some areas of our platform may still have limitations. We are actively working to address these. If you encounter a specific barrier, please contact us so we can provide assistance or an alternative solution.
            </p>
          </Section>

          <Section title="Assistive Technology Support">
            <p>Our website is designed to be compatible with:</p>
            <ul>
              <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
              <li>Keyboard-only navigation</li>
              <li>Browser zoom up to 200%</li>
              <li>High-contrast display modes</li>
            </ul>
          </Section>

          <Section title="Feedback and Contact">
            <p>
              If you experience any accessibility barriers on our website, or if you need information in an alternative format, please contact us. We welcome your feedback and will respond as quickly as possible.
            </p>
            <div className="mt-3 bg-[#111] border border-[#222] rounded-xl p-4 space-y-1 text-sm">
              <p className="text-white font-semibold">{BUSINESS_NAME}</p>
              <p>Email: <a href={`mailto:${BUSINESS_EMAIL}`} className="text-amber-500 hover:text-amber-400">{BUSINESS_EMAIL}</a></p>
              <p>Phone: <a href="tel:+16142852317" className="text-amber-500 hover:text-amber-400">{BUSINESS_PHONE}</a></p>
              <p>Columbus, Ohio</p>
            </div>
          </Section>

          <Section title="Ongoing Efforts">
            <p>
              Accessibility is an ongoing effort. We regularly review and improve our website as new features are added. We are committed to meeting and exceeding accessibility standards and making this platform welcoming to all users.
            </p>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1a1a1a] flex flex-wrap gap-4 text-sm text-gray-500">
          <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
          <Link to="/cancellation-policy" className="hover:text-amber-400 transition-colors">Cancellation Policy</Link>
          <Link to="/cookie-policy" className="hover:text-amber-400 transition-colors">Cookie Policy</Link>
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

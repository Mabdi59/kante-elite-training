import { useEffect, useState } from 'react'
import CTASection from '../components/CTASection'
import HeroSection from '../components/HeroSection'
import PublicProofBand from '../components/PublicProofBand'
import { Section, SectionHeader } from '../components/Section'
import { getFaqs } from '../services/api'
import type { FaqItem } from '../types'

const faqProofItems = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18M8 2v4M16 2v4" />
      </svg>
    ),
    label: 'Live booking availability',
    href: '/book',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    label: 'Account and team portal access',
    href: '/login',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <polyline strokeLinecap="round" strokeLinejoin="round" points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
    label: 'Manage bookings and player profiles',
    href: '/login',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
    label: 'Send booking and tournament questions online',
    href: '/contact',
  },
]

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFaqs()
      .then(setFaqs)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-black pt-20">
      <HeroSection
        badge="Help Center"
        title="Frequently Asked Questions"
        subtitle="Answers on training, booking, tournaments, accounts, and team registration. If you still need help, contact Coach Kante directly."
        mediaPlacement="FAQ_HERO"
      />

      <PublicProofBand items={faqProofItems} />

      <Section shellClassName="max-w-4xl" divider={false}>
        <SectionHeader
          eyebrow="Quick Answers"
          title={<>What Families Ask <span className="gradient-text">Most Often</span></>}
          description="Most questions are answered below. If your situation is more specific, use the contact page and we'll point you to the right next step."
        />

          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-xl border border-[#222] bg-[#111]" />
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0f0f0f] px-6 py-12 text-center">
              <p className="text-sm text-gray-400">Questions are being updated.</p>
            </div>
          ) : (
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={faq.id}
                className={`overflow-hidden rounded-xl border bg-[#111] transition-colors duration-200 ${
                  openIndex === i ? 'border-amber-500/30' : 'border-[#222] hover:border-[#333]'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={openIndex === i}
                  aria-controls={`faq-answer-${faq.id}`}
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-[#161616]"
                >
                  <span className="pr-4 font-semibold text-white">{faq.question}</span>
                  <span
                    className={`flex-shrink-0 text-amber-500 transition-transform duration-200 ${
                      openIndex === i ? 'rotate-45' : 'rotate-0'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </span>
                </button>
                {openIndex === i && (
                  <div id={`faq-answer-${faq.id}`} className="border-t border-[#1a1a1a] bg-[#0d0d0d] px-6 py-5">
                    <p className="leading-relaxed text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          )}
      </Section>

      <CTASection
        eyebrow="Still Need Help"
        title="Need a Direct Answer?"
        subtitle="If you are between programs, unsure about scheduling, or need tournament help, send a message and we&apos;ll point you in the right direction."
        primaryLabel="Contact Coach Kante"
        primaryHref="/contact"
        secondaryLabel="Book a Session"
        secondaryHref="/book"
        proofPoints={[
          'Reply usually within 24 hours',
          'Direct booking is open now',
          'Team registration support available',
        ]}
      />
    </div>
  )
}

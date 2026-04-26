import { useEffect, useState } from 'react'
import CTASection from '../components/CTASection'
import HeroSection from '../components/HeroSection'
import PublicProofBand from '../components/PublicProofBand'

interface FaqItem {
  q: string
  a: string
}

const FAQS: FaqItem[] = [
  {
    q: 'What age groups do you train?',
    a: 'We train players from U8 through 18+. Every session is adjusted to the player\'s age, current level, and development goals.',
  },
  {
    q: 'How do I book a session?',
    a: 'Open the Book page, choose your program, pick from live availability, and submit your player details. You will receive a confirmation email shortly after your booking is submitted.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'Please give at least 24 hours notice if you need to cancel or reschedule. Reach out through the Contact page or by phone and we will help you sort it out.',
  },
  {
    q: 'Do you offer trial sessions?',
    a: 'Yes. New players can start with a single introductory session before committing to a program. Check the Training page for current options.',
  },
  {
    q: 'How are coaches selected?',
    a: 'Coach Kante brings competitive playing experience from the national team and college level, including Ohio Dominican University. All coaches who work with players are carefully vetted and focused on youth player development.',
  },
  {
    q: 'What should my child bring to sessions?',
    a: 'Players should bring cleats, shin guards, a water bottle, and athletic clothing. A ball is provided, but players can bring their own if they prefer.',
  },
  {
    q: 'How do tournament registrations work?',
    a: 'Teams can register online through the tournament pages. Start with team details, then use the Team Portal for roster updates, payment steps, and registration status.',
  },
  {
    q: 'Can parents watch training sessions?',
    a: 'Yes, parents are welcome to observe sessions from designated viewing areas. We believe transparency between coaches and parents supports better player development.',
  },
  {
    q: 'What is the parent portal?',
    a: 'The parent portal lets families review bookings, attendance, development notes, signed waivers, and important documents in one place.',
  },
  {
    q: 'How do I sign a digital waiver?',
    a: 'Log in to your account, open the Waivers section, review each required form, and complete the digital signing process online before participation.',
  },
  {
    q: 'What programs do you offer?',
    a: 'We offer private training, small group sessions, technical development, speed work, and other player-focused programs as they are scheduled. Visit the Training page for current options.',
  },
  {
    q: 'How do I contact the academy?',
    a: 'You can reach us through the Contact page, by email, or by phone. For urgent matters related to sessions starting soon, calling directly is best.',
  },
]

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
    label: 'Parent and team portals available',
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
    label: 'Waivers and docs handled online',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
    label: 'Questions answered within 24 hours',
    href: '/contact',
  },
]

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  useEffect(() => {
    document.title = 'FAQ | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

  return (
    <div className="min-h-screen bg-black pt-20">
      <HeroSection
        badge="Help Center"
        title="Frequently Asked Questions"
        subtitle="Answers on training, booking, tournaments, waivers, and family portals. If you still need help, contact Coach Kante directly."
      />

      <PublicProofBand items={faqProofItems} />

      <section className="bg-black px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <span className="section-label">Quick Answers</span>
            <h2 className="text-balance text-4xl font-black text-white">
              What Families Ask <span className="gradient-text">Most Often</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-400">
              Most questions are answered below. If your situation is more specific, use the contact page and we&apos;ll point you to the right next step.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={faq.q}
                className={`overflow-hidden rounded-xl border bg-[#111] transition-colors duration-200 ${
                  openIndex === i ? 'border-amber-500/30' : 'border-[#222] hover:border-[#333]'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-[#161616]"
                >
                  <span className="pr-4 font-semibold text-white">{faq.q}</span>
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
                  <div className="border-t border-[#1a1a1a] bg-[#0d0d0d] px-6 py-5">
                    <p className="leading-relaxed text-gray-300">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

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

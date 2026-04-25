import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface FaqItem {
  q: string
  a: string
}

const FAQS: FaqItem[] = [
  {
    q: 'What age groups do you train?',
    a: 'We train players from ages 8 to 18. Each session is tailored to the player\'s age, level, and goals.',
  },
  {
    q: 'How do I book a session?',
    a: 'Click the "Book Session" button on our website, choose your program, select a date and time that works for you, and complete your booking. You will receive a confirmation email shortly after.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'Please give at least 24 hours notice if you need to cancel or reschedule. Reach out through the contact form or by phone and we will help you sort it out.',
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
    a: 'Players should bring cleats (no metal studs on turf), shin guards, a water bottle, and athletic clothing. A ball is provided but players can bring their own.',
  },
  {
    q: 'How do tournament registrations work?',
    a: 'Teams can register through our website. Registration requires team details, a player roster, and payment of the registration fee. You will receive login credentials to track your registration status.',
  },
  {
    q: 'Can parents watch training sessions?',
    a: 'Yes, parents are welcome to observe sessions from designated viewing areas. We believe transparency between coaches and parents supports better player development.',
  },
  {
    q: 'What is the parent portal?',
    a: 'The parent portal lets parents view their child\'s attendance record, development notes from coaches, upcoming sessions, manage bookings, sign required waivers, and access important documents, all in one place.',
  },
  {
    q: 'How do I sign a digital waiver?',
    a: 'Log in to your account, navigate to "Waivers" in your portal, review each waiver template, and complete the digital signing process. Waivers must be signed before participating in sessions.',
  },
  {
    q: 'What programs do you offer?',
    a: 'We offer a range of programs including individual skill development sessions, small group training, positional coaching, goalkeeper training, and team tactics. Visit our Training page for the full list.',
  },
  {
    q: 'How do I contact the academy?',
    a: 'You can reach us through the Contact page on our website, by email, or by phone. For urgent matters related to sessions starting soon, please call us directly.',
  },
]

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    document.title = 'FAQ | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Hero */}
      <section className="pt-8 pb-16 px-4 text-center border-b border-[#1a1a1a]">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
          Help Center
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Everything you need to know about Kante Elite Training. Can&apos;t find your answer?{' '}
          <Link to="/contact" className="text-amber-500 hover:text-amber-400 transition-colors">
            Contact us
          </Link>
          .
        </p>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="border border-[#222] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left bg-[#111] hover:bg-[#161616] transition-colors"
              >
                <span className="text-white font-semibold pr-4">{faq.q}</span>
                <span
                  className={`text-amber-500 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-45' : 'rotate-0'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 py-5 bg-[#0d0d0d] border-t border-[#1a1a1a]">
                  <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-[#111] border border-[#222] rounded-2xl p-8 text-center">
          <h2 className="text-white font-black text-2xl mb-3">Still have questions?</h2>
          <p className="text-gray-400 mb-6">
            Our team is happy to help. Reach out and we&apos;ll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="btn-primary"
            >
              Contact Us
            </Link>
            <Link
              to="/book"
              className="btn-secondary"
            >
              Book a Session
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

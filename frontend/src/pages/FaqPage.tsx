import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface FaqItem {
  q: string
  a: string
}

const FAQS: FaqItem[] = [
  {
    q: 'What age groups do you train?',
    a: 'We train players from ages 6–18, organized into age-specific groups for optimal development. Each group is tailored to the developmental stage of the players.',
  },
  {
    q: 'How do I book a session?',
    a: 'Click the "Book Session" button on our website, choose your program, select a date and time that works for you, and complete your booking. You will receive a confirmation email shortly after.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'Bookings can be cancelled up to 24 hours before the session for a full refund. Cancellations within 24 hours may not be eligible for a refund. Contact us directly for special circumstances.',
  },
  {
    q: 'Do you offer trial sessions?',
    a: 'Yes! We offer introductory trial sessions for new players so they can experience our training environment. Check our Training page for current availability and pricing.',
  },
  {
    q: 'How are coaches selected?',
    a: 'All our coaches are UEFA-qualified or hold equivalent recognized certifications, with extensive experience in youth player development. They undergo background checks and regular professional development.',
  },
  {
    q: 'What should my child bring to sessions?',
    a: 'Players should bring appropriate football boots (no metal studs on artificial pitches), shin guards (mandatory), a water bottle, and wear comfortable athletic clothing. A ball is provided but players may bring their own.',
  },
  {
    q: 'How do tournament registrations work?',
    a: 'Teams can register through our website. Registration requires team details, a player roster, and payment of the registration fee (with deposit options available). You will receive login credentials to track your registration status.',
  },
  {
    q: 'Can parents watch training sessions?',
    a: 'Yes, parents are welcome to observe sessions from designated viewing areas. We believe transparency between coaches and parents supports better player development.',
  },
  {
    q: 'What is the parent portal?',
    a: 'The parent portal allows parents to view their child\'s attendance record, development notes from coaches, upcoming sessions, manage bookings, sign required waivers, and access important documents — all in one place.',
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
    document.title = 'FAQ | Kante Elite Training — Columbus Youth Soccer'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Hero */}
      <section className="pt-8 pb-16 px-4 text-center border-b border-gray-900">
        <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">Help Center</p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Everything you need to know about Kante Elite Training. Can't find your answer?{' '}
          <Link to="/contact" className="text-green-400 hover:text-green-300 transition-colors">
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
              className="border border-gray-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                <span className="text-white font-semibold pr-4">{faq.q}</span>
                <span
                  className={`text-green-400 text-xl flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-45' : 'rotate-0'
                  }`}
                >
                  +
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 py-5 bg-gray-950 border-t border-gray-800">
                  <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <h2 className="text-white font-black text-2xl mb-3">Still have questions?</h2>
          <p className="text-gray-400 mb-6">
            Our team is happy to help. Reach out and we'll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Contact Us
            </Link>
            <Link
              to="/book"
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Book a Session
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

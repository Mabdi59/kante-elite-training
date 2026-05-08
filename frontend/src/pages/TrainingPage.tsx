import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPrograms, getFeaturedTestimonials } from '../services/api'
import type { Program, Testimonial } from '../types'
import HeroSection from '../components/HeroSection'
import MediaAsset from '../components/MediaAsset'
import ProgramCard from '../components/ProgramCard'
import TestimonialCard from '../components/TestimonialCard'
import CTASection from '../components/CTASection'
import ErrorBanner from '../components/ErrorBanner'
import PublicProofBand from '../components/PublicProofBand'
import { COACH_SPOTLIGHT_MEDIA } from '../content/mediaFallbacks'
import { getMediaAlt } from '../utils/media'

const faqs = [
  {
    q: 'What age groups do you train?',
    a: "We train players from U8 through 18+. Each program is tailored to the player's age, development stage, and goals.",
  },
  {
    q: 'How many players are in a small group session?',
    a: 'Small group sessions are capped at 4 players, so every athlete gets personal coaching time and clear feedback.',
  },
  {
    q: 'Do I need to bring my own ball?',
    a: 'Bring a ball if you have one, but it is not required. Coach Kante provides equipment for every session.',
  },
  {
    q: 'What if I need to cancel or reschedule?',
    a: 'Please give at least 24 hours notice if you need to cancel or reschedule. Use the contact form and we will help you update your session.',
  },
  {
    q: 'How quickly will I see improvement?',
    a: 'Many players feel a difference after 3 to 4 focused sessions. Players who train 1 to 2 times per week often show clear progress within 4 to 6 weeks.',
  },
  {
    q: 'Is training available year round?',
    a: 'Yes. Training runs year round, indoors or outdoors depending on the season and weather. Summer sessions fill quickly, so early booking helps.',
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="bg-black py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="section-label">Common Questions</span>
          <h2 className="text-white font-black text-4xl">
            Everything You Need to <span className="gradient-text">Know</span>
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`bg-[#111] border rounded-xl overflow-hidden transition-colors duration-200 ${
                open === i ? 'border-amber-500/30' : 'border-[#1e1e1e] hover:border-[#2a2a2a]'
              }`}
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-white font-semibold text-sm">{faq.q}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 text-amber-500 flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const outcomes = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>
        <line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/>
        <line x1="10.88" y1="21.94" x2="15.46" y2="14"/>
      </svg>
    ),
    title: 'Ball Mastery',
    desc: 'First touch, close control, and comfort on the ball in tight spaces and at speed.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: 'Speed & Agility',
    desc: 'Explosive acceleration, sharp change of direction, and quickness with and without the ball.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5Z"/>
        <line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>
      </svg>
    ),
    title: 'Game Intelligence',
    desc: 'Decision-making, positioning, and reading the game to stay one step ahead.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
    title: 'Confidence & Consistency',
    desc: 'Mental composure under pressure so players perform in games the way they train.',
  },
]

const trainingProofItems = [
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>),
    label: 'U8-18+ age groups',
  },
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><rect x="3" y="4" width="18" height="17" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18M8 2v4M16 2v4" /></svg>),
    label: 'Live booking availability',
    href: '/book',
  },
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>),
    label: 'Confirmation email right away',
  },
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>),
    label: 'Private and small group options',
  },
]

export default function TrainingPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Training Programs | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

  useEffect(() => {
    Promise.allSettled([getPrograms(), getFeaturedTestimonials()])
      .then(([programResult, testimonialResult]) => {
        if (programResult.status === 'fulfilled') setPrograms(programResult.value)
        else setError('Could not load training programs. Please refresh to try again.')
        if (testimonialResult.status === 'fulfilled') setTestimonials(testimonialResult.value.slice(0, 3))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="pt-20">
      <HeroSection
        badge="What We Offer"
        title="Training Programs"
        subtitle="From first touch to high-level performance, every program is structured, focused, and personal."
      />

      <PublicProofBand items={trainingProofItems} />

      {error && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {/* Private Training Spotlight */}
      <section className="bg-[#0a0a0a] py-16 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-label">Built Around The Player</span>
              <h2 className="text-white font-black text-4xl mt-2 mb-4">
                Private <span className="gradient-text">Training</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                One-on-one sessions are tailored to the player, the position, and the current goal. Book online, choose a time, and get confirmation right away without waiting on a back-and-forth.
              </p>
              <ul className="space-y-3">
                {[
                  'Technical work that matches the player level',
                  'Dribbling, passing, receiving, and striking detail',
                  'Position-specific coaching for field players or goalkeepers',
                  'Clear feedback on what improved and what comes next',
                ].map((skill) => (
                  <li key={skill} className="flex items-center gap-3 text-sm text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {skill}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/book" className="btn-primary">Book Private Session</Link>
                <Link to="/book" className="btn-secondary">View Availability</Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#1e1e1e] bg-[#111]">
              <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5]">
                <MediaAsset
                  src={COACH_SPOTLIGHT_MEDIA.mediaUrl}
                  type={COACH_SPOTLIGHT_MEDIA.mediaType}
                  alt={getMediaAlt(COACH_SPOTLIGHT_MEDIA, 'Coach Kante working with players during private training')}
                  loading="eager"
                  fetchPriority="high"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">Coach-led sessions</p>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-200">
                    Focused technical work with standards players can feel right away and families can understand after the session.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 border-t border-[#1e1e1e] p-5 sm:grid-cols-3">
                {[
                  'Ohio Dominican captain',
                  'Somalia National Team',
                  'UA Soccer Academy',
                ].map((credential) => (
                  <div key={credential} className="rounded-xl border border-[#222] bg-[#0d0d0d] px-4 py-3 text-sm text-gray-300">
                    {credential}
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5 text-sm leading-relaxed text-gray-400">
                The direct booking path is active, so families can choose a session without waiting for manual registration.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="section-label">{programs.length > 0 ? `${programs.length} Programs Available` : 'Training Programs'}</span>
            <h2 className="text-white font-black text-4xl">
              Choose the Right <span className="gradient-text">Fit</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              Every program is built around real development goals. Browse the options and book the one that fits your player best.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card h-96">
                  <div className="skeleton h-full" />
                </div>
              ))}
            </div>
          ) : programs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0f0f0f] px-6 py-16 text-center max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <p className="text-lg font-semibold text-white">No programs are published right now.</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  Reach out if you want help choosing the best training option for your player.
              </p>
              <Link to="/contact" className="btn-secondary mt-6 inline-flex text-sm">
                Contact Us
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.map((program, i) => (
                <ProgramCard key={program.id} program={program} featured={i === 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* What Players Develop */}
      <section className="bg-[#0a0a0a] py-16 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-label">Player Development</span>
            <h2 className="text-white font-black text-4xl">
              What Players <span className="gradient-text">Develop</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm">
              Every session is built around real growth. These are the four areas Coach Kante focuses on in every program.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {outcomes.map((item, i) => (
              <div
                key={item.title}
                className="relative bg-[#111] border border-[#1e1e1e] rounded-2xl p-7 hover:border-amber-500/30 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 text-amber-500">
                  {item.icon}
                </div>
                <div className="text-amber-500 font-black text-xs tracking-widest mb-2">0{i + 1}</div>
                <h3 className="text-white font-black text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0a0a0a] py-16 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-label">Simple Process</span>
            <h2 className="text-white font-black text-4xl">
              Book a Session in <span className="gradient-text">4 Steps</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-amber-500/30 via-amber-500/10 to-amber-500/30" />
            {[
              { step: '01', title: 'Choose Program', desc: 'Pick the training type that matches your goals and schedule.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg> },
              { step: '02', title: 'Pick Date & Time', desc: 'Browse live availability and choose the session that works best for you.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg> },
              { step: '03', title: 'Enter Details', desc: 'Share quick player information. It takes less than two minutes.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg> },
              { step: '04', title: 'Confirm Spot', desc: 'Review your details and lock in your training time right away.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mx-auto mb-4 relative z-10">
                  {item.icon}
                </div>
                <div className="text-amber-500 font-black text-xs tracking-widest mb-1">{item.step}</div>
                <h3 className="text-white font-black text-base mb-2">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {(loading || testimonials.length > 0) && (
        <section className="bg-black py-16 px-4 border-t border-[#1a1a1a]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <span className="section-label">What Families Say</span>
              <h2 className="text-white font-black text-4xl text-balance">
                Real Feedback from <span className="gradient-text">Columbus Families</span>
              </h2>
              <p className="text-gray-400 mt-4 max-w-lg mx-auto text-sm">
                Parents and players share their experience training with Coach Kante.
              </p>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card h-48 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                  <TestimonialCard key={t.id} testimonial={t} />
                ))}
              </div>
            )}
            <div className="text-center mt-10">
              <Link to="/results" className="btn-ghost text-amber-500 hover:text-amber-400">
                Read More Reviews
              </Link>
            </div>
          </div>
        </section>
      )}

      <FAQ />

      <CTASection
        eyebrow="Build The Base"
        title="Ready to Start Training?"
        subtitle="Choose a program, book your first session, and start with a plan that matches the player."
        urgencyLine="Live online booking is open"
        proofPoints={[
          'Private and small group options',
          'Choose from live availability',
          'Confirmation email right away',
        ]}
      />
    </div>
  )
}

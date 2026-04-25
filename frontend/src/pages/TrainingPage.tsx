import { useEffect, useState } from 'react'
import { getPrograms } from '../services/api'
import type { Program } from '../types'
import HeroSection from '../components/HeroSection'
import ProgramCard from '../components/ProgramCard'
import CTASection from '../components/CTASection'

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

export default function TrainingPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Soccer Training Programs | Kante Elite Training — Columbus, Ohio'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

  useEffect(() => {
    getPrograms()
      .then(setPrograms)
      .catch(() => { /* silenced */ })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="pt-20">
      <HeroSection
        badge="What We Offer"
        title="Training Programs"
        subtitle="From first touch to high-level performance, every program is structured, focused, and personal."
      />

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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.map((program, i) => (
                <ProgramCard key={program.id} program={program} featured={i === 0} />
              ))}
            </div>
          )}
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

      <FAQ />

      <CTASection
        title="Ready to Start Training?"
        subtitle="Choose a program, book your first session, and start seeing progress within weeks."
        urgencyLine="Limited spots available. Book ahead."
      />
    </div>
  )
}

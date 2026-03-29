import { useEffect, useState } from 'react'
import { getPrograms } from '../services/api'
import type { Program } from '../types'
import HeroSection from '../components/HeroSection'
import ProgramCard from '../components/ProgramCard'
import CTASection from '../components/CTASection'

const faqs = [
  {
    q: 'What age groups do you train?',
    a: 'We train players from U8 through 18+. All programs are tailored to the specific age, development stage, and goals of each player.',
  },
  {
    q: 'How many players are in a "small group" session?',
    a: 'Small group sessions are capped at 4 players to ensure every athlete gets meaningful coaching time and personalized feedback — never lost in a crowd.',
  },
  {
    q: 'Do I need to bring my own ball?',
    a: "It helps, but it's not required. Coach Kante has equipment available. Bring a ball if you have one — touching your own ball more reps is always better.",
  },
  {
    q: 'What if I need to cancel or reschedule?',
    a: "We ask for at least 24 hours notice for cancellations or reschedules. Reply to your confirmation email or use the contact form and we'll get you sorted.",
  },
  {
    q: 'How quickly will I see improvement?',
    a: 'Most players notice a difference within 3–4 focused sessions. Players who commit to consistent training — 1–2 sessions per week — typically show measurable improvement within 4–6 weeks.',
  },
  {
    q: 'Is training available year-round?',
    a: 'Yes. We train year-round indoors and outdoors depending on season and weather. Summer sees high demand — booking ahead is strongly recommended.',
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="bg-black py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
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
    getPrograms()
      .then(setPrograms)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="pt-20">
      <HeroSection
        badge="What We Offer"
        title="Training Programs"
        subtitle="From beginners finding their footing to elite players chasing college scholarships — every program is structured, purposeful, and personal."
      />

      {/* Programs grid */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-label">5 Programs Available</span>
            <h2 className="text-white font-black text-4xl">
              Choose the Right <span className="gradient-text">Fit</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              Every program is built around real development goals, not just field hours. Browse below and book the one that fits your player.
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

      {/* How it works */}
      <section className="bg-[#0a0a0a] py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="section-label">Simple Process</span>
            <h2 className="text-white font-black text-4xl">
              Book a Session in <span className="gradient-text">4 Steps</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connector line on desktop */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-amber-500/30 via-amber-500/10 to-amber-500/30" />
            {[
              { step: '01', title: 'Choose Program', desc: 'Pick the training type that matches your goals and schedule.', icon: '📋' },
              { step: '02', title: 'Pick Date & Time', desc: 'Browse live availability and choose when works for you.', icon: '📅' },
              { step: '03', title: 'Enter Details', desc: 'Quick player info form — takes less than two minutes.', icon: '✍️' },
              { step: '04', title: 'Confirm Spot', desc: 'Review your details and lock in your training time right away.', icon: '✅' },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="text-amber-500 font-black text-xs tracking-widest mb-1">{item.step}</div>
                <h3 className="text-white font-black text-base mb-2">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      <CTASection
        title="Ready to Start Training?"
        subtitle="Choose a program, book your first session, and see the difference — usually within weeks."
        urgencyLine="Limited spots available — book ahead"
      />
    </div>
  )
}

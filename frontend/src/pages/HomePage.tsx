import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPrograms, getFeaturedTestimonials, getEvents } from '../services/api'
import type { Program, Testimonial, Event } from '../types'
import ProgramCard from '../components/ProgramCard'
import TestimonialCard from '../components/TestimonialCard'
import EventCard from '../components/EventCard'
import CTASection from '../components/CTASection'

const pillars = [
  {
    icon: '🎯',
    title: 'Technical Excellence',
    desc: 'Deliberate, structured practice that builds lasting technical skills translating directly to match performance.',
  },
  {
    icon: '💪',
    title: 'Mental Strength',
    desc: 'We develop confident, resilient athletes who perform under pressure and lead with composure.',
  },
  {
    icon: '⚡',
    title: 'Physical Development',
    desc: 'Sport science-driven conditioning building speed, strength, and endurance for every age group.',
  },
]

const stats = [
  { value: '200+', label: 'Players Trained' },
  { value: '10+', label: 'Years Experience' },
  { value: '95%', label: 'Would Recommend' },
  { value: '15+', label: 'College Placements' },
]

export default function HomePage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPrograms(), getFeaturedTestimonials(), getEvents()])
      .then(([p, t, e]) => {
        setPrograms(p)
        setTestimonials(t.slice(0, 3))
        setEvents(e.slice(0, 3))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-black flex items-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-radial-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#0a0500_0%,_transparent_70%)] opacity-70" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        {/* Background accent */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-10 w-60 h-60 bg-amber-900/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto w-full pt-24 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              Columbus, Ohio · Elite Soccer Development
            </div>

            <h1 className="text-white font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-7">
              Train Like <br />
              <span className="text-amber-500">The Best.</span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl text-gray-200 font-bold">
                Become the Best.
              </span>
            </h1>

            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              Kante Elite Training delivers world-class individual soccer development for Columbus
              players aged 8–18. Personalized coaching. Proven results. Real transformation.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/book" className="btn-primary text-base px-10 py-4">
                Book Your First Session →
              </Link>
              <Link to="/training" className="btn-secondary text-base px-10 py-4">
                View Programs
              </Link>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 pt-14 border-t border-[#222]">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-amber-500 font-black text-3xl">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose ─────────────────────────────────────────────────── */}
      <section className="bg-[#111111] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label">Why Kante Elite</p>
            <h2 className="text-white font-black text-4xl md:text-5xl">
              Three Pillars of <span className="text-amber-500">Elite Development</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="bg-[#1a1a1a] border border-[#222] rounded-xl p-8 hover:border-amber-500/30 transition-colors"
              >
                <div className="text-5xl mb-6">{p.icon}</div>
                <h3 className="text-white font-black text-2xl mb-3">{p.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programs ───────────────────────────────────────────────────── */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label">What We Offer</p>
            <h2 className="text-white font-black text-4xl md:text-5xl">
              Training Programs for <span className="text-amber-500">Every Player</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              From beginners finding their footing to elite players chasing scholarships — we have
              a program designed for your exact goals.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card h-64 animate-pulse bg-surface-raised" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.slice(0, 3).map((program, i) => (
                <ProgramCard key={program.id} program={program} variant="compact" featured={i === 0} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/training" className="btn-secondary">
              View All Programs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Upcoming Events Teaser ─────────────────────────────────────── */}
      {events.length > 0 && (
        <section className="bg-[#111111] py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="section-label">Upcoming</p>
              <h2 className="text-white font-black text-4xl md:text-5xl">
                Camps & <span className="text-amber-500">Events</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/events" className="btn-secondary">
                View All Events
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label">Real Results</p>
            <h2 className="text-white font-black text-4xl md:text-5xl">
              What Families Are <span className="text-amber-500">Saying</span>
            </h2>
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
            <Link to="/results" className="btn-secondary">
              Read More Stories
            </Link>
          </div>
        </div>
      </section>

      {/* ── Coach Intro ────────────────────────────────────────────────── */}
      <section className="bg-[#111111] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="bg-[#1a1a1a] rounded-2xl h-96 flex items-center justify-center relative overflow-hidden order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 to-transparent" />
              <div className="text-center relative z-10">
                <div className="text-8xl mb-3">👨‍🏫</div>
                <p className="text-gray-400 text-sm">Coach Mamadou Kante</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="section-label">The Coach</p>
              <h2 className="text-white font-black text-4xl mb-5">
                Meet Coach <span className="text-amber-500">Mamadou Kante</span>
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
                <p>
                  With over a decade of coaching experience, UEFA and USSF licensure, and a deep
                  commitment to player development science, Coach Kante has built Kante Elite
                  Training into Columbus's most trusted individual soccer academy.
                </p>
                <p>
                  His players have earned college scholarships, competed in Olympic Development
                  Programs, and represented Ohio at national youth tournaments.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6 mb-8">
                {['USSF A License', 'UEFA B License', '10+ Years Coaching', 'Sports Science'].map(
                  (cred) => (
                    <div
                      key={cred}
                      className="flex items-center gap-2 bg-[#111] border border-[#222] rounded-lg p-3"
                    >
                      <span className="text-amber-500 text-sm">🏅</span>
                      <span className="text-white text-xs font-semibold">{cred}</span>
                    </div>
                  )
                )}
              </div>
              <Link to="/about" className="btn-secondary text-sm">
                Read Coach Kante's Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <CTASection
        title="Your Player's Best Season Starts Now"
        subtitle="Don't wait for next season. The players getting ahead are training right now. Book a session today and see the difference in weeks."
        primaryLabel="Book Your First Session"
        secondaryLabel="Learn About Programs"
        secondaryHref="/training"
      />
    </div>
  )
}

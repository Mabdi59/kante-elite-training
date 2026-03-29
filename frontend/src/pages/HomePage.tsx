import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPrograms, getFeaturedTestimonials, getEvents } from '../services/api'
import type { Program, Testimonial, Event } from '../types'
import ProgramCard from '../components/ProgramCard'
import TestimonialCard from '../components/TestimonialCard'
import EventCard from '../components/EventCard'
import CTASection from '../components/CTASection'

const stats = [
  { value: '200+', label: 'Players Trained' },
  { value: '10+', label: 'Years Experience' },
  { value: '95%', label: 'Would Recommend' },
  { value: '15+', label: 'College Placements' },
]

const audiences = [
  {
    icon: '👨‍👩‍👧',
    title: 'Parents',
    headline: 'You want the best for your child.',
    desc: "We give you a clear, structured path to real development — not just field time. You'll see measurable progress within weeks.",
    cta: 'Book a Session',
    href: '/book',
  },
  {
    icon: '⚡',
    title: 'Young Athletes',
    headline: 'You want to be undeniable.',
    desc: 'Our sessions are designed to expose weaknesses, build strengths, and fast-track you to the level you know you can reach.',
    cta: 'See Programs',
    href: '/training',
  },
  {
    icon: '🏆',
    title: 'Competitive Players',
    headline: 'You need an edge.',
    desc: 'Scouts notice technical precision, explosiveness, and composure. We build all three — with a personalized plan, not a cookie-cutter curriculum.',
    cta: 'View Results',
    href: '/results',
  },
]

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

function SkeletonCard() {
  return (
    <div className="card p-6 h-64 flex flex-col gap-4">
      <div className="skeleton h-8 w-1/3" />
      <div className="skeleton h-6 w-2/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
      <div className="skeleton h-10 w-full mt-auto" />
    </div>
  )
}

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
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-10 w-64 h-64 bg-amber-900/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto w-full pt-24 pb-16">
          <div className="max-w-3xl">
            {/* Social proof badge */}
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              Columbus's #1 Youth Soccer Academy · 200+ Players Trained
            </div>

            <h1 className="text-white font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6">
              Train Like an Elite Player.
              <br />
              <span className="gradient-text">Perform With Confidence.</span>
            </h1>

            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-4 max-w-xl">
              Expert 1-on-1 and small-group soccer training for Columbus players aged 8–18.
              Your player gets a personalized plan — not generic drills — and starts improving within weeks.
            </p>

            {/* Trust micro-signals */}
            <div className="flex flex-wrap gap-3 mb-10">
              {['✓ USSF & UEFA Licensed', '✓ All Skill Levels', '✓ Flexible Scheduling', '✓ Fast Booking Confirmation'].map((t) => (
                <span key={t} className="text-gray-400 text-sm font-medium">{t}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/book" className="btn-primary text-base px-10 py-4 gap-2">
                Book Your First Session
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link to="/training" className="btn-secondary text-base px-10 py-4">
                View Programs
              </Link>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 pt-14 border-t border-[#222]">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="gradient-text font-black text-3xl md:text-4xl">{stat.value}</p>
                  <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Who This Is For ────────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="section-label">Built For You</span>
            <h2 className="text-white font-black text-4xl md:text-5xl text-balance">
              Who We Train
            </h2>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto">
              Whether you're a parent looking for real development or a player chasing your potential — we have a path designed for you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {audiences.map((a) => (
              <div
                key={a.title}
                className="bg-[#111] border border-[#222] rounded-2xl p-8 flex flex-col hover:border-amber-500/30 transition-all duration-300 group"
              >
                <div className="text-5xl mb-5">{a.icon}</div>
                <span className="section-label">{a.title}</span>
                <h3 className="text-white font-black text-xl mb-3 leading-tight">{a.headline}</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-6">{a.desc}</p>
                <Link
                  to={a.href}
                  className="inline-flex items-center gap-2 text-amber-500 font-bold text-sm group-hover:gap-3 transition-all"
                >
                  {a.cta}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose ─────────────────────────────────────────────────── */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="section-label">Why Kante Elite</span>
            <h2 className="text-white font-black text-4xl md:text-5xl">
              Three Pillars of{' '}
              <span className="gradient-text">Elite Development</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((p, i) => (
              <div
                key={p.title}
                className="relative bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 hover:border-amber-500/30 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                <div className="absolute -top-4 -right-4 text-8xl opacity-10 select-none pointer-events-none">{p.icon}</div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl mb-6">
                  {p.icon}
                </div>
                <div className="text-amber-500 font-black text-xs tracking-widest mb-2">0{i + 1}</div>
                <h3 className="text-white font-black text-xl mb-3">{p.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programs Preview ───────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="section-label">What We Offer</span>
              <h2 className="text-white font-black text-4xl md:text-5xl text-balance">
                A Program for{' '}
                <span className="gradient-text">Every Player</span>
              </h2>
              <p className="text-gray-500 text-sm mt-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Limited spots per week — popular programs fill quickly
              </p>
            </div>
            <Link to="/training" className="btn-secondary text-sm whitespace-nowrap self-start md:self-end">
              All 5 Programs →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.slice(0, 3).map((program, i) => (
                <ProgramCard key={program.id} program={program} variant="compact" featured={i === 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Upcoming Events Teaser ─────────────────────────────────────── */}
      {(loading || events.length > 0) && (
        <section className="bg-black py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
              <div>
                <span className="section-label">Upcoming</span>
                <h2 className="text-white font-black text-4xl md:text-5xl">
                  Camps &{' '}
                  <span className="gradient-text">Events</span>
                </h2>
              </div>
              <Link to="/events" className="btn-secondary text-sm whitespace-nowrap self-start md:self-end">
                View All Events →
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="section-label">Real Results</span>
            <h2 className="text-white font-black text-4xl md:text-5xl text-balance">
              What Columbus Families{' '}
              <span className="gradient-text">Are Saying</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto text-sm">
              These aren't testimonials we wrote. These are words from real parents and players after training with Coach Kante.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
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
              Read all 6+ reviews →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Coach Intro ────────────────────────────────────────────────── */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="bg-[#111] rounded-2xl h-96 lg:h-auto min-h-80 flex items-center justify-center relative overflow-hidden order-2 lg:order-1 border border-[#1e1e1e]">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <div className="text-center relative z-10 p-8">
                <div className="text-8xl mb-4">👨‍🏫</div>
                <p className="text-gray-500 text-sm">Coach Mamadou Kante</p>
                <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mt-1">Head Coach & Founder</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="section-label">The Coach</span>
              <h2 className="text-white font-black text-4xl mb-5">
                Meet Coach{' '}
                <span className="gradient-text">Mamadou Kante</span>
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
                <p>
                  With over a decade of coaching experience, UEFA and USSF licensure, and a deep
                  commitment to player development science, Coach Kante has built Kante Elite
                  Training into Columbus's most trusted individual soccer academy.
                </p>
                <p>
                  His players have earned college scholarships, competed in Olympic Development
                  Programs, and represented Ohio at national youth tournaments. Every session is
                  purposeful — because your time and investment deserve results.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6 mb-8">
                {['USSF A License', 'UEFA B License', '10+ Years Coaching', 'Sports Science Background'].map((cred) => (
                  <div key={cred} className="flex items-center gap-2 bg-[#111] border border-[#222] rounded-xl p-3 hover:border-amber-500/20 transition-colors">
                    <span className="text-amber-500">🏅</span>
                    <span className="text-white text-xs font-semibold">{cred}</span>
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn-secondary text-sm">
                Coach Kante's Full Story →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── What Happens After Booking ─────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="section-label">Simple Process</span>
            <h2 className="text-white font-black text-4xl md:text-5xl text-balance">
              What Happens{' '}
              <span className="gradient-text">After You Book</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-md mx-auto text-sm">
              No confusion. No waiting. Just a clear path from booking to your first training session.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* connector line on desktop */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-amber-500/30 via-amber-500/20 to-amber-500/30" />
            {[
              {
                step: '01',
                icon: '📋',
                title: 'Book Your Session',
                desc: 'Choose your program, pick a date and time, and confirm your booking. Takes less than 3 minutes.',
              },
              {
                step: '02',
                icon: '📧',
                title: 'We Confirm & Reach Out',
                desc: "You'll get an instant confirmation email. Coach Kante will personally follow up before your first session to understand your player's goals.",
              },
              {
                step: '03',
                icon: '⚽',
                title: 'Your Player Trains With a Plan',
                desc: 'Every session is tailored to your player — not a template. Coach Kante tracks progress and adapts each session to what matters most.',
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center group">
                <div className="w-20 h-20 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mx-auto mb-5 relative z-10 group-hover:border-amber-500/30 transition-colors duration-300">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <div className="text-amber-500 font-black text-xs tracking-widest mb-2">{item.step}</div>
                <h3 className="text-white font-black text-lg mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                {i < 2 && (
                  <div className="flex md:hidden justify-center mt-6 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500/40 rotate-90" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/book" className="btn-primary text-base px-10 py-4 gap-2">
              Book Your Session Now
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Urgency Strip ──────────────────────────────────────────────── */}
      <section className="bg-amber-500 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <p className="text-black font-black text-sm md:text-base">
              Spots are limited — sessions fill up fast, especially on weekends.
            </p>
          </div>
          <Link to="/book" className="bg-black text-amber-500 font-black text-sm px-6 py-2.5 rounded-lg whitespace-nowrap hover:bg-zinc-900 transition-colors">
            Reserve Your Spot →
          </Link>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <CTASection
        title="Your Player's Best Season Starts Now"
        subtitle="Don't wait for next season. The players getting ahead are training right now. Book a session today and see the difference in weeks — guaranteed."
        primaryLabel="Book Your First Session"
        secondaryLabel="Learn About Programs"
        secondaryHref="/training"
      />
    </div>
  )
}

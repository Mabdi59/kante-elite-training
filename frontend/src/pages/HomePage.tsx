import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPrograms, getFeaturedTestimonials, getEvents, getTournaments } from '../services/api'
import type { Program, Testimonial, Event, Tournament } from '../types'
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
    headline: 'You want the right environment for your child.',
    desc: 'We give families a clear path to real development, with focused coaching and progress you can see.',
    cta: 'Book a Session',
    href: '/book',
  },
  {
    icon: '⚡',
    title: 'Young Athletes',
    headline: 'You want to improve with purpose.',
    desc: 'Our sessions sharpen technique, build stronger habits, and help players feel more confident on the ball.',
    cta: 'See Programs',
    href: '/training',
  },
  {
    icon: '🏆',
    title: 'Competitive Players',
    headline: 'You need an edge that shows up in games.',
    desc: 'We help serious players improve the details that matter in matches, tryouts, and higher-level environments.',
    cta: 'View Results',
    href: '/results',
  },
]

const pillars = [
  {
    icon: '🎯',
    title: 'Technical Excellence',
    desc: 'Structured practice that builds strong technique and carries over into real match performance.',
  },
  {
    icon: '💪',
    title: 'Mental Strength',
    desc: 'Confident, resilient players make better decisions and perform with more composure.',
  },
  {
    icon: '⚡',
    title: 'Physical Development',
    desc: 'Age-appropriate athletic training helps players move better, recover well, and compete with confidence.',
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
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPrograms(), getFeaturedTestimonials(), getEvents(), getTournaments()])
      .then(([p, t, e, tourneys]) => {
        setPrograms(p)
        setTestimonials(t.slice(0, 3))
        setEvents(e.slice(0, 3))
        setTournaments(tourneys.slice(0, 3))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <section className="relative min-h-[50vh] bg-black flex items-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-radial-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#0a0500_0%,_transparent_70%)] opacity-70" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-10 w-64 h-64 bg-amber-900/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto w-full pt-20 pb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              Columbus youth soccer training. 200+ players coached.
            </div>

            <h1 className="text-white font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6">
              Train Like an Elite Player.
              <br />
              <span className="gradient-text">Perform With Confidence.</span>
            </h1>

            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-4 max-w-xl">
              Private and small group soccer training for Columbus players ages 8 to 18.
              Every player gets focused coaching, a clear plan, and progress you can see.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              {['USSF and UEFA licensed', 'All skill levels', 'Flexible scheduling', 'Fast booking confirmation'].map((t) => (
                <span key={t} className="text-gray-400 text-sm font-medium">
                  {t}
                </span>
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
              <Link to="/tournaments" className="btn-secondary text-base px-10 py-4">
                View Tournaments
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-10 border-t border-[#222]">
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

      <section className="bg-[#0a0a0a] py-16 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-label">Built For You</span>
            <h2 className="text-white font-black text-4xl md:text-5xl text-balance">
              Who We Train
            </h2>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto">
              Whether you want steady development or a sharper competitive edge, we offer a clear path forward.
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

      <section className="bg-black py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-label">Why Kante Elite</span>
            <h2 className="text-white font-black text-4xl md:text-5xl">
              Three Pillars of <span className="gradient-text">Player Development</span>
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

      <section className="bg-[#0a0a0a] py-16 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <span className="section-label">What We Offer</span>
              <h2 className="text-white font-black text-4xl md:text-5xl text-balance">
                A Program for <span className="gradient-text">Every Player</span>
              </h2>
              <p className="text-gray-500 text-sm mt-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Limited weekly availability. Popular programs fill quickly.
              </p>
            </div>
            <Link to="/training" className="btn-secondary text-sm whitespace-nowrap self-start md:self-end">
              All 5 Programs
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
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

      {(loading || events.length > 0) && (
        <section className="bg-black py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <span className="section-label">Upcoming</span>
                <h2 className="text-white font-black text-4xl md:text-5xl">
                  Camps & <span className="gradient-text">Events</span>
                </h2>
              </div>
              <Link to="/events" className="btn-secondary text-sm whitespace-nowrap self-start md:self-end">
                View All Events
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
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

      {(loading || tournaments.length > 0) && (
        <section className="bg-[#0a0a0a] py-16 px-4 border-t border-[#1a1a1a]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <span className="section-label">Tournament Registration</span>
                <h2 className="text-white font-black text-4xl md:text-5xl">
                  Join Upcoming <span className="gradient-text">Tournaments</span>
                </h2>
                <p className="text-gray-400 mt-4 max-w-xl text-sm leading-relaxed">
                  New tournaments appear here as soon as they are added. Public registration stays simple so teams can review details and sign up fast.
                </p>
              </div>
              <Link to="/tournaments" className="btn-secondary text-sm whitespace-nowrap self-start md:self-end">
                See All Tournaments
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tournaments.map((tournament) => {
                  const spotsLeft = tournament.maxTeams - tournament.registeredTeams
                  const canRegister =
                    spotsLeft > 0 &&
                    tournament.status !== 'COMPLETED' &&
                    tournament.status !== 'CANCELLED'

                  return (
                    <div
                      key={tournament.id}
                      className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-white font-black text-xl leading-tight">{tournament.name}</h3>
                          <p className="text-gray-400 text-sm mt-1">{tournament.location}</p>
                        </div>
                        <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                          {tournament.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-400 mb-5 flex-1">
                        <div className="flex justify-between gap-4">
                          <span>Date</span>
                          <span className="text-white">{tournament.startDate}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Teams</span>
                          <span className="text-white">
                            {tournament.registeredTeams} / {tournament.maxTeams}
                          </span>
                        </div>
                        {tournament.registrationDeadline ? (
                          <div className="flex justify-between gap-4">
                            <span>Deadline</span>
                            <span className="text-white">{tournament.registrationDeadline}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex gap-3">
                        <Link
                          to={`/tournaments/${tournament.id}/register`}
                          className={`flex-1 text-center font-bold py-2.5 rounded-xl text-sm transition-colors ${
                            canRegister
                              ? 'bg-green-500 hover:bg-green-400 text-black'
                              : 'bg-gray-800 text-gray-500 pointer-events-none'
                          }`}
                        >
                          {canRegister ? 'Register Team' : 'Registration Closed'}
                        </Link>
                        <Link
                          to="/tournaments"
                          className="flex-1 text-center btn-secondary text-sm py-2.5"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="bg-[#0a0a0a] py-16 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-label">Real Results</span>
            <h2 className="text-white font-black text-4xl md:text-5xl text-balance">
              What Columbus Families <span className="gradient-text">Are Saying</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto text-sm">
              Real feedback from parents and players who trained with Coach Kante.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
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

      <section className="bg-black py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="bg-[#111] rounded-2xl h-96 lg:h-auto min-h-80 flex items-center justify-center relative overflow-hidden order-2 lg:order-1 border border-[#1e1e1e]">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <div className="text-center relative z-10 p-8">
                <div className="text-8xl mb-4">👨‍🏫</div>
                <p className="text-gray-500 text-sm">Coach Kante</p>
                <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mt-1">Head Coach & Founder</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="section-label">The Coach</span>
              <h2 className="text-white font-black text-4xl mb-5">
                Meet <span className="gradient-text">Coach Kante</span>
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
                <p>
                  With more than a decade of coaching experience, UEFA and USSF licensure, and a deep
                  commitment to player development, Coach Kante has built Kante Elite Training into one
                  of Columbus&apos;s most trusted individual soccer programs.
                </p>
                <p>
                  His players have earned college scholarships, competed in Olympic Development Programs,
                  and represented Ohio at major youth events. Every session is focused because your time
                  and investment should lead to results.
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
                Coach Kante&apos;s Full Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0a0a0a] py-16 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-label">Simple Process</span>
            <h2 className="text-white font-black text-4xl md:text-5xl text-balance">
              What Happens <span className="gradient-text">After You Book</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-md mx-auto text-sm">
              A simple path from booking to your first training session.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-amber-500/30 via-amber-500/20 to-amber-500/30" />
            {[
              {
                step: '01',
                icon: '📋',
                title: 'Book Your Session',
                desc: 'Choose your program, pick a date and time, and confirm your session. It only takes a few minutes.',
              },
              {
                step: '02',
                icon: '📧',
                title: 'Confirmation and Follow Up',
                desc: 'You will get a confirmation email right away. Coach Kante will follow up before the first session to learn the player&apos;s goals.',
              },
              {
                step: '03',
                icon: '⚽',
                title: 'Train With a Clear Plan',
                desc: 'Each session is built around the player&apos;s needs, with progress tracked and the work adjusted over time.',
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
          <div className="text-center mt-10">
            <Link to="/book" className="btn-primary text-base px-10 py-4 gap-2">
              Book Your Session Now
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-amber-500 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <p className="text-black font-black text-sm md:text-base">
              Spots are limited. Weekend sessions fill especially fast.
            </p>
          </div>
          <Link to="/book" className="bg-black text-amber-500 font-black text-sm px-6 py-2.5 rounded-lg whitespace-nowrap hover:bg-zinc-900 transition-colors">
            Reserve Your Spot
          </Link>
        </div>
      </section>

      <CTASection
        title="Your Player&apos;s Best Season Starts Now"
        subtitle="Book a session today and give your player focused training, clear feedback, and a plan for progress."
        primaryLabel="Book Your First Session"
        secondaryLabel="Learn About Programs"
        secondaryHref="/training"
      />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getPrograms,
  getFeaturedTestimonials,
  getEvents,
  getMediaPosts,
  getTournaments,
  getWebsiteContent,
} from '../services/api'
import type { Program, Testimonial, Event, Tournament, MediaPost, WebsiteContent } from '../types'
import ProgramCard from '../components/ProgramCard'
import TestimonialCard from '../components/TestimonialCard'
import EventCard from '../components/EventCard'
import CTASection from '../components/CTASection'
import MediaPostCard from '../components/MediaPostCard'
import MediaLightbox from '../components/MediaLightbox'
import PublicProofBand from '../components/PublicProofBand'
import { defaultWebsiteContent } from '../content/defaultWebsiteContent'

const stats = [
  { value: '100+', label: 'Players Trained' },
  { value: '5', label: 'Training Programs' },
  { value: '95%', label: 'Would Recommend' },
  { value: 'U8-18+', label: 'Age Groups Served' },
]

const audiences = [
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    title: 'Parents',
    headline: 'You want the right environment for your child.',
    desc: 'We give families a clear path to real development, with focused coaching and progress you can see.',
    cta: 'Book a Session',
    href: '/book',
  },
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
    title: 'Young Athletes',
    headline: 'You want to improve with purpose.',
    desc: 'Our sessions sharpen technique, build stronger habits, and help players feel more confident on the ball.',
    cta: 'See Programs',
    href: '/training',
  },
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>),
    title: 'Competitive Players',
    headline: 'You need an edge that shows up in games.',
    desc: 'We help serious players improve the details that matter in matches, tryouts, and higher-level environments.',
    cta: 'View Results',
    href: '/results',
  },
]

const pillars = [
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>),
    title: 'Technical Excellence',
    desc: 'Structured practice that builds strong technique and carries over into real match performance.',
  },
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5Z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>),
    title: 'Mental Strength',
    desc: 'Confident, resilient players make better decisions and perform with more composure.',
  },
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
    title: 'Physical Development',
    desc: 'Age-appropriate athletic training helps players move better, recover well, and compete with confidence.',
  },
]

const homeProofItems = [
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>),
    label: '100+ players trained',
  },
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>),
    label: 'Columbus, Ohio',
  },
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><rect x="3" y="4" width="18" height="17" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18M8 2v4M16 2v4" /></svg>),
    label: 'Book online in minutes',
    href: '/book',
  },
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>),
    label: 'Private and small group options',
    href: '/training',
  },
  {
    icon: (<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>),
    label: '@kanteelitetraining_',
    href: 'https://www.instagram.com/kanteelitetraining_/',
  },
]

const coachStandards = [
  {
    title: 'Clear session objectives',
    desc: 'Players know what the session is working on and families can understand why it matters.',
  },
  {
    title: 'Honest, usable feedback',
    desc: 'Progress is explained in plain language so the next step never feels vague.',
  },
  {
    title: 'Game-ready habits',
    desc: 'The work is coached to carry into confidence, decisions, and match performance.',
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
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [siteContent, setSiteContent] = useState<WebsiteContent>(defaultWebsiteContent)
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [homeFaqOpen, setHomeFaqOpen] = useState<number | null>(null)

  useEffect(() => {
    document.title = 'Kante Elite Training | Youth Soccer Academy, Columbus Ohio'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

  useEffect(() => {
    Promise.allSettled([
      getPrograms(),
      getFeaturedTestimonials(),
      getEvents(),
      getMediaPosts(),
      getTournaments(),
      getWebsiteContent(),
    ])
      .then(([programResult, testimonialResult, eventResult, mediaResult, tournamentResult, contentResult]) => {
        if (programResult.status === 'fulfilled') {
          setPrograms(programResult.value)
        }
        if (testimonialResult.status === 'fulfilled') {
          setTestimonials(testimonialResult.value.slice(0, 3))
        }
        if (eventResult.status === 'fulfilled') {
          setEvents(eventResult.value.slice(0, 3))
        }
        if (mediaResult.status === 'fulfilled') {
          setMediaPosts(mediaResult.value)
        }
        if (tournamentResult.status === 'fulfilled') {
          setTournaments(tournamentResult.value.slice(0, 3))
        }
        if (contentResult.status === 'fulfilled') {
          setSiteContent({
            ...defaultWebsiteContent,
            ...contentResult.value,
            aboutExperiencePoints:
              contentResult.value.aboutExperiencePoints?.length > 0
                ? contentResult.value.aboutExperiencePoints
                : defaultWebsiteContent.aboutExperiencePoints,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const heroMedia = mediaPosts.find((post) => post.featured) ?? null
  const homeMediaPosts = mediaPosts.filter((post) => post.showOnHome).slice(0, 6)

  return (
    <div>
      <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-black px-4 sm:min-h-[78vh]">
        {heroMedia ? (
          <div className="absolute inset-0">
            {heroMedia.mediaType === 'VIDEO' ? (
              <video
                src={heroMedia.mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={heroMedia.mediaUrl}
                alt={heroMedia.caption?.trim() || siteContent.homeHeadline || 'Kante Elite highlight'}
                loading="eager"
                fetchPriority="high"
                className="h-full w-full object-cover animate-hero-zoom"
              />
            )}
            <div className="absolute inset-0 bg-black/65" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(120,53,15,0.55)_0%,_transparent_68%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/75" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-radial-hero" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#0a0500_0%,_transparent_70%)] opacity-70" />
          </>
        )}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-10 w-64 h-64 bg-amber-900/20 rounded-full blur-2xl pointer-events-none" />

        <div className="page-shell relative w-full pb-[calc(env(safe-area-inset-bottom)+7.5rem)] pt-[calc(env(safe-area-inset-top)+5.25rem)] sm:pb-16 sm:pt-[calc(env(safe-area-inset-top)+6.5rem)]">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              {siteContent.homeBadge || defaultWebsiteContent.homeBadge}
            </div>

            <h1 className="mb-5 text-[clamp(2.75rem,11vw,4rem)] font-black leading-[0.98] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {siteContent.homeHeadline || defaultWebsiteContent.homeHeadline}
            </h1>

            <p className="mb-5 max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg md:text-xl">
              {siteContent.homeDescription || defaultWebsiteContent.homeDescription}
            </p>

            <div className="mb-8 grid max-w-2xl grid-cols-2 gap-x-3 gap-y-3 sm:flex sm:flex-wrap sm:gap-4">
              {['Competitive playing background', 'All skill levels', 'Flexible scheduling', 'Fast booking confirmation'].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-gray-300 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>{t}</span>
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <Link
                to="/book"
                className="btn-primary col-span-2 w-full gap-2 px-6 py-3.5 text-sm sm:w-auto sm:px-8 sm:text-base"
              >
                Book Your First Session
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                to="/training"
                className="btn-secondary w-full px-4 py-3 text-center text-sm sm:w-auto sm:px-8 sm:text-base"
              >
                View Programs
              </Link>
              <Link
                to="/tournaments"
                className="btn-secondary w-full px-4 py-3 text-center text-sm sm:w-auto sm:px-8 sm:text-base"
              >
                View Tournaments
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#222] pt-8 sm:mt-10 sm:gap-6 md:grid-cols-4 md:pt-10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="gradient-text text-2xl font-black sm:text-3xl md:text-4xl">{stat.value}</p>
                  <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PublicProofBand items={homeProofItems} />

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
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                  {a.icon}
                </div>
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
                <div className="absolute -top-4 -right-4 opacity-5 select-none pointer-events-none scale-[3] origin-top-right">
                  {p.icon}
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
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
          <div className="page-shell">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <span className="section-label">Upcoming</span>
                <h2 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
                  Camps & <span className="gradient-text">Events</span>
                </h2>
              </div>
              <Link to="/events" className="btn-secondary w-full text-sm self-start md:w-auto md:self-end">
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
          <div className="page-shell">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <span className="section-label">Tournament Registration</span>
                <h2 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
                  Join Upcoming <span className="gradient-text">Tournaments</span>
                </h2>
                <p className="text-gray-400 mt-4 max-w-xl text-sm leading-relaxed">
                  New tournaments appear here as soon as they are added. Public registration stays simple so teams can review details and sign up fast.
                </p>
              </div>
              <Link to="/tournaments" className="btn-secondary w-full text-sm self-start md:w-auto md:self-end">
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

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                          to={`/tournaments/${tournament.id}/register`}
                          className={`flex-1 rounded-xl py-3 text-center text-sm font-bold transition-colors ${
                            canRegister
                              ? 'bg-green-500 hover:bg-green-400 text-black'
                              : 'bg-gray-800 text-gray-500 pointer-events-none'
                          }`}
                        >
                          {canRegister ? 'Register Team' : 'Registration Closed'}
                        </Link>
                        <Link
                          to="/tournaments"
                          className="btn-secondary flex-1 py-3 text-center text-sm"
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

      <section className="bg-black py-16 px-4 border-t border-[#1a1a1a]">
        <div className="page-shell">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <span className="section-label">{siteContent.homeHighlightsTitle || defaultWebsiteContent.homeHighlightsTitle}</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
                Training Moments <span className="gradient-text">Worth Seeing</span>
              </h2>
              <p className="text-gray-400 mt-4 max-w-xl text-sm leading-relaxed">
                {siteContent.homeHighlightsDescription || defaultWebsiteContent.homeHighlightsDescription}
              </p>
            </div>
            <Link to="/media" className="btn-secondary w-full text-sm self-start md:w-auto md:self-end">
              View All Highlights
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : homeMediaPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {homeMediaPosts.map((post, index) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setActiveMediaIndex(index)}
                  className="block h-full w-full text-left"
                >
                  <MediaPostCard
                    post={post}
                    className="h-full transition-colors hover:border-amber-500/30"
                    imageLoading={index < 3 ? 'eager' : 'lazy'}
                    imageFetchPriority={index < 2 ? 'high' : 'auto'}
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0f0f0f] px-6 py-12 text-center">
              <p className="text-lg font-semibold text-white">Latest highlights will appear here soon.</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Check back after new photos and videos are published to the media feed.
              </p>
              <Link to="/media" className="btn-secondary mt-6 inline-flex text-sm">
                View all highlights
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#0a0a0a] py-16 px-4 border-t border-[#1a1a1a]">
        <div className="page-shell">
          <div className="text-center mb-10">
            <span className="section-label">Real Results</span>
            <h2 className="text-balance text-3xl font-black text-white sm:text-4xl md:text-5xl">
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
        <div className="page-shell">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative order-2 min-h-80 overflow-hidden rounded-[1.75rem] border border-[#1e1e1e] bg-[#111] lg:order-1">
              <img
                src="/images/IMG_3599.jpeg"
                alt="Coach Kante working with players during a session"
                loading="eager"
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.22),_transparent_42%)]" />
              <div className="relative flex h-full items-end p-6 sm:p-8">
                <div className="max-w-sm rounded-2xl border border-white/10 bg-black/65 p-5 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/Coach.png"
                      alt="Coach Mohamed Sheik Kante"
                      loading="eager"
                      fetchPriority="high"
                      className="h-14 w-14 rounded-full object-cover object-top ring-2 ring-amber-500"
                    />
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-500">Coach Kante</p>
                      <p className="text-sm text-gray-300">Head Coach and Founder</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-gray-200">
                    Focused coaching, clear standards, and sessions designed to carry into real match habits.
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="section-label">The Coach</span>
              <h2 className="mb-5 text-3xl font-black text-white sm:text-4xl">
                Coaching built on <span className="gradient-text">real experience</span> and real standards
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
                <p>
                  {siteContent.aboutIntro || defaultWebsiteContent.aboutIntro}
                </p>
                <p>
                  {siteContent.aboutBody || defaultWebsiteContent.aboutBody}
                </p>
              </div>
              <div className="mb-8 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(siteContent.aboutExperiencePoints?.length
                  ? siteContent.aboutExperiencePoints
                  : defaultWebsiteContent.aboutExperiencePoints
                ).slice(0, 4).map((cred) => (
                  <div key={cred} className="flex items-center gap-2 bg-[#111] border border-[#222] rounded-xl p-3 hover:border-amber-500/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-white text-xs font-semibold">{cred}</span>
                  </div>
                ))}
              </div>
              <div className="mb-8 grid grid-cols-1 gap-3">
                {coachStandards.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-[#222] bg-[#111] px-4 py-4">
                    <p className="text-sm font-black text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn-secondary w-full text-sm sm:w-auto">
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
                icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>),
                title: 'Book Your Session',
                desc: 'Choose your program, pick a date and time, and confirm your session. It only takes a few minutes.',
              },
              {
                step: '02',
                icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>),
                title: 'Confirmation and Follow Up',
                desc: "You will get a confirmation email right away. Coach Kante will follow up before the first session to learn the player's goals.",
              },
              {
                step: '03',
                icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/><path d="M4.9 4.9 7.5 7.5"/><path d="M19.1 4.9 16.5 7.5"/></svg>),
                title: 'Train With a Clear Plan',
                desc: "Each session is built around the player's needs, with progress tracked and the work adjusted over time.",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center group">
                <div className="w-20 h-20 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mx-auto mb-5 relative z-10 group-hover:border-amber-500/30 transition-colors duration-300">
                  {item.icon}
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

      {/* FAQ */}
      <section className="bg-[#050505] border-t border-[#1a1a1a] py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label">Common Questions</p>
            <h2 className="section-heading">
              Answers <span className="gradient-text">Parents Ask</span>
            </h2>
            <p className="section-subheading">
              Quick answers to what we hear most often. Still have questions?{' '}
              <Link to="/contact" className="text-amber-500 hover:text-amber-400 transition-colors">
                Contact us
              </Link>
              .
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'What age groups do you train?',
                a: 'We train players from ages 8 to 18. Each session is tailored to the player\'s age, level, and goals.',
              },
              {
                q: 'Do you offer trial sessions?',
                a: 'Yes. New players can start with a single introductory session before committing to a program. Check the Training page for current options.',
              },
              {
                q: 'What is your cancellation policy?',
                a: 'Please give at least 24 hours notice if you need to cancel or reschedule. Cancellations with less than 24 hours notice and no-shows are non-refundable. Coach-initiated cancellations receive a full refund or reschedule at your choice.',
              },
              {
                q: 'Can parents watch training sessions?',
                a: 'Yes, parents are welcome to observe sessions from designated viewing areas. We believe transparency between coaches and parents supports better player development.',
              },
              {
                q: 'What should my child bring to sessions?',
                a: 'Players should bring cleats (no metal studs on turf), shin guards, a water bottle, and athletic clothing. A ball is provided but players can bring their own.',
              },
            ].map((faq, i) => (
              <div key={i} className="border border-[#222] rounded-xl overflow-hidden">
                <button
                  onClick={() => setHomeFaqOpen(homeFaqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left bg-[#111] hover:bg-[#161616] transition-colors"
                >
                  <span className="text-white font-semibold pr-4">{faq.q}</span>
                  <span
                    className={`text-amber-500 flex-shrink-0 transition-transform duration-200 ${
                      homeFaqOpen === i ? 'rotate-45' : 'rotate-0'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </span>
                </button>
                {homeFaqOpen === i && (
                  <div className="px-6 py-5 bg-[#0d0d0d] border-t border-[#1a1a1a]">
                    <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 text-sm font-semibold transition-colors"
            >
              View all frequently asked questions
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Start Strong"
        title="Your Player&apos;s Best Season Starts Now"
        subtitle="Book a session today and give your player focused training, clear feedback, and a plan for progress."
        primaryLabel="Book Your First Session"
        secondaryLabel="Learn About Programs"
        secondaryHref="/training"
        urgencyLine="Weekend sessions fill fast"
        proofPoints={[
          'Book online in minutes',
          'Confirmation email right away',
          'Coach follow-up before the first session',
        ]}
      />

      <MediaLightbox
        posts={homeMediaPosts}
        activeIndex={activeMediaIndex}
        onClose={() => setActiveMediaIndex(null)}
        onSelect={setActiveMediaIndex}
      />
    </div>
  )
}

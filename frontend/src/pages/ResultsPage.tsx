import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTestimonials } from '../services/api'
import type { Testimonial } from '../types'
import CTASection from '../components/CTASection'
import EmptyState from '../components/EmptyState'
import HeroSection from '../components/HeroSection'
import TestimonialCard from '../components/TestimonialCard'

const achievements = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    stat: '100+',
    label: 'Players Trained',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
    stat: '95%',
    label: 'Show Clear Improvement',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
    stat: 'Columbus',
    label: 'Ohio Based',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    stat: 'U8–18+',
    label: 'Age Groups Served',
  },
]

export default function ResultsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Player Results | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

  useEffect(() => {
    getTestimonials()
      .then(setTestimonials)
      .catch(() => { /* Page still works without testimonials. */ })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-black pt-20">
      <HeroSection
        badge="Real Results"
        title="Real Progress. Real Results."
        subtitle="We measure success by player growth, confidence, and the opportunities earned through consistent training."
      />

      <section className="border-t border-[#1a1a1a] bg-[#0a0a0a] px-4 py-16">
        <div className="page-shell">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {achievements.map((a) => (
              <div
                key={a.label}
                className="card p-8 text-center hover:border-amber-500/30 transition-colors"
              >
                <div className="flex justify-center mb-3">{a.icon}</div>
                <p className="text-amber-500 font-black text-4xl mb-1">{a.stat}</p>
                <p className="text-gray-400 text-sm">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#1a1a1a] bg-black px-4 py-16">
        <div className="page-shell">
          <div className="mb-10 text-center">
            <span className="section-label">What Families Say</span>
            <h2 className="text-white font-black text-4xl text-balance">
              Honest Reviews from Real Families
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-gray-400">
              Parents and players share their experience training with Coach Kante.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card h-48 animate-pulse" />
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <EmptyState
              title="Reviews are on the way"
              description="Family reviews and player stories will appear here as soon as they are published."
              action={
                <Link
                  to="/book"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400"
                >
                  Book a Session
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection
        title="Ready to Start Your Player's Story?"
        subtitle="Every result starts with a first session. Book now and begin with a clear plan."
        primaryLabel="Book a Session"
        primaryHref="/book"
        secondaryLabel="View Programs"
        secondaryHref="/training"
      />
    </div>
  )
}

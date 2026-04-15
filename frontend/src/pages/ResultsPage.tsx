import { useEffect, useState } from 'react'
import { getTestimonials } from '../services/api'
import type { Testimonial } from '../types'
import HeroSection from '../components/HeroSection'
import TestimonialCard from '../components/TestimonialCard'
import CTASection from '../components/CTASection'

const achievements = [
  { icon: '⚽', stat: '100+', label: 'Players Trained' },
  { icon: '📈', stat: '95%', label: 'Show Clear Improvement' },
  { icon: '🏙', stat: 'Columbus', label: 'Ohio Based' },
  { icon: '👥', stat: 'U8-18+', label: 'Age Groups Served' },
]

export default function ResultsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Player Results & Success Stories | Kante Elite Training — Columbus, Ohio'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

  useEffect(() => {
    getTestimonials()
      .then(setTestimonials)
      .catch(() => { /* Page still works without testimonials. */ })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="pt-20">
      <HeroSection
        badge="Real Results"
        title="Real Progress. Real Results."
        subtitle="We measure success by player growth, confidence, and the opportunities earned through consistent training."
      />

      <section className="bg-[#111111] py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((a) => (
              <div
                key={a.label}
                className="card p-8 text-center hover:border-amber-500/30 transition-colors"
              >
                <div className="text-4xl mb-3">{a.icon}</div>
                <p className="text-amber-500 font-black text-4xl mb-1">{a.stat}</p>
                <p className="text-gray-400 text-sm">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111111] py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="section-label">What Families Say</p>
            <h2 className="text-white font-black text-4xl">
              Honest Reviews from <span className="text-amber-500">Real Families</span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      />
    </div>
  )
}

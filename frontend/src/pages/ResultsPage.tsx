import { useEffect, useState } from 'react'
import { getTestimonials } from '../services/api'
import type { Testimonial } from '../types'
import HeroSection from '../components/HeroSection'
import TestimonialCard from '../components/TestimonialCard'
import CTASection from '../components/CTASection'

const achievements = [
  { icon: '🎓', stat: '15+', label: 'College Scholarship Recipients' },
  { icon: '⚽', stat: '200+', label: 'Players Trained' },
  { icon: '🏆', stat: '30+', label: 'ODP Selections' },
  { icon: '📈', stat: '95%', label: 'Visible Improvement in 8 Weeks' },
]

const outcomes = [
  {
    player: 'Jordan W.',
    context: 'U18 Player',
    result: 'Committed to play Division II soccer',
    story:
      'Jordan came to Coach Kante when college scouts were passing him by. After one summer of private training, his first touch, finishing, and confidence improved dramatically.',
  },
  {
    player: 'Aisha B.',
    context: 'U16 Player',
    result: 'Called up for State ODP Program',
    story:
      'Aisha struggled with first touch under pressure. Coach Kante rebuilt her technique with a clear system. She is now one of the most composed players on her club team.',
  },
  {
    player: 'Marcus T.',
    context: 'U14 Player',
    result: 'Starting position secured at competitive club',
    story:
      'Marcus was not getting playing time at club level. After three months of private sessions, he improved across the board and earned a starting spot.',
  },
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

      <section className="bg-black py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="section-label">Player Stories</p>
            <h2 className="text-white font-black text-4xl">
              Development <span className="text-amber-500">Outcomes</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {outcomes.map((o) => (
              <div
                key={o.player}
                className="card p-7 hover:border-amber-500/30 transition-colors"
              >
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-400 text-sm font-bold mb-5 inline-block">
                  ✅ {o.result}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">
                  &ldquo;{o.story}&rdquo;
                </p>
                <div className="border-t border-[#222] pt-4">
                  <p className="text-white font-bold">{o.player}</p>
                  <p className="text-gray-500 text-xs">{o.context}</p>
                </div>
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

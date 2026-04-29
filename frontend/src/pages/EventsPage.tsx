import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getEvents } from '../services/api'
import type { Event } from '../types'
import HeroSection from '../components/HeroSection'
import EventCard from '../components/EventCard'
import CTASection from '../components/CTASection'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const coachFilter = searchParams.get('coach')?.toLowerCase() ?? ''

  useEffect(() => {
    document.title = 'Camps & Events | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => { /* Empty state handles load failures. */ })
      .finally(() => setLoading(false))
  }, [])

  // Events are already filtered to non-COMPLETED by the backend.
  // Apply optional coach filter from ?coach= URL param.
  const visibleEvents = coachFilter
    ? events.filter((e) => (e.coachName ?? '').toLowerCase().includes(coachFilter))
    : events

  // Split by spots remaining: spotsLeft === 0 means full (sold out), regardless of status label.
  const openEvents = visibleEvents.filter((e) => e.spotsLeft === null || e.spotsLeft > 0)
  const soldOutEvents = visibleEvents.filter((e) => e.spotsLeft !== null && e.spotsLeft === 0)

  const coachDisplayName = coachFilter
    ? events.find((e) => (e.coachName ?? '').toLowerCase().includes(coachFilter))?.coachName ?? coachFilter
    : null

  return (
    <div className="pt-20">
      <HeroSection
        badge="Upcoming"
        title="Camps & Events"
        subtitle="Focused camps and special events that give players extra reps, coaching, and confidence."
      />

      <section className="bg-black py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {coachDisplayName && (
            <div className="mb-8 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm font-semibold px-4 py-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Showing sessions with {coachDisplayName}
              </span>
              <Link
                to="/events"
                className="text-gray-500 text-sm hover:text-gray-300 transition-colors underline underline-offset-2"
              >
                View all events
              </Link>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card h-64 animate-pulse" />
              ))}
            </div>
          ) : visibleEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg></div>
                <h3 className="text-white font-black text-2xl mb-3">No Events Currently Scheduled</h3>
                <p className="text-gray-400 mb-6">
                  New camps, clinics, and special events are added as dates are finalized.
                </p>
              <p className="text-gray-500 text-sm">
                Want to hear about the next one first?{' '}
                <a href="/contact" className="text-amber-500 hover:underline">
                  Contact us
                </a>
                .
              </p>
            </div>
          ) : (
            <>
              {openEvents.length > 0 && (
                <>
                  <div className="mb-6">
                    <p className="section-label">Available Now</p>
                    <h2 className="text-white font-black text-3xl">Open for Registration</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {openEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </>
              )}

              {soldOutEvents.length > 0 && (
                <>
                  <div className="mb-6">
                    <p className="section-label text-gray-500">Sold Out</p>
                    <h2 className="text-gray-400 font-bold text-3xl">
                      Past and Sold Out Events
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {soldOutEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      <section className="bg-[#111111] py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <p className="section-label">Common Questions</p>
            <h2 className="text-white font-black text-3xl md:text-4xl">Events FAQ</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'What should my child bring to camp?',
                a: 'Bring cleats, shin guards, athletic clothing, a water bottle, and a packed lunch for full-day camps. A ball is recommended, and we also provide extras.',
              },
              {
                q: 'What age groups do events cover?',
                a: 'We run events for players ages 8 to 18. Each listing includes the specific age range for that event.',
              },
              {
                q: 'What happens if I need to cancel after booking?',
                a: 'We offer full refunds up to 72 hours before the event start date. Contact us as soon as possible and we will do our best to help.',
              },
              {
                q: 'Are events held rain or shine?',
                a: 'Most outdoor events go ahead unless there is a weather safety risk. We will contact registered families if plans change.',
              },
            ].map((item) => (
              <div key={item.q} className="card p-6">
                <h3 className="text-white font-bold mb-2">{item.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Stay Ready"
        title="Want Early Event Updates?"
        subtitle="Camps can fill quickly. Contact us to join our event updates list."
        primaryLabel="Get in Touch"
        primaryHref="/contact"
        secondaryLabel="View Programs"
        secondaryHref="/training"
        proofPoints={[
          'Join the updates list',
          'Fast answers from Coach Kante',
          'Year-round training programs',
        ]}
      />
    </div>
  )
}

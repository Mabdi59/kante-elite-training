import { useEffect, useState } from 'react'
import { getEvents } from '../services/api'
import type { Event } from '../types'
import HeroSection from '../components/HeroSection'
import EventCard from '../components/EventCard'
import CTASection from '../components/CTASection'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => { /* silently fail — empty state handles it */ })
      .finally(() => setLoading(false))
  }, [])

  const openEvents = events.filter((e) => e.status !== 'SOLD_OUT')
  const soldOutEvents = events.filter((e) => e.status === 'SOLD_OUT')

  return (
    <div className="pt-20">
      <HeroSection
        badge="Upcoming"
        title="Camps & Events"
        subtitle="Intensive training experiences designed to deliver the biggest improvements in the shortest time. Reserve your spot before they fill up."
      />

      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card h-64 animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-white font-black text-2xl mb-3">No Events Currently Scheduled</h3>
              <p className="text-gray-400 mb-8">
                Check back soon — we schedule new camps and events regularly throughout the year.
              </p>
              <p className="text-gray-500 text-sm">
                Want to be notified when new events are posted?{' '}
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
                  <div className="mb-8">
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
                  <div className="mb-8">
                    <p className="section-label text-gray-500">Sold Out</p>
                    <h2 className="text-gray-400 font-bold text-3xl">
                      Past & Sold Out Events
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

      {/* FAQ */}
      <section className="bg-[#111111] py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label">Common Questions</p>
            <h2 className="text-white font-black text-3xl md:text-4xl">Events FAQ</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'What should my child bring to camp?',
                a: 'Cleats, shin guards, athletic clothing, a water bottle, and a packed lunch for full-day camps. A ball is recommended but we provide extras.',
              },
              {
                q: 'What age groups do events cover?',
                a: 'We run events for players aged 8–18. Each event specifies its age range — make sure to check the age group listed on each card.',
              },
              {
                q: 'What happens if I need to cancel after booking?',
                a: 'We offer full refunds up to 72 hours before the event start date. Contact us as soon as possible and we will work to accommodate you.',
              },
              {
                q: 'Are events held rain or shine?',
                a: 'Most outdoor events are held rain or shine unless there is a lightning risk. We will notify all registered participants if there are weather cancellations.',
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
        title="Want to Be Notified First?"
        subtitle="Spots at our camps fill up fast. Contact us to be added to our notification list."
        primaryLabel="Get in Touch"
        primaryHref="/contact"
        secondaryLabel="View Programs"
        secondaryHref="/training"
      />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getEvents, getUpcomingSessions } from '../services/api'
import type { Event, Session } from '../types'
import HeroSection from '../components/HeroSection'
import ErrorBanner from '../components/ErrorBanner'
import EventCard from '../components/EventCard'
import CTASection from '../components/CTASection'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const coachFilter = searchParams.get('coach')?.toLowerCase() ?? ''

  useEffect(() => {
    document.title = 'Camps & Events | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

  useEffect(() => {
    Promise.allSettled([getEvents(), getUpcomingSessions()])
      .then(([eventsResult, sessionsResult]) => {
        if (eventsResult.status === 'fulfilled') {
          setEvents(eventsResult.value)
        } else {
          setError('Could not load events. Please refresh to try again.')
        }
        if (sessionsResult.status === 'fulfilled') {
          setSessions(sessionsResult.value.filter((session) => session.sourceType === 'EVENT').slice(0, 10))
        }
      })
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
  const summerTrainingEvents = openEvents.filter((event) => {
    const haystack = `${event.title} ${event.coachName ?? ''}`.toLowerCase()
    return haystack.includes('summer camp') || haystack.includes('summer training')
  })

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
          {error && (
            <div className="mb-6">
              <ErrorBanner message={error} onDismiss={() => setError('')} />
            </div>
          )}

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

          {sessions.length > 0 && (
            <div className="mb-10 rounded-2xl border border-[#2a2a2a] bg-[#111] p-5">
              <p className="section-label">Generated Sessions</p>
              <h3 className="text-white text-xl font-black mb-3">Upcoming Event Sessions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sessions.map((session) => (
                  <div key={session.id} className="rounded-xl border border-[#222] bg-black/40 px-4 py-3">
                    <p className="text-white text-sm font-semibold">{session.sourceTitle}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(session.startDatetime).toLocaleString()} -{' '}
                      {new Date(session.endDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-amber-400 text-xs mt-2">
                      {session.availableSpots} spots left ({session.registeredCount}/{session.capacity})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!coachDisplayName && summerTrainingEvents.length > 0 && (
            <div
              id="summer-training"
              className="mb-10 overflow-hidden rounded-[28px] border border-amber-500/20 bg-[linear-gradient(135deg,rgba(120,53,15,0.24),rgba(10,10,10,0.96))] p-6 sm:p-8"
            >
              <p className="section-label">Summer Training</p>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Coach Kante and Coach Tony are leading this summer together
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-300">
                Our summer camp weeks live in the Events system so families can compare dates and register quickly.
                Choose the week that fits your schedule and reserve a spot online in just a minute.
              </p>
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
          'Fast answers from the Kante Elite team',
          'Year-round training programs',
        ]}
      />
    </div>
  )
}

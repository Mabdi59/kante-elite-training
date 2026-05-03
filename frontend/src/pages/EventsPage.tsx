import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEvents } from '../services/api'
import type { Event, TrainingSession } from '../types'
import HeroSection from '../components/HeroSection'
import EventCard from '../components/EventCard'
import CTASection from '../components/CTASection'

function formatSessionDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(value?: string) {
  if (!value) return ''
  const [hourPart, minutePart = '00'] = value.split(':')
  const hour = Number(hourPart)
  if (!Number.isFinite(hour)) return value
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutePart.padStart(2, '0')} ${suffix}`
}

function buildWeekGroups(sessions: TrainingSession[]) {
  const grouped = new Map<string, TrainingSession[]>()
  sessions
    .filter((session) => session.status !== 'CANCELLED')
    .sort((a, b) => `${a.scheduledDate}-${a.startTime}`.localeCompare(`${b.scheduledDate}-${b.startTime}`))
    .forEach((session) => {
      const key = String(session.sessionSeriesId ?? session.scheduledDate)
      grouped.set(key, [...(grouped.get(key) ?? []), session])
    })

  return Array.from(grouped.entries()).map(([key, group], index) => ({
    key,
    label: `Week ${index + 1}`,
    sessions: group,
  }))
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => { /* Empty state handles load failures. */ })
      .finally(() => setLoading(false))
  }, [])

  const summerTraining = events.find((event) => event.title.toLowerCase() === 'summer training') ?? events[0] ?? null
  const mediaUrls = summerTraining?.mediaUrls?.length
    ? summerTraining.mediaUrls
    : [summerTraining?.primaryMediaUrl, summerTraining?.secondaryMediaUrl].filter(Boolean) as string[]
  const weekCount = new Set((summerTraining?.trainingSessions ?? []).map((session) => session.sessionSeriesId ?? session.scheduledDate)).size
  const weekGroups = buildWeekGroups(summerTraining?.trainingSessions ?? [])
  const bookingHref = summerTraining ? `/events/${summerTraining.id}/register` : '/contact'

  return (
    <div className="pt-20">
      <HeroSection
        badge="Upcoming"
        title="Summer Training"
        subtitle="The live summer offering from Kante Elite Training. Train hard. Improve. Compete."
        mediaPlacement="EVENTS_HERO"
      />

      <section className="bg-black py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="mx-auto max-w-3xl">
              {[...Array(1)].map((_, i) => (
                <div key={i} className="card h-64 animate-pulse" />
              ))}
            </div>
          ) : !summerTraining ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg></div>
                <h3 className="text-white font-black text-2xl mb-3">Summer Training Details Coming Soon</h3>
                <p className="text-gray-400 mb-6">
                  Registration details are being finalized. Contact Coach Kante for the latest summer training availability.
                </p>
            </div>
          ) : (
            <div className="mx-auto max-w-5xl">
              <div
                id="summer-training"
                className="mb-8 overflow-hidden rounded-2xl border border-amber-500/20 bg-[linear-gradient(135deg,rgba(120,53,15,0.24),rgba(10,10,10,0.96))] p-6 sm:p-8"
              >
                <p className="section-label">Only Live Event</p>
                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  Coach Kante and Coach Tony are leading this summer together
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  Summer Training is one event with {weekCount || 3} weekly blocks and Tuesday through Saturday training sessions. Choose a full week or register for a drop-in day.
                </p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-white">
                  <span className="rounded-full border border-amber-500/30 bg-black/30 px-4 py-2">5 Days of Training</span>
                  <span className="rounded-full border border-amber-500/30 bg-black/30 px-4 py-2">Limited Spots</span>
                  <span className="rounded-full border border-amber-500/30 bg-black/30 px-4 py-2">18 spots per session</span>
                </div>
              </div>

              <div className="mb-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-amber-500/25 bg-[#101010] p-5">
                  <p className="text-xs font-bold uppercase text-amber-500">Full Week</p>
                  <p className="mt-2 text-3xl font-black text-white">$125</p>
                  <p className="mt-2 text-sm text-gray-400">Five training days, Tuesday through Saturday.</p>
                </div>
                <div className="rounded-xl border border-green-500/25 bg-[#101010] p-5">
                  <p className="text-xs font-bold uppercase text-green-400">Best Value</p>
                  <p className="mt-2 text-3xl font-black text-white">$25/day</p>
                  <p className="mt-2 text-sm text-gray-400">Only $25 per day with the full-week option.</p>
                </div>
                <div className="rounded-xl border border-[#2a2a2a] bg-[#101010] p-5">
                  <p className="text-xs font-bold uppercase text-amber-500">Drop-in</p>
                  <p className="mt-2 text-3xl font-black text-white">$30</p>
                  <p className="mt-2 text-sm text-gray-400">Register for a single training session.</p>
                </div>
              </div>

              <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 text-center sm:flex-row sm:text-left">
                <div>
                  <p className="text-xs font-bold uppercase text-amber-500">Limited Spots</p>
                  <h3 className="mt-1 text-xl font-black text-white">18 spots per session</h3>
                </div>
                <Link to={bookingHref} className="btn-primary w-full justify-center sm:w-auto">
                  Book Summer Training
                </Link>
              </div>

              {mediaUrls.length ? (
                <div className="mb-8 grid gap-4 md:grid-cols-2">
                  {mediaUrls.map((url) => (
                    <div key={url} className="overflow-hidden rounded-xl border border-[#222] bg-[#0f0f0f]">
                      <img
                        src={url}
                        alt="Summer Training promotional poster"
                        className="h-auto w-full object-contain"
                        loading="eager"
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              <EventCard event={summerTraining} />

              {weekGroups.length ? (
                <div className="mt-10">
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="section-label">Schedule</p>
                      <h2 className="mt-1 text-3xl font-black text-white">Choose a week, then pick your sessions</h2>
                    </div>
                    <Link to={bookingHref} className="btn-primary justify-center">
                      Book Summer Training
                    </Link>
                  </div>

                  <div className="space-y-6">
                    {weekGroups.map((week) => (
                      <div key={week.key} className="rounded-2xl border border-[#222] bg-[#0f0f0f] p-4 sm:p-5">
                        <h3 className="mb-4 text-xl font-black text-white">{week.label}</h3>
                        <div className="grid gap-3">
                          {week.sessions.map((session) => {
                            const spotsLeft = Math.max(session.capacity - session.registrationCount, 0)
                            return (
                              <div key={session.id} className="grid gap-3 rounded-xl border border-[#222] bg-black p-4 sm:grid-cols-[1.2fr_1fr_1fr_0.9fr] sm:items-center">
                                <div>
                                  <p className="text-xs font-bold uppercase text-gray-500">Date</p>
                                  <p className="mt-1 font-black text-white">{formatSessionDate(session.scheduledDate)}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-bold uppercase text-gray-500">Time</p>
                                  <p className="mt-1 font-semibold text-gray-200">
                                    {formatTime(session.startTime)}-{formatTime(session.endTime)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-bold uppercase text-gray-500">Coach</p>
                                  <p className="mt-1 font-semibold text-gray-200">
                                    {session.coachLabel ?? session.coachName ?? 'Coach Kante and Coach Tony'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-bold uppercase text-gray-500">Spots</p>
                                  <p className={`mt-1 font-black ${spotsLeft <= 3 ? 'text-amber-400' : 'text-green-400'}`}>
                                    {spotsLeft} remaining
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    <Link to={bookingHref} className="btn-primary justify-center px-8 py-4">
                      Book Summer Training
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#111111] py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <p className="section-label">Common Questions</p>
            <h2 className="text-white font-black text-3xl md:text-4xl">Summer Training FAQ</h2>
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
        eyebrow="Summer Training"
        title="Train Hard. Improve. Compete."
        subtitle="This is the live event offering. Register online or contact Coach Kante with questions before reserving a spot."
        primaryLabel="Book Summer Training"
        primaryHref={bookingHref}
        secondaryLabel="Ask a Question"
        secondaryHref="/contact"
        proofPoints={['Technical', 'Athletic', 'Tactical', 'Mental']}
      />
    </div>
  )
}

import { Link } from 'react-router-dom'
import type { Event } from '../types'

interface EventCardProps {
  event: Event
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function EventCard({ event }: EventCardProps) {
  const isSoldOut = event.status === 'SOLD_OUT' || event.spotsLeft === 0
  const isLimited = !isSoldOut && event.spotsLeft !== null && event.spotsLeft <= 5

  const statusBadge = isSoldOut
    ? { label: 'Sold Out', cls: 'bg-red-900/40 text-red-400 border-red-500/30' }
    : isLimited
      ? { label: `Only ${event.spotsLeft} spots left`, cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' }
      : { label: 'Open', cls: 'bg-green-900/30 text-green-400 border-green-500/30' }

  return (
    <div className={`card flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 ${isSoldOut ? 'opacity-75' : ''}`}>
      <div className="flex-1 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {event.type && (
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1 block">
                {event.type}
              </span>
            )}
            {event.coachName && (
              <span className="text-xs font-semibold text-gray-400 mb-1 block">
                with {event.coachName}
              </span>
            )}
            <h3 className="text-white font-black text-lg leading-tight">{event.title}</h3>
          </div>
          <span className={`text-xs font-bold border px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${statusBadge.cls}`}>
            {statusBadge.label}
          </span>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed mb-5">{event.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span>
              {formatDate(event.startDate)}
              {event.endDate && ` to ${formatDate(event.endDate)}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span>{event.venue}, {event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <span>{event.ageGroup}</span>
          </div>
          {event.intensity && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
              <span>Intensity: {event.intensity}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#222] px-5 pb-5 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-6">
        <span className="text-amber-500 font-black text-xl">
          ${event.price.toFixed(0)}
        </span>
        {isSoldOut ? (
          <span className="text-gray-500 text-sm font-bold">Registration Closed</span>
        ) : (
          <Link to={`/events/${event.id}/register`} className="btn-primary w-full px-5 py-2 text-sm sm:w-auto">
            Register Now
          </Link>
        )}
      </div>
    </div>
  )
}

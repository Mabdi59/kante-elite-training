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
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {event.type && (
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1 block">
                {event.type}
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
            <span className="text-amber-500">📅</span>
            <span>
              {formatDate(event.startDate)}
              {event.endDate && ` to ${formatDate(event.endDate)}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-amber-500">📍</span>
            <span>{event.venue}, {event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-amber-500">👦</span>
            <span>{event.ageGroup}</span>
          </div>
          {event.intensity && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-amber-500">⚡</span>
              <span>Intensity: {event.intensity}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 flex items-center justify-between border-t border-[#222] pt-4">
        <span className="text-amber-500 font-black text-xl">
          ${event.price.toFixed(0)}
        </span>
        {isSoldOut ? (
          <span className="text-gray-500 text-sm font-bold">Registration Closed</span>
        ) : (
          <Link to="/book" className="btn-primary text-sm px-5 py-2">
            Register Now
          </Link>
        )}
      </div>
    </div>
  )
}

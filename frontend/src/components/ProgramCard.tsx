import { Link } from 'react-router-dom'
import type { Program } from '../types'

interface ProgramCardProps {
  program: Program
  featured?: boolean
  variant?: 'default' | 'compact'
}

export default function ProgramCard({ program, featured = false, variant = 'default' }: ProgramCardProps) {
  const bookHref = `/book?program=${program.slug || program.id}`

  if (variant === 'compact') {
    return (
      <div
        className={`card flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 ${
          featured ? 'border-amber-500/40 ring-1 ring-amber-500/15' : ''
        }`}
      >
        {featured && (
          <div className="bg-amber-500 text-black text-xs font-black uppercase tracking-widest px-4 py-1.5 text-center">
            ⚡ Most Popular
          </div>
        )}
        <div className="p-6 flex flex-col flex-1">
          <div className="text-4xl mb-4">{program.icon}</div>
          <p className="text-amber-500 font-black text-xl mb-1">{program.priceLabel}</p>
          <h3 className="text-white font-black text-lg mb-2 leading-tight">{program.name}</h3>
          {program.whoItsFor && (
            <p className="text-xs text-amber-500/70 font-semibold mb-3 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Best for: {program.whoItsFor}
            </p>
          )}
          <p className="text-gray-400 text-sm leading-relaxed flex-1">{program.shortDescription}</p>
          <Link
            to={bookHref}
            className="btn-primary text-sm text-center mt-5"
          >
            Book Your Session
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`card flex flex-col h-full transition-all duration-300 hover:border-amber-500/30 ${
        featured ? 'border-amber-500/40 ring-1 ring-amber-500/15' : ''
      }`}
    >
      {featured && (
        <div className="bg-amber-500 text-black text-xs font-black uppercase tracking-widest px-4 py-1.5 text-center">
          ⚡ Most Popular
        </div>
      )}

      {/* Icon area */}
      <div className="relative bg-[#111] h-40 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 to-transparent" />
        <span className="text-7xl relative z-10">{program.icon}</span>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-white font-black text-xl leading-tight">{program.name}</h3>
          <span className="text-amber-500 font-black text-lg whitespace-nowrap">{program.priceLabel}</span>
        </div>

        {program.whoItsFor && (
          <p className="text-xs text-amber-500/70 font-semibold mb-4 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Best for: {program.whoItsFor}
          </p>
        )}

        <p className="text-gray-400 text-sm leading-relaxed mb-5">{program.description}</p>

        {program.features.length > 0 && (
          <ul className="space-y-2 mb-6 flex-1">
            {program.features.slice(0, 5).map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        )}

        <Link to={bookHref} className="btn-primary text-center text-sm mt-auto">
          Book Your Session
        </Link>
      </div>
    </div>
  )
}

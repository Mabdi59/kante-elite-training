import { Link } from 'react-router-dom'
import type { Program } from '../types'
import MediaAsset from './MediaAsset'

interface ProgramCardProps {
  program: Program
  featured?: boolean
  variant?: 'default' | 'compact'
}

function programInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'KE'
}

function getProgramBookHref(program: Program) {
  const programParam = encodeURIComponent(String(program.slug || program.id))
  const ctaUrl = program.ctaUrl?.trim()

  if (!ctaUrl || ctaUrl === '/book' || ctaUrl === '/book/') {
    return `/book?program=${programParam}`
  }

  if (ctaUrl.startsWith('/book?') && !/[?&]program(Id)?=/.test(ctaUrl)) {
    return `${ctaUrl}&program=${programParam}`
  }

  return ctaUrl
}

export default function ProgramCard({ program, featured = false, variant = 'default' }: ProgramCardProps) {
  const isFeatured = featured || program.featured === true
  const bookHref = getProgramBookHref(program)
  const ctaLabel = program.ctaLabel || 'Book Your Session'
  const isPromoOffering = Boolean(program.campaignLabel || program.secondaryMediaUrl || program.seasonLabel)
  const coachLine = program.coachNames?.length ? `with ${program.coachNames.join(' + ')}` : ''
  const mediaFrameClass = isPromoOffering ? 'aspect-[4/5] bg-black p-2' : 'aspect-[16/10] bg-[#111]'
  const mediaClass = isPromoOffering ? 'object-contain' : 'object-cover'

  if (variant === 'compact') {
    return (
      <div
        className={`card flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 ${
          isFeatured ? 'border-amber-500/40 ring-1 ring-amber-500/15' : ''
        }`}
      >
        {isFeatured && (
          <div className="bg-amber-500 text-black text-xs font-black uppercase px-4 py-1.5 text-center">
            Featured Offering
          </div>
        )}
        {program.mediaUrl && (
          <div className={`relative ${mediaFrameClass} overflow-hidden border-b border-white/10`}>
            <MediaAsset
              src={program.mediaUrl}
              type={program.mediaType ?? 'IMAGE'}
              alt={`${program.name} promotional banner`}
              loading="eager"
              className={`absolute inset-0 h-full w-full ${mediaClass}`}
            />
          </div>
        )}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase text-amber-300">
              {program.category || 'Training'}
            </span>
            <span className="text-amber-500 font-black text-lg">{program.priceLabel}</span>
          </div>
          <h3 className="text-white font-black text-lg mb-2 leading-tight">{program.name}</h3>
          {coachLine && <p className="text-xs font-bold uppercase text-gray-300 mb-2">{coachLine}</p>}
          {program.campaignLabel && (
            <p className="text-sm font-black text-amber-400 mb-3">{program.campaignLabel}</p>
          )}
          {program.whoItsFor && (
            <p className="text-xs text-amber-500/70 font-semibold mb-3 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Best for: {program.whoItsFor}
            </p>
          )}
          <p className="text-gray-400 text-sm leading-relaxed flex-1">{program.shortDescription}</p>
          <Link to={bookHref} className="btn-primary mt-5 w-full text-center text-sm">
            {ctaLabel}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`card flex flex-col h-full transition-all duration-300 hover:border-amber-500/30 ${
        isFeatured ? 'border-amber-500/40 ring-1 ring-amber-500/15' : ''
      }`}
    >
      {isFeatured && (
        <div className="bg-amber-500 text-black text-xs font-black uppercase px-4 py-1.5 text-center">
          Featured Offering
        </div>
      )}

      <div className={`relative ${mediaFrameClass} overflow-hidden`}>
        {program.mediaUrl ? (
          <MediaAsset
            src={program.mediaUrl}
            type={program.mediaType ?? 'IMAGE'}
            alt={`${program.name} promotional banner`}
            loading="eager"
            className={`absolute inset-0 h-full w-full ${mediaClass} transition-transform duration-500 hover:scale-[1.03]`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.22),_transparent_55%)]">
            <span className="text-5xl font-black text-amber-300">{program.icon || programInitials(program.name)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] font-black uppercase text-gray-200 backdrop-blur">
          {program.seasonLabel || program.category || 'Training'}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-white font-black text-xl leading-tight">{program.name}</h3>
          <span className="text-amber-500 font-black text-lg whitespace-nowrap">{program.priceLabel}</span>
        </div>

        {coachLine && <p className="text-xs font-bold uppercase text-gray-300 mb-2">{coachLine}</p>}
        {program.campaignLabel && (
          <p className="text-sm font-black text-amber-400 mb-3">{program.campaignLabel}</p>
        )}

        {program.whoItsFor && (
          <p className="text-xs text-amber-500/70 font-semibold mb-4 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Best for: {program.whoItsFor}
          </p>
        )}

        <p className="text-gray-400 text-sm leading-relaxed mb-5">{program.description}</p>

        {program.secondaryMediaUrl && (
          <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-black p-2">
            <MediaAsset
              src={program.secondaryMediaUrl}
              type={program.secondaryMediaType ?? 'IMAGE'}
              alt={`${program.name} secondary promotional banner`}
              loading="eager"
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        )}

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

        <Link to={bookHref} className="btn-primary mt-auto w-full text-center text-sm">
          {ctaLabel}
        </Link>
      </div>
    </div>
  )
}

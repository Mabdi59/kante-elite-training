import type { Testimonial } from '../types'
import MediaAsset from './MediaAsset'

interface TestimonialCardProps {
  testimonial: Testimonial
}

const INITIALS_PALETTE = [
  { bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-400' },
  { bg: 'bg-sky-500/15 border-sky-500/30', text: 'text-sky-400' },
  { bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-400' },
  { bg: 'bg-violet-500/15 border-violet-500/30', text: 'text-violet-400' },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const palette = INITIALS_PALETTE[testimonial.id % INITIALS_PALETTE.length]
  const rating = Math.max(0, Math.min(5, testimonial.rating ?? 5))
  const metadata = [testimonial.playerMetadata, testimonial.teamMetadata, testimonial.programName, testimonial.coachName]
    .filter(Boolean)
    .slice(0, 2)

  return (
    <article className="card-hover relative flex h-full flex-col overflow-hidden p-5 sm:p-7">
      {/* Decorative quote mark */}
      <div
        className="absolute top-4 right-5 text-7xl leading-none text-amber-500/10 select-none pointer-events-none font-serif"
        aria-hidden
      >
        &ldquo;
      </div>

      {/* Stars */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex gap-0.5" aria-label={`${rating} out of 5 rating`}>
          {Array.from({ length: rating }, (_, i) => (
            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" />
            </svg>
          ))}
        </div>
        {testimonial.featured && (
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-black uppercase text-amber-300">
            Featured
          </span>
        )}
      </div>

      {testimonial.storyTitle && (
        <h3 className="relative z-10 mb-3 text-lg font-black leading-tight text-white">
          {testimonial.storyTitle}
        </h3>
      )}

      {/* Quote */}
      <blockquote className="relative z-10 mb-6 flex-1 text-sm leading-relaxed text-gray-300">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 border-t border-[#1e1e1e] pt-5">
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-[#2a2a2a] bg-[#111]">
          {testimonial.mediaUrl ? (
            <MediaAsset
              src={testimonial.mediaUrl}
              type={testimonial.mediaType ?? 'IMAGE'}
              alt={`${testimonial.name} testimonial`}
              loading="eager"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center text-sm font-black ${palette.bg} ${palette.text}`}>
              {getInitials(testimonial.name)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight">{testimonial.name}</p>
          {testimonial.roleOrContext && (
            <p className="text-amber-500/70 text-xs mt-0.5 font-medium">{testimonial.roleOrContext}</p>
          )}
          {metadata.length > 0 && (
            <p className="mt-1 text-[11px] font-medium uppercase text-gray-500">
              {metadata.join(' / ')}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

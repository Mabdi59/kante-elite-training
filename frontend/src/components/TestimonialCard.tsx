import type { Testimonial } from '../types'

interface TestimonialCardProps {
  testimonial: Testimonial
}

const PALETTE = [
  { bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-400' },
  { bg: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-400' },
  { bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-400' },
  { bg: 'bg-purple-500/15 border-purple-500/30', text: 'text-purple-400' },
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
  const palette = PALETTE[testimonial.id % PALETTE.length]

  return (
    <div className="card p-7 flex flex-col h-full">
      {/* Stars */}
      <div className="flex gap-0.5 mb-5">
        {Array.from({ length: testimonial.rating }, (_, i) => (
          <span key={i} className="text-amber-400 text-sm">★</span>
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-gray-300 text-sm leading-relaxed flex-1 italic mb-6">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 border-t border-[#222] pt-5">
        <div
          className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-black flex-shrink-0 ${palette.bg} ${palette.text}`}
        >
          {getInitials(testimonial.name)}
        </div>
        <div>
          <p className="text-white font-bold text-sm">{testimonial.name}</p>
          {testimonial.roleOrContext && (
            <p className="text-gray-500 text-xs">{testimonial.roleOrContext}</p>
          )}
        </div>
      </div>
    </div>
  )
}

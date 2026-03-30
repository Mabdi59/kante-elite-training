import { Link } from 'react-router-dom'

interface CTASectionProps {
  title: string
  subtitle?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  urgencyLine?: string
}

export default function CTASection({
  title,
  subtitle,
  primaryLabel = 'Book a Session',
  primaryHref = '/book',
  secondaryLabel,
  secondaryHref,
  urgencyLine,
}: CTASectionProps) {
  return (
    <section className="relative bg-black py-20 px-4 text-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#78350f_0%,_transparent_60%)] opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />

      <div className="relative max-w-4xl mx-auto">
        {urgencyLine && (
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            {urgencyLine}
          </div>
        )}

        <h2 className="text-white font-black text-4xl md:text-5xl mb-5 text-balance">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to={primaryHref} className="btn-primary text-base px-10 py-4 gap-2">
            {primaryLabel}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link to={secondaryHref} className="btn-secondary text-base px-10 py-4">
              {secondaryLabel}
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-gray-600 text-xs">
          {['No commitment required', 'Instant booking confirmation', 'Fast confirmation email'].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-amber-500/60" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

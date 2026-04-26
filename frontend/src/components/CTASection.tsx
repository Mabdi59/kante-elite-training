import { Link } from 'react-router-dom'

interface CTASectionProps {
  title: string
  subtitle?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  eyebrow?: string
  proofPoints?: string[]
  urgencyLine?: string
}

export default function CTASection({
  title,
  subtitle,
  primaryLabel = 'Book a Session',
  primaryHref = '/book',
  secondaryLabel,
  secondaryHref,
  eyebrow,
  proofPoints = [
    'Book online in minutes',
    'Confirmation email right away',
    'Coach follow-up before the first session',
  ],
  urgencyLine,
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden bg-black px-4 py-16 text-center sm:py-24">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,53,15,0.35)_0%,_transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(245,158,11,0.06)_0%,_transparent_50%)]" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />

      <div className="relative max-w-4xl mx-auto">
        {eyebrow && <p className="section-label">{eyebrow}</p>}

        {urgencyLine && (
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            {urgencyLine}
          </div>
        )}

        <h2 className="mb-5 text-3xl font-black text-white text-balance sm:text-4xl md:text-5xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
            {subtitle}
          </p>
        )}
        <div className="button-stack-mobile justify-center">
          <Link to={primaryHref} className="btn-primary w-full gap-2 px-8 py-4 text-base sm:w-auto sm:px-10">
            {primaryLabel}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link to={secondaryHref} className="btn-secondary w-full px-8 py-4 text-base sm:w-auto sm:px-10">
              {secondaryLabel}
            </Link>
          )}
        </div>

        {proofPoints.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 sm:gap-6">
            {proofPoints.map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-amber-500/70" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

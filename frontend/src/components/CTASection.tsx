import { Link } from 'react-router-dom'

interface CTASectionProps {
  title: string
  subtitle?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
}

export default function CTASection({
  title,
  subtitle,
  primaryLabel = 'Book a Session',
  primaryHref = '/book',
  secondaryLabel,
  secondaryHref,
}: CTASectionProps) {
  return (
    <section className="relative bg-black py-24 px-4 text-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#78350f_0%,_transparent_65%)] opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      <div className="relative max-w-4xl mx-auto">
        <h2 className="text-white font-black text-4xl md:text-5xl mb-5">{title}</h2>
        {subtitle && (
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to={primaryHref} className="btn-primary text-base px-10 py-4">
            {primaryLabel} →
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link to={secondaryHref} className="btn-secondary text-base px-10 py-4">
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

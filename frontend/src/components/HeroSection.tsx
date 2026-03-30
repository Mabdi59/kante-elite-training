interface HeroSectionProps {
  badge?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  minHeight?: string
}

export default function HeroSection({
  badge,
  title,
  subtitle,
  align = 'center',
  minHeight = 'min-h-[50vh] py-20 pt-28 md:pt-32',
}: HeroSectionProps) {
  return (
    <section className={`relative bg-black ${minHeight} px-4 overflow-hidden`}>
      <div className="absolute inset-0 bg-radial-hero opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#0a0a00_0%,_transparent_70%)] opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />

      <div
        className={`relative max-w-7xl mx-auto ${
          align === 'center' ? 'text-center' : 'text-left'
        }`}
      >
        {badge && (
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            {badge}
          </div>
        )}
        <h1 className="text-white font-black text-4xl md:text-5xl lg:text-6xl leading-tight mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
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
  minHeight = 'min-h-[44vh] py-20 pt-32 md:pt-36',
}: HeroSectionProps) {
  return (
    <section className={`relative bg-black ${minHeight} px-4 overflow-hidden`}>
      {/* Background layers */}
      <div className="absolute inset-0 bg-radial-hero opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#0a0a00_0%,_transparent_70%)] opacity-50" />

      {/* Subtle dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top + bottom accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`relative max-w-7xl mx-auto animate-fade-up ${
          align === 'center' ? 'text-center' : 'text-left'
        }`}
      >
        {badge && (
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            {badge}
          </div>
        )}
        <h1 className="text-white font-black text-4xl md:text-5xl lg:text-6xl leading-tight mb-4 text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className={`text-gray-300 text-lg md:text-xl leading-relaxed ${align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
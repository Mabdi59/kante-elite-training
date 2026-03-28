interface HeroSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export default function HeroSection({ title, subtitle, badge }: HeroSectionProps) {
  return (
    <section className="relative bg-black py-24 px-4 pt-44 overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#1a0a00_0%,_transparent_60%)]" />
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto text-center">
        {badge && (
          <div className="inline-flex items-center gap-3 text-amber-500 uppercase tracking-[0.2em] text-xs font-black mb-6">
            <span className="w-8 h-px bg-amber-500/60" />
            {badge}
            <span className="w-8 h-px bg-amber-500/60" />
          </div>
        )}
        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-gray-400 text-lg md:text-xl mt-5 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="mt-8 h-px w-12 bg-amber-500 mx-auto" />
      </div>
    </section>
  );
}

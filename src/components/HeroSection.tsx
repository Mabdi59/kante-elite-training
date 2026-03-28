interface HeroSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export default function HeroSection({ title, subtitle, badge }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-br from-black via-[#111111] to-[#1a1a1a] py-24 px-4 pt-36">
      <div className="max-w-7xl mx-auto text-center">
        {badge && (
          <span className="text-amber-500 uppercase tracking-widest text-sm font-semibold block mb-4">
            {badge}
          </span>
        )}
        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-400 text-xl mt-6 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

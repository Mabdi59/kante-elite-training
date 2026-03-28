import Link from "next/link";

interface ProgramCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  icon?: string;
  bookLabel?: string;
  popular?: boolean;
}

export default function ProgramCard({
  title,
  description,
  price,
  features,
  icon,
  bookLabel = "Book Now",
  popular,
}: ProgramCardProps) {
  return (
    <div
      className={`relative bg-[#111111] border rounded-xl p-6 transition-all duration-200 flex flex-col group ${
        popular
          ? "border-amber-500/50 shadow-xl shadow-amber-500/10"
          : "border-[#222222] hover:border-[#444444]"
      }`}
    >
      {/* Amber top accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl transition-all duration-200 ${
          popular ? "bg-amber-500" : "bg-transparent group-hover:bg-amber-500/50"
        }`}
      />

      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
            Most Popular
          </span>
        </div>
      )}

      {icon && <div className="text-3xl mb-4 mt-2">{icon}</div>}
      <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
      <p className="text-amber-500 font-black text-2xl mb-4">{price}</p>
      <p className="text-gray-400 text-sm mb-5 leading-relaxed flex-1">{description}</p>

      <ul className="space-y-2 mb-6">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-amber-500 font-black mt-0.5 flex-shrink-0">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href="/book"
        className={`block w-full font-black py-3 px-6 rounded-lg text-center text-sm transition-all ${
          popular
            ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
            : "bg-[#1a1a1a] hover:bg-amber-500 text-white hover:text-black border border-[#333333] hover:border-amber-500"
        }`}
      >
        {bookLabel}
      </Link>
    </div>
  );
}

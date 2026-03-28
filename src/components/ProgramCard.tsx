import Link from "next/link";

interface ProgramCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  icon?: string;
  bookLabel?: string;
}

export default function ProgramCard({ title, description, price, features, icon, bookLabel = "Book Now" }: ProgramCardProps) {
  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 hover:border-amber-500 transition-all flex flex-col group">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-white font-bold text-xl mb-2">{title}</h3>
      <p className="text-amber-500 font-bold text-2xl mb-3">{price}</p>
      <p className="text-gray-400 text-sm mb-6 leading-relaxed">{description}</p>
      <ul className="space-y-2 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-amber-500 font-bold mt-0.5">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/book"
        className="block w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-6 rounded text-center text-sm transition-all shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/40"
      >
        {bookLabel}
      </Link>
    </div>
  );
}

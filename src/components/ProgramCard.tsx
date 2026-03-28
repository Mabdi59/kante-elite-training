interface ProgramCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  icon?: string;
}

export default function ProgramCard({ title, description, price, features, icon }: ProgramCardProps) {
  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 hover:border-amber-500 transition-all flex flex-col">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-white font-bold text-xl mb-2">{title}</h3>
      <p className="text-amber-500 font-bold text-2xl mb-3">{price}</p>
      <p className="text-gray-400 text-sm mb-6">{description}</p>
      <ul className="space-y-2 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-amber-500 font-bold">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <a
        href="/book"
        className="block w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded text-center text-sm transition-colors"
      >
        Book Now
      </a>
    </div>
  );
}

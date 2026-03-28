interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  rating?: number;
}

const AVATAR_COLORS = [
  { bg: "bg-amber-500/20 border-amber-500/30", text: "text-amber-400" },
  { bg: "bg-blue-500/20 border-blue-500/30",   text: "text-blue-400"  },
  { bg: "bg-green-500/20 border-green-500/30", text: "text-green-400" },
  { bg: "bg-purple-500/20 border-purple-500/30", text: "text-purple-400" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TestimonialCard({ quote, name, role, rating = 5 }: TestimonialCardProps) {
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 hover:border-[#333333] transition-colors relative overflow-hidden flex flex-col">
      {/* Background quote icon */}
      <div className="absolute top-3 right-5 text-7xl font-black leading-none text-amber-500/10 select-none pointer-events-none">
        ❝
      </div>

      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={`star-${i}`} className="text-amber-500 text-base">★</span>
        ))}
      </div>

      <p className="text-gray-200 text-sm leading-relaxed mb-6 flex-1 relative z-10">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${color.bg} ${color.text}`}
        >
          <span className="text-sm font-black">{getInitials(name)}</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm">{name}</p>
          <p className="text-amber-500 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
}

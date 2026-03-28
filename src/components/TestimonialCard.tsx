interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  rating?: number;
}

export default function TestimonialCard({ quote, name, role, rating = 5 }: TestimonialCardProps) {
  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={`star-${i}`} className="text-amber-500 text-lg">★</span>
        ))}
      </div>
      <p className="text-white italic leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="text-white font-bold">{name}</p>
        <p className="text-amber-500 text-sm">{role}</p>
      </div>
    </div>
  );
}

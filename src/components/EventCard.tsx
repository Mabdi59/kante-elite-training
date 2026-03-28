interface EventCardProps {
  title: string;
  date: string;
  location: string;
  ageGroup: string;
  price: string;
  spotsLeft: number | string;
  type: string;
}

export default function EventCard({ title, date, location, ageGroup, price, spotsLeft, type }: EventCardProps) {
  const isLimitedSpots = typeof spotsLeft === "number" && spotsLeft < 5;

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 hover:border-amber-500 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <span className="bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
          {type}
        </span>
        <span className="text-amber-500 font-bold text-lg">{price}</span>
      </div>
      <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
      <div className="space-y-2 text-gray-400 text-sm mb-4">
        <p>📅 {date}</p>
        <p>📍 {location}</p>
        <p>👥 {ageGroup}</p>
      </div>
      <div className="flex items-center justify-between mt-4">
        {typeof spotsLeft === "number" ? (
          <span className={`text-sm font-medium ${isLimitedSpots ? "text-red-400" : "text-gray-400"}`}>
            {isLimitedSpots ? `⚠️ Only ${spotsLeft} spots left!` : `${spotsLeft} spots remaining`}
          </span>
        ) : (
          <span className="text-sm font-medium text-green-400">Open Registration</span>
        )}
      </div>
      <button className="mt-4 w-full border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black font-bold py-2 px-4 rounded transition-colors text-sm">
        Register Now
      </button>
    </div>
  );
}

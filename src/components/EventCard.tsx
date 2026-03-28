interface EventCardProps {
  title: string;
  date: string;
  location: string;
  ageGroup: string;
  price: string;
  spotsLeft: number | string;
  type: string;
  intensity?: string;
  venue?: string;
}

export default function EventCard({ title, date, location, ageGroup, price, spotsLeft, type, intensity, venue }: EventCardProps) {
  const isLimitedSpots = typeof spotsLeft === "number" && spotsLeft <= 5;
  const isSoldOut = typeof spotsLeft === "number" && spotsLeft === 0;

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 hover:border-amber-500 transition-colors flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <span className="bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
          {type}
        </span>
        <span className="text-amber-500 font-bold text-lg">{price}</span>
      </div>
      <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
      <div className="space-y-2 text-gray-400 text-sm mb-4 flex-1">
        <p>📅 {date}</p>
        <p>📍 {location}</p>
        <p>👥 Ages {ageGroup}</p>
        {venue && <p>🏟️ {venue}</p>}
        {intensity && <p>🔥 {intensity}</p>}
      </div>

      {/* Spots indicator */}
      <div className="mb-4">
        {isSoldOut ? (
          <span className="inline-block bg-red-900/30 border border-red-500/40 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full">
            🚫 Sold Out
          </span>
        ) : isLimitedSpots ? (
          <span className="inline-block bg-red-900/20 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full">
            ⚠️ Only {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left!
          </span>
        ) : typeof spotsLeft === "number" ? (
          <span className="inline-block bg-[#1a1a1a] border border-[#333333] text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-full">
            {spotsLeft} spots remaining
          </span>
        ) : (
          <span className="inline-block bg-green-900/20 border border-green-500/30 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full">
            ✓ Open Registration
          </span>
        )}
      </div>

      <button
        disabled={isSoldOut}
        className={`mt-auto w-full font-black py-3 px-4 rounded transition-all text-sm ${
          isSoldOut
            ? "bg-[#222222] text-gray-500 cursor-not-allowed"
            : "bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20 hover:shadow-amber-500/40"
        }`}
      >
        {isSoldOut ? "Sold Out" : "Register Now →"}
      </button>
    </div>
  );
}

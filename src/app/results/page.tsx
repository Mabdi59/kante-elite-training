import HeroSection from "@/components/HeroSection";
import TestimonialCard from "@/components/TestimonialCard";

const testimonials = [
  {
    quote: "Coach Kante completely transformed my son's game. In just 3 months, he went from the bench to starting midfielder.",
    name: "Marcus T.",
    role: "Parent of U14 Player",
  },
  {
    quote: "The technical training here is unlike anything I've experienced. My first touch has improved dramatically.",
    name: "Aaliyah S.",
    role: "U16 Player",
  },
  {
    quote: "Coach Kante's attention to detail and passion for developing young players is exceptional.",
    name: "Jennifer K.",
    role: "Parent of U10 Player",
  },
  {
    quote: "My daughter went from recreational league to playing high school varsity in one year of training with Coach Kante.",
    name: "David R.",
    role: "Parent of U15 Player",
  },
  {
    quote: "The speed and agility sessions have made me so much faster. I'm now one of the quickest players on my team.",
    name: "Jaylen M.",
    role: "U13 Player",
  },
  {
    quote: "We've seen incredible improvement in our son's confidence and technical ability. Worth every penny.",
    name: "The Williams Family",
    role: "Parents of U12 Player",
  },
];

const spotlights = [
  {
    name: "Darius K.",
    age: "U17",
    achievement: "Earned college scholarship to Ohio State Soccer Program",
    detail: "After 2 years of private training, improved from JV to earning a D1 scholarship offer.",
  },
  {
    name: "Sofia R.",
    age: "U15",
    achievement: "Selected for Ohio ODP State Pool",
    detail: "Technical development training resulted in selection to the Ohio Olympic Development Program.",
  },
  {
    name: "Marcus B.",
    age: "U14",
    achievement: "Team MVP & Tournament Champion",
    detail: "Speed & agility training transformed his on-field performance leading his team to championship.",
  },
];

export default function ResultsPage() {
  return (
    <div className="pt-16">
      <HeroSection
        title="Player Results"
        subtitle="Real transformations, real achievements"
        badge="Success Stories"
      />

      {/* Stats */}
      <section className="bg-[#111111] border-y border-[#222222] py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "500+", label: "Players Trained" },
            { value: "47", label: "College Commitments" },
            { value: "23", label: "Tournament Championships" },
            { value: "4.8/5", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-amber-500 font-black text-4xl md:text-5xl">{stat.value}</p>
              <p className="text-gray-400 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-500 uppercase tracking-widest text-sm font-semibold mb-3">Testimonials</p>
            <h2 className="text-white font-black text-4xl md:text-5xl">What They&apos;re Saying</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* Training Highlights */}
      <section className="bg-[#111111] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-500 uppercase tracking-widest text-sm font-semibold mb-3">Highlights</p>
            <h2 className="text-white font-black text-4xl md:text-5xl">Training Highlights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Private Session Highlights 2024",
              "Tournament Prep Training",
              "Speed & Agility Workshop",
              "Technical Skills Showcase",
            ].map((title) => (
              <div
                key={title}
                className="bg-[#1a1a1a] rounded-xl overflow-hidden relative group cursor-pointer"
              >
                <div className="h-48 bg-gradient-to-br from-[#222222] to-[#1a1a1a] flex items-center justify-center">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                    <span className="text-black text-2xl ml-1">▶</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-gray-400 text-xs mt-1">Watch Highlight</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Player Spotlight */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-500 uppercase tracking-widest text-sm font-semibold mb-3">Spotlight</p>
            <h2 className="text-white font-black text-4xl md:text-5xl">Player Spotlights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spotlights.map((player) => (
              <div
                key={player.name}
                className="bg-[#111111] border border-[#222222] rounded-xl p-8 hover:border-amber-500 transition-colors"
              >
                <div className="w-20 h-20 bg-[#222222] rounded-full flex items-center justify-center mb-4 text-3xl">
                  ⚽
                </div>
                <h3 className="text-white font-black text-xl mb-1">{player.name}</h3>
                <p className="text-amber-500 text-sm font-semibold mb-4">{player.age}</p>
                <p className="text-white font-semibold mb-2">{player.achievement}</p>
                <p className="text-gray-400 text-sm">{player.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

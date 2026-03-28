import HeroSection from "@/components/HeroSection";
import TestimonialCard from "@/components/TestimonialCard";
import Link from "next/link";

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
    <div className="pt-24">
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

      {/* What Players Are Working On */}
      <section className="bg-[#111111] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-500 uppercase tracking-widest text-sm font-semibold mb-3">In The Training</p>
            <h2 className="text-white font-black text-4xl md:text-5xl">What Players Are Working On</h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              Every session targets real game situations. Here&apos;s what&apos;s on the training menu right now.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                emoji: "⚡",
                title: "Game-Speed Training",
                desc: "All reps are executed at match intensity. No slow drills — everything mirrors what happens on game day.",
              },
              {
                emoji: "🎯",
                title: "1v1 Attack & Defend",
                desc: "Players battle in tight spaces to build confidence on the ball and improve defensive positioning.",
              },
              {
                emoji: "🧠",
                title: "Decision Making Under Pressure",
                desc: "Small-sided games with constraints force players to read the game faster and make quicker choices.",
              },
              {
                emoji: "💪",
                title: "Confidence Development",
                desc: "Progressive challenges build belief. Players are pushed just beyond their comfort zone — every session.",
              },
              {
                emoji: "🏃",
                title: "First Step Explosiveness",
                desc: "Reaction time drills, starts from rest, and lateral shuffle work to gain those decisive extra yards.",
              },
              {
                emoji: "⚽",
                title: "Ball Mastery Circuits",
                desc: "Hundreds of touches per session. Both feet. All surfaces. So the ball becomes an extension of the body.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[#1a1a1a] border border-[#222222] rounded-xl p-6 hover:border-amber-500 transition-colors"
              >
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
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

      {/* Results CTA */}
      <section className="bg-gradient-to-br from-[#111111] to-black py-20 px-4 text-center border-t border-[#222222]">
        <div className="max-w-3xl mx-auto">
          <p className="text-amber-500 uppercase tracking-widest text-sm font-semibold mb-4">Your Turn</p>
          <h2 className="text-white font-black text-4xl md:text-5xl mb-6 leading-tight">
            This Could Be Your Child&apos;s Story
          </h2>
          <p className="text-gray-400 text-xl mb-10">
            Every player on this page started exactly where your child is right now. Book a session and let&apos;s build their story together.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/book"
              className="bg-amber-500 hover:bg-amber-400 text-black font-black px-10 py-4 rounded text-lg transition-all shadow-lg shadow-amber-500/20"
            >
              Book Your First Session →
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white/30 text-white hover:border-white hover:bg-white/10 px-10 py-4 rounded text-lg transition-all font-bold"
            >
              Ask a Question
            </Link>
          </div>
          <p className="mt-8 text-amber-400 text-sm font-semibold">⚡ Limited spots — sessions book up fast</p>
        </div>
      </section>
    </div>
  );
}

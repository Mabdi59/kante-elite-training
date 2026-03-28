import Link from "next/link";
import ProgramCard from "@/components/ProgramCard";
import TestimonialCard from "@/components/TestimonialCard";
import EventCard from "@/components/EventCard";

const programs = [
  {
    icon: "⚽",
    title: "Private Training",
    price: "$75/session",
    description: "1-on-1 sessions built around YOUR game. Coach Kante identifies your weaknesses, builds a personal plan, and pushes you to your ceiling.",
    features: ["Personalized curriculum", "Video analysis & feedback", "Flexible scheduling", "All skill levels welcome"],
    bookLabel: "Book Private Session",
    popular: true,
  },
  {
    icon: "👥",
    title: "Small Group Training",
    price: "$40/player",
    description: "Train with 2–4 players at your level. Competitive energy, personal attention — and a price that makes sense.",
    features: ["2–4 players max per session", "Game-speed competitive reps", "Team communication drills", "Ages 8–18"],
    bookLabel: "Join a Group",
  },
  {
    icon: "⚡",
    title: "Speed & Agility",
    price: "$50/session",
    description: "Get faster. Get first. Our speed program is built on sports science — so your gains transfer directly to game situations.",
    features: ["Explosive acceleration & quickness", "Agility ladder & cone circuits", "Plyometric power training", "Injury prevention & recovery"],
    bookLabel: "Book Speed Session",
  },
  {
    icon: "🎯",
    title: "Technical Development",
    price: "$45/session",
    description: "First touch. Passing weight. Finishing technique. Master the details that separate good players from great ones.",
    features: ["Ball mastery under pressure", "Precision passing & combination play", "Shooting mechanics & finishing", "1v1 attack and defend"],
    bookLabel: "Book Technical Session",
  },
  {
    icon: "🏕️",
    title: "Training Camps",
    price: "$200/week",
    description: "Full-day immersion for serious players. Camps combine high-volume reps, tactical workshops, and game situations to accelerate development fast.",
    features: ["Full-day training (8am–4pm)", "Guest coaches & speakers", "Game situations & small-sided games", "Certificate of completion"],
    bookLabel: "Register for Camp",
  },
];

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
];

const upcomingEvents = [
  {
    title: "Columbus Youth Cup 2025",
    date: "March 15, 2025",
    location: "Berliner Park, Columbus",
    ageGroup: "U12–U14",
    price: "$150/team",
    spotsLeft: 3,
    type: "Tournament",
    intensity: "High intensity competitive play",
    venue: "Outdoor turf fields",
  },
  {
    title: "Spring Training Camp",
    date: "April 7–11, 2025",
    location: "Kante Elite Training Facility",
    ageGroup: "U8–U18",
    price: "$200",
    spotsLeft: 8,
    type: "Camp",
    intensity: "Full-day high-volume reps",
    venue: "Indoor facility · Columbus, OH",
  },
  {
    title: "Saturday Pickup Games",
    date: "Every Saturday",
    location: "Tuttle Park, Columbus",
    ageGroup: "U14–U18",
    price: "Free",
    spotsLeft: "Open" as const,
    type: "Pickup",
    intensity: "Competitive small-sided games",
    venue: "Outdoor grass fields",
  },
];

const AVATAR_INITIALS = ["MT", "AS", "JK", "DR"];

export default function HomePage() {
  return (
    <div className="pt-24">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="min-h-screen relative flex items-center px-4 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#1a0a00_0%,_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#0d0d0d_0%,_transparent_60%)]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none" />
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto w-full py-20 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          {/* Left — main content */}
          <div className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">
                Columbus, Ohio&apos;s Premier Youth Soccer Academy
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none mb-8">
              <span className="text-white block">TRAIN LIKE</span>
              <span className="text-amber-500 block">AN ELITE</span>
              <span className="text-white block">PLAYER</span>
            </h1>

            <p className="text-gray-300 text-xl max-w-xl mb-10 leading-relaxed">
              Professional youth soccer coaching in Columbus focused on skill, speed, and game performance. Ages 6–18.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                href="/book"
                className="bg-amber-500 hover:bg-amber-400 text-black font-black px-10 py-4 rounded-lg text-lg transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/45"
              >
                Book Training →
              </Link>
              <Link
                href="/training"
                className="border-2 border-white/20 text-white hover:border-white/50 hover:bg-white/5 px-10 py-4 rounded-lg text-lg transition-all font-bold"
              >
                View Programs
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {AVATAR_INITIALS.map((initials, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-[#1a1a1a] border-2 border-black flex items-center justify-center text-xs font-black text-amber-500"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-500 text-sm">★</span>
                  ))}
                </div>
                <p className="text-gray-400 text-xs">500+ players trained · 98% satisfaction</p>
              </div>
            </div>
          </div>

          {/* Right — live activity card */}
          <div className="lg:col-span-2 hidden lg:block">
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-sm">Live Activity</span>
                <span className="text-green-400 text-xs font-bold bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Active
                </span>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black rounded-xl p-4 text-center border border-[#1a1a1a]">
                  <p className="text-amber-500 font-black text-2xl">12</p>
                  <p className="text-gray-500 text-xs mt-1">Sessions This Week</p>
                </div>
                <div className="bg-black rounded-xl p-4 text-center border border-[#1a1a1a]">
                  <p className="text-amber-500 font-black text-2xl">3</p>
                  <p className="text-gray-500 text-xs mt-1">Spots Remaining</p>
                </div>
              </div>

              {/* Latest review */}
              <div className="bg-black rounded-xl p-4 border border-[#1a1a1a]">
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-500 text-xs">★</span>
                  ))}
                </div>
                <p className="text-gray-300 text-xs leading-relaxed italic">
                  &ldquo;My son went from bench to starting midfielder in just 3 months.&rdquo;
                </p>
                <p className="text-gray-600 text-xs mt-2">— Marcus T., Parent of U14 Player</p>
              </div>

              {/* Next available CTA */}
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div>
                  <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">Next Available</p>
                  <p className="text-white font-bold text-sm mt-0.5">Tomorrow · 9:00 AM</p>
                </div>
                <Link
                  href="/book"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-4 py-2.5 rounded-lg transition-all shadow-md shadow-amber-500/20"
                >
                  Book →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0d0d0d] border-y border-[#1a1a1a] py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-[#1a1a1a]">
          {[
            { value: "500+", label: "Players Trained" },
            { value: "10+",  label: "Years Experience" },
            { value: "15+",  label: "Tournaments Won"  },
            { value: "98%",  label: "Player Satisfaction" },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-6 py-2">
              <p className="text-amber-500 font-black text-4xl leading-none">{stat.value}</p>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Programs ──────────────────────────────────────────────────────── */}
      <section className="bg-black py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-3 text-amber-500 uppercase tracking-[0.2em] text-xs font-black mb-4">
              <span className="w-8 h-px bg-amber-500/60" />
              Training Programs
              <span className="w-8 h-px bg-amber-500/60" />
            </div>
            <h2 className="text-white font-black text-4xl md:text-5xl">Choose Your Path to Excellence</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {programs.map((program) => (
              <ProgramCard key={program.title} {...program} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────────────── */}
      <section className="bg-[#0d0d0d] py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-3 text-amber-500 uppercase tracking-[0.2em] text-xs font-black mb-4">
              <span className="w-8 h-px bg-amber-500/60" />
              Why Us
              <span className="w-8 h-px bg-amber-500/60" />
            </div>
            <h2 className="text-white font-black text-4xl md:text-5xl">Why Players Choose Kante Elite</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🏆",
                title: "Professional Coaching",
                desc: "Former semi-professional player with UEFA & USSF certifications and a decade of elite coaching experience.",
              },
              {
                icon: "📊",
                title: "Data-Driven Training",
                desc: "Video analysis and performance tracking to measure and accelerate your progress every session.",
              },
              {
                icon: "🎯",
                title: "Individual Focus",
                desc: "Customized training plans built around each athlete's unique strengths, weaknesses, and goals.",
              },
              {
                icon: "🌟",
                title: "Proven Results",
                desc: "500+ players trained — college commitments, tournament championships, and varsity starters.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[#111111] rounded-xl p-8 border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors group"
              >
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-5 text-2xl group-hover:bg-amber-500/15 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/book"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black px-10 py-4 rounded-lg text-lg transition-all shadow-xl shadow-amber-500/20"
            >
              Start Training Today →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="bg-black py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-3 text-amber-500 uppercase tracking-[0.2em] text-xs font-black mb-4">
              <span className="w-8 h-px bg-amber-500/60" />
              Testimonials
              <span className="w-8 h-px bg-amber-500/60" />
            </div>
            <h2 className="text-white font-black text-4xl md:text-5xl">What Players &amp; Parents Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
          <div className="text-center mt-14">
            <p className="text-gray-500 mb-6">Join hundreds of Columbus players who have already leveled up their game.</p>
            <Link
              href="/book"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black px-10 py-4 rounded-lg text-lg transition-all shadow-xl shadow-amber-500/20"
            >
              Book Your First Session →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ───────────────────────────────────────────────── */}
      <section className="bg-[#0d0d0d] py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-3 text-amber-500 uppercase tracking-[0.2em] text-xs font-black mb-4">
              <span className="w-8 h-px bg-amber-500/60" />
              Events
              <span className="w-8 h-px bg-amber-500/60" />
            </div>
            <h2 className="text-white font-black text-4xl md:text-5xl">Upcoming Events</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {upcomingEvents.map((event) => (
              <EventCard key={event.title} {...event} />
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/events"
              className="border border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-black font-bold px-8 py-3 rounded-lg transition-all"
            >
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-black py-28 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#78350f_0%,_transparent_65%)] opacity-25" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 text-amber-500 uppercase tracking-[0.2em] text-xs font-black mb-6">
            <span className="w-8 h-px bg-amber-500/60" />
            Don&apos;t Wait
            <span className="w-8 h-px bg-amber-500/60" />
          </div>
          <h2 className="text-white font-black text-4xl md:text-6xl mb-6 leading-tight">
            HOW FAST CAN YOUR<br />CHILD IMPROVE?
          </h2>
          <p className="text-gray-300 text-xl mb-4">
            Most players see measurable improvement within the first 3 sessions.
          </p>
          <p className="text-gray-500 text-sm mb-12">
            Indoor facility · Columbus, Ohio · Ages 6–18 · Small groups
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/book"
              className="bg-amber-500 hover:bg-amber-400 text-black font-black px-12 py-5 rounded-lg text-xl transition-all shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50"
            >
              Book Your First Session →
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white/20 text-white hover:border-white/40 hover:bg-white/5 px-10 py-5 rounded-lg text-xl transition-all font-bold"
            >
              Ask a Question
            </Link>
          </div>
          <p className="mt-10 text-amber-400/80 text-sm font-semibold">
            ⚡ Spots are limited — sessions book up fast
          </p>
        </div>
      </section>
    </div>
  );
}


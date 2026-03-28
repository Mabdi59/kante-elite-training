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

export default function HomePage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="min-h-screen relative flex items-center px-4 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#1a0a00_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#111111_0%,_transparent_70%)]" />
        {/* Decorative diagonal accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto w-full py-20">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">
              Columbus, Ohio&apos;s Premier Youth Soccer Academy
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6">
            <span className="text-white block">TRAIN LIKE</span>
            <span className="text-amber-500 block">AN ELITE PLAYER</span>
          </h1>
          <p className="text-gray-300 text-xl md:text-2xl max-w-2xl mb-4 leading-relaxed">
            Private &amp; Group Soccer Training in Columbus focused on skill, speed, and game performance.
          </p>
          <p className="text-gray-500 text-base mb-10">
            Indoor facility · Ages 6–18 · Small groups · Year-round training
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/book"
              className="bg-amber-500 hover:bg-amber-400 text-black font-black px-10 py-4 rounded text-lg transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
            >
              Book Training →
            </Link>
            <Link
              href="/training"
              className="border-2 border-white/30 text-white hover:border-white hover:bg-white/10 px-10 py-4 rounded text-lg transition-all font-bold"
            >
              View Programs
            </Link>
          </div>

          {/* Urgency strip */}
          <p className="mt-8 text-amber-400 text-sm font-semibold">
            ⚡ Limited spots available — sessions filling fast
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#111111] border-y border-[#222222] py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "500+", label: "Players Trained" },
            { value: "10+", label: "Years Experience" },
            { value: "15+", label: "Tournaments Won" },
            { value: "98%", label: "Player Satisfaction" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-amber-500 font-black text-3xl">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-500 uppercase tracking-widest text-sm font-semibold mb-3">Training Programs</p>
            <h2 className="text-white font-black text-4xl md:text-5xl">Choose Your Path to Excellence</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {programs.map((program) => (
              <ProgramCard key={program.title} {...program} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#111111] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-500 uppercase tracking-widest text-sm font-semibold mb-3">Why Us</p>
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
              <div key={item.title} className="bg-[#1a1a1a] rounded-xl p-8">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/book"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black px-10 py-4 rounded text-lg transition-all shadow-lg shadow-amber-500/20"
            >
              Start Training Today →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-500 uppercase tracking-widest text-sm font-semibold mb-3">Testimonials</p>
            <h2 className="text-white font-black text-4xl md:text-5xl">What Players &amp; Parents Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-400 mb-6">Join hundreds of Columbus players who have already leveled up their game.</p>
            <Link
              href="/book"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black px-10 py-4 rounded text-lg transition-all shadow-lg shadow-amber-500/20"
            >
              Book Your First Session →
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="bg-[#111111] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-500 uppercase tracking-widest text-sm font-semibold mb-3">Events</p>
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
              className="border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black font-bold px-8 py-3 rounded transition-colors"
            >
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-black py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#78350f_0%,_transparent_70%)] opacity-30" />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-amber-500 uppercase tracking-widest text-sm font-semibold mb-4">Don&apos;t Wait</p>
          <h2 className="text-white font-black text-4xl md:text-6xl mb-6 leading-tight">
            HOW FAST CAN YOUR<br />CHILD IMPROVE?
          </h2>
          <p className="text-gray-300 text-xl mb-4">
            Most players see measurable improvement within the first 3 sessions.
          </p>
          <p className="text-gray-500 text-base mb-10">
            Indoor facility · Columbus, Ohio · Ages 6–18 · Small groups
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/book"
              className="bg-amber-500 hover:bg-amber-400 text-black font-black px-12 py-5 rounded text-xl transition-all shadow-xl shadow-amber-500/30"
            >
              Book Your First Session →
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white/30 text-white hover:border-white hover:bg-white/10 px-10 py-5 rounded text-xl transition-all font-bold"
            >
              Ask a Question
            </Link>
          </div>
          <p className="mt-8 text-amber-400 text-sm font-semibold">
            ⚡ Spots are limited — sessions book up fast
          </p>
        </div>
      </section>
    </div>
  );
}

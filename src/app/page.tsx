import Link from "next/link";
import ProgramCard from "@/components/ProgramCard";
import TestimonialCard from "@/components/TestimonialCard";
import EventCard from "@/components/EventCard";

const programs = [
  {
    icon: "⚽",
    title: "Private Training",
    price: "$75/session",
    description: "1-on-1 personalized coaching",
    features: ["Personalized curriculum", "Video analysis", "Flexible scheduling", "All skill levels"],
  },
  {
    icon: "👥",
    title: "Small Group Training",
    price: "$40/player",
    description: "2-4 players, team dynamics",
    features: ["Competitive environment", "Team chemistry", "Cost effective", "Ages 8-18"],
  },
  {
    icon: "⚡",
    title: "Speed & Agility",
    price: "$50/session",
    description: "Athletic performance development",
    features: ["Speed training", "Agility drills", "Strength & conditioning", "Injury prevention"],
  },
  {
    icon: "🎯",
    title: "Technical Development",
    price: "$45/session",
    description: "Ball mastery and technical skills",
    features: ["Ball control", "Passing accuracy", "Shooting technique", "Dribbling skills"],
  },
  {
    icon: "🏕️",
    title: "Training Camps",
    price: "$200/week",
    description: "Intensive week-long programs",
    features: ["Full day training", "Guest coaches", "Game situations", "Certificate of completion"],
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
    ageGroup: "U12-U14",
    price: "$150/team",
    spotsLeft: 3,
    type: "Tournament",
  },
  {
    title: "Spring Training Camp",
    date: "April 7-11, 2025",
    location: "Kante Elite Training Facility",
    ageGroup: "U8-U18",
    price: "$200",
    spotsLeft: 8,
    type: "Camp",
  },
  {
    title: "Saturday Pickup Games",
    date: "Every Saturday",
    location: "Tuttle Park, Columbus",
    ageGroup: "U14-U18",
    price: "Free",
    spotsLeft: "Open",
    type: "Pickup",
  },
];

export default function HomePage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="min-h-screen bg-gradient-to-br from-black via-[#111111] to-[#1a1a1a] flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full py-20">
          <p className="text-amber-500 uppercase tracking-widest text-sm font-semibold mb-6">
            Columbus, Ohio&apos;s #1 Youth Soccer Academy
          </p>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            <span className="text-white block">ELITE SOCCER TRAINING</span>
            <span className="text-amber-500 block">FOR CHAMPIONS</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mb-10">
            Develop your skill, speed, and confidence with professional coaching tailored to your level.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/book"
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-4 rounded text-lg transition-colors"
            >
              Book Training
            </Link>
            <Link
              href="/training"
              className="border border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded text-lg transition-colors font-bold"
            >
              View Programs
            </Link>
          </div>
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
                desc: "Former professional player with UEFA certifications and a decade of elite coaching experience.",
              },
              {
                icon: "📊",
                title: "Data-Driven Training",
                desc: "Video analysis and performance tracking to measure and accelerate your progress.",
              },
              {
                icon: "🎯",
                title: "Individual Focus",
                desc: "Customized training plans designed around each athlete's unique strengths and goals.",
              },
              {
                icon: "🌟",
                title: "Proven Results",
                desc: "500+ players trained with multiple college commitments and tournament championships.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-[#1a1a1a] rounded-xl p-8">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-500 uppercase tracking-widest text-sm font-semibold mb-3">Testimonials</p>
            <h2 className="text-white font-black text-4xl md:text-5xl">What Players & Parents Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
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
      <section className="bg-gradient-to-r from-amber-600 to-amber-500 py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-black font-black text-4xl md:text-5xl mb-6">READY TO ELEVATE YOUR GAME?</h2>
          <p className="text-black/80 text-xl mb-10">
            Join hundreds of Columbus youth players who have transformed their game with Kante Elite Training.
          </p>
          <Link
            href="/book"
            className="bg-black text-white hover:bg-[#222222] font-bold px-10 py-4 rounded text-lg transition-colors"
          >
            Book Your First Session
          </Link>
        </div>
      </section>
    </div>
  );
}

import HeroSection from "@/components/HeroSection";
import Link from "next/link";

const programs = [
  {
    icon: "⚽",
    title: "Private Training",
    price: "$75/session",
    description:
      "Our flagship 1-on-1 private training sessions are designed to accelerate individual growth. Coach Kante works directly with your player to identify weaknesses, build on strengths, and develop a personalized curriculum that drives real results.",
    features: [
      "Personalized curriculum tailored to your goals",
      "Video analysis and performance feedback",
      "Flexible scheduling to fit your lifestyle",
      "Suitable for all skill levels (Beginner to Elite)",
      "Progress tracking and milestone reviews",
      "Parent/player feedback reports",
    ],
  },
  {
    icon: "👥",
    title: "Small Group Training",
    price: "$40/player",
    description:
      "Train alongside 2-4 peers of similar age and skill level. Small group sessions combine individual attention with the competitive energy of group training. Players push each other, learn from each other, and develop team-oriented skills.",
    features: [
      "2-4 players per session for personalized attention",
      "Competitive training environment",
      "Team chemistry and communication development",
      "Cost-effective alternative to private sessions",
      "Ages 8-18 welcome",
      "Peer accountability and motivation",
    ],
  },
  {
    icon: "⚡",
    title: "Speed & Agility",
    price: "$50/session",
    description:
      "Dominate on the field with elite athletic conditioning. Our Speed & Agility program is built around proven sports science principles to improve your acceleration, lateral quickness, and overall athleticism.",
    features: [
      "Linear and lateral speed development",
      "Advanced agility ladder and cone drills",
      "Strength and conditioning fundamentals",
      "Injury prevention and flexibility",
      "Plyometric training for explosive power",
      "Soccer-specific athletic movements",
    ],
  },
  {
    icon: "🎯",
    title: "Technical Development",
    price: "$45/session",
    description:
      "Master the technical foundation of the beautiful game. From first touch to finishing, our Technical Development program covers every aspect of individual ball mastery required to compete at the highest levels.",
    features: [
      "Ball control and first touch mastery",
      "Passing accuracy and weight of pass",
      "Shooting technique and finishing",
      "Advanced dribbling and feints",
      "Positional skills development",
      "1v1 attacking and defending",
    ],
  },
  {
    icon: "🏕️",
    title: "Training Camps",
    price: "$200/week",
    description:
      "Immerse yourself in soccer excellence with our intensive week-long training camps. Designed to provide a transformative experience, camps combine high-volume training with tactical education and team activities.",
    features: [
      "Full-day structured training (8am-4pm)",
      "Guest coaches and professional players",
      "Game situation and small-sided games",
      "Tactical and positional workshops",
      "Certificate of completion",
      "Team building activities",
    ],
  },
];

export default function TrainingPage() {
  return (
    <div className="pt-24">
      <HeroSection
        title="Training Programs"
        subtitle="Professional coaching tailored to every level"
        badge="What We Offer"
      />

      <div className="bg-black">
        {programs.map((program, index) => (
          <section
            key={program.title}
            className={`py-20 px-4 ${index % 2 === 1 ? "bg-[#111111]" : "bg-black"}`}
          >
            <div className="max-w-7xl mx-auto">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                {index % 2 === 1 ? (
                  <>
                    <div className="order-2 lg:order-1">
                      <div className="bg-[#1a1a1a] rounded-2xl h-80 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
                        <span className="text-8xl relative z-10">{program.icon}</span>
                      </div>
                    </div>
                    <div className="order-1 lg:order-2">
                      <p className="text-amber-500 font-bold text-2xl mb-2">{program.price}</p>
                      <h2 className="text-white font-black text-4xl mb-4">{program.title}</h2>
                      <p className="text-gray-400 leading-relaxed mb-6">{program.description}</p>
                      <ul className="space-y-2 mb-8">
                        {program.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                            <span className="text-amber-500 font-bold">✓</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/book"
                        className="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3 rounded-lg transition-all shadow-lg shadow-amber-500/20"
                      >
                        Book This Program
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-amber-500 font-bold text-2xl mb-2">{program.price}</p>
                      <h2 className="text-white font-black text-4xl mb-4">{program.title}</h2>
                      <p className="text-gray-400 leading-relaxed mb-6">{program.description}</p>
                      <ul className="space-y-2 mb-8">
                        {program.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                            <span className="text-amber-500 font-bold">✓</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/book"
                        className="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3 rounded-lg transition-all shadow-lg shadow-amber-500/20"
                      >
                        Book This Program
                      </Link>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-2xl h-80 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
                      <span className="text-8xl relative z-10">{program.icon}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <section className="relative bg-black py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#78350f_0%,_transparent_65%)] opacity-25" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        <div className="relative max-w-4xl mx-auto">
          <h2 className="text-white font-black text-4xl md:text-5xl mb-6">Start Training Today</h2>
          <p className="text-gray-300 text-xl mb-10">
            Ready to take your game to the next level? Book your first session now.
          </p>
          <Link
            href="/book"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black px-10 py-4 rounded-lg text-lg transition-all shadow-xl shadow-amber-500/25"
          >
            Book Your Session →
          </Link>
        </div>
      </section>
    </div>
  );
}

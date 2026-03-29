import HeroSection from '../components/HeroSection'
import CTASection from '../components/CTASection'

const credentials = [
  { icon: '🏅', label: 'USSF A License' },
  { icon: '🏅', label: 'UEFA B License' },
  { icon: '📋', label: 'Youth Coaching Specialist' },
  { icon: '⏱️', label: '10+ Years Experience' },
  { icon: '🎓', label: 'Sports Science Background' },
  { icon: '🏆', label: 'Former Semi-Professional Player' },
]

const pillars = [
  {
    icon: '🎯',
    title: 'Technical Excellence',
    description:
      'We believe technical mastery is the foundation of every great player. Every session focuses on deliberate practice to build lasting technical skills that translate to game performance.',
  },
  {
    icon: '💪',
    title: 'Mental Strength',
    description:
      'Soccer is as much a mental game as it is physical. We develop confident, resilient athletes who can perform under pressure and lead their teams with composure.',
  },
  {
    icon: '⚡',
    title: 'Physical Development',
    description:
      'Athletic excellence requires a strong physical foundation. Our training incorporates sport science principles to develop speed, strength, and endurance appropriate for each age group.',
  },
]

export default function AboutPage() {
  return (
    <div className="pt-20">
      <HeroSection
        badge="Our Story"
        title="About Coach Kante"
        subtitle="A commitment to developing the next generation of soccer excellence — right here in Columbus."
      />

      {/* Coach profile */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="bg-[#1a1a1a] rounded-2xl h-96 lg:h-full min-h-80 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 to-transparent" />
              <div className="text-center relative z-10">
                <div className="text-8xl mb-4">👨‍🏫</div>
                <p className="text-gray-400 text-sm">Coach Mamadou Kante</p>
              </div>
            </div>
            <div>
              <p className="section-label">The Coach</p>
              <h2 className="text-white font-black text-4xl mb-6">
                Coach Mamadou <span className="text-amber-500">Kante</span>
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
                <p>
                  Born and raised in Columbus, Ohio, Coach Mamadou Kante has dedicated his life to
                  the beautiful game and to developing the next generation of elite soccer players
                  right here in the city he calls home.
                </p>
                <p>
                  After a decorated playing career that included stints as a semi-professional player
                  in the USL and NPSL leagues, Coach Kante transitioned to coaching with one mission:
                  to provide Columbus youth players with the same world-class development opportunities
                  available in elite soccer academies around the globe.
                </p>
                <p>
                  With over a decade of coaching experience, UEFA and USSF licensure, and a deep
                  understanding of player development science, Coach Kante has built Kante Elite
                  Training into Columbus's premier youth soccer academy.
                </p>
                <p>
                  His players have gone on to earn college scholarships, compete in Olympic Development
                  Programs, and represent Ohio at national youth tournaments.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-8">
                {credentials.map((c) => (
                  <div
                    key={c.label}
                    className="flex items-center gap-3 bg-[#111111] border border-[#222222] rounded-lg p-3"
                  >
                    <span className="text-xl">{c.icon}</span>
                    <span className="text-white text-xs font-semibold">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-[#111111] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label">Philosophy</p>
            <h2 className="text-white font-black text-4xl md:text-5xl">The Three Pillars</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-[#1a1a1a] rounded-xl p-8 border border-[#222222] hover:border-amber-500/30 transition-colors"
              >
                <div className="text-5xl mb-6">{pillar.icon}</div>
                <h3 className="text-white font-black text-2xl mb-4">{pillar.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="section-label">Our Mission</p>
          </div>
          <div className="border-l-4 border-amber-500 pl-8">
            <blockquote className="text-white font-black text-2xl md:text-3xl leading-relaxed italic">
              &ldquo;To provide every young player in Columbus with the tools, training, and belief
              to reach their full potential — on the field and in life.&rdquo;
            </blockquote>
            <p className="text-amber-500 font-bold mt-4">— Coach Mamadou Kante</p>
          </div>
        </div>
      </section>

      <CTASection
        title="Start Your Journey"
        subtitle="Ready to train with Columbus's most dedicated youth soccer coach?"
      />
    </div>
  )
}

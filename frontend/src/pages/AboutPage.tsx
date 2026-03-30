import HeroSection from '../components/HeroSection'
import CTASection from '../components/CTASection'

const experiencePoints = [
  'Somalia National Team player',
  'Ohio Dominican University captain and starter',
  'All-Conference honors and Player of the Week',
  'Experience in USL2 and UPSL level competition',
  'Years of competitive and high level training',
]

const pillars = [
  {
    icon: '⚽',
    title: 'Technical Detail',
    description:
      'Sessions focus on clean technique, sharper decision making, and the details that hold up under pressure.',
  },
  {
    icon: '💪',
    title: 'Game Confidence',
    description:
      'Players train with intent. The goal is to help them step on the field prepared, confident, and ready to perform.',
  },
  {
    icon: '📈',
    title: 'Weekly Progress',
    description:
      'Training is built for steady improvement. Players get clear direction, honest feedback, and work that leads to real growth.',
  },
]

export default function AboutPage() {
  return (
    <div className="pt-20">
      <HeroSection
        badge="About"
        title="Mohamed Sheik Kante"
        subtitle="Founder and Head Coach. Known as Coach Kante."
      />

      <section className="bg-black py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-[#1a1a1a] rounded-2xl h-96 lg:h-full min-h-80 flex items-center justify-center relative overflow-hidden border border-[#222]">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 to-transparent" />
              <div className="text-center relative z-10 px-8">
                <div className="text-8xl mb-4">👨‍🏫</div>
                <p className="text-white font-bold text-lg">Mohamed Sheik Kante</p>
                <p className="text-gray-500 text-sm mt-1">Known as Coach Kante</p>
                <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mt-2">
                  Founder and Head Coach
                </p>
              </div>
            </div>

            <div>
              <span className="section-label">About</span>
              <h2 className="text-white font-black text-4xl mb-4">
                Built on real playing experience and high level competition
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
                <p>
                  Mohamed Sheik Kante brings real experience from the national team, college soccer, and high level competitive environments.
                </p>
                <p>
                  Training here is direct and performance focused. Players work on the details that matter on game day.
                </p>
                <p>
                  Every session is designed to help players improve with purpose, build confidence, and compete at a higher level.
                </p>
              </div>

              <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-4">
                <p className="text-amber-400 font-semibold text-sm">
                  Helping players in Columbus improve every week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#111111] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="section-label">Coaching and Playing Experience</span>
            <h2 className="text-white font-black text-4xl md:text-5xl mb-4">
              Proven experience that shapes every session
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Built on real playing experience and high level competition.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#222] rounded-2xl p-8">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experiencePoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 rounded-xl bg-[#111] border border-[#1f1f1f] px-4 py-4"
                >
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span className="text-white text-sm font-semibold leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-black py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="section-label">Coaching Philosophy</span>
            <h2 className="text-white font-black text-4xl md:text-5xl">
              How Players Get Better Here
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">
              Training is built for players who want to improve with intent and perform when it matters most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#1e1e1e] hover:border-amber-500/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl mb-6">
                  {pillar.icon}
                </div>
                <h3 className="text-white font-black text-xl mb-4">{pillar.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Train With Confidence"
        subtitle="Book a session with a coach who brings real playing experience and a clear plan for development."
        urgencyLine="Limited spots available each week"
      />
    </div>
  )
}

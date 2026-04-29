import { Link } from 'react-router-dom'

const coaches = [
  {
    name: 'Coach Kante',
    label: 'Founder & Elite Trainer',
    src: 'https://github.com/user-attachments/assets/04d4698b-38fc-4576-9d23-f3e0612a7f8e',
    alt: 'Coach Kante – promo card. Former Division 2 player at Ohio Dominican University, G-MAC 2nd and 3rd team All-Conference honoree, Three-time team MVP, Somali National Team player, USSF licensed coach and founder of Kante Elite Training.',
    width: 720,
    height: 864,
  },
  {
    name: 'Coach Tony',
    label: 'Elite Trainer',
    src: 'https://github.com/user-attachments/assets/fc63ec53-589f-4339-b0b4-e25ad6845a6e',
    alt: 'Coach Tony – Summer Training promo card. Former Division 1 player at Wright State University, Semi-Pro at Vagnharads VSK (Sweden) and Pittsburgh Riverhounds, USSF and UEFA licensed coach at Reynoldsburg High School.',
    width: 620,
    height: 713,
  },
]

export default function MeetOurCoaches() {
  return (
    <section className="relative bg-[#050505] py-20 px-4 border-t border-[#1a1a1a] overflow-hidden">
      {/* Background glow — centred, equal weight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,53,15,0.18)_0%,_transparent_65%)] pointer-events-none" />
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label">Elite Coaching Staff</span>
          <h2 className="text-white font-black text-4xl md:text-5xl text-balance">
            Meet Our <span className="gradient-text">Coaches</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto text-base leading-relaxed">
            Elite experience. Real development. Built for players who want to improve.
          </p>
        </div>

        {/* Equal-width 2-column grid. Mobile: stacked (Kante first). */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {coaches.map((coach) => (
            <div
              key={coach.name}
              className="group relative rounded-2xl overflow-hidden bg-[#111] cursor-pointer
                         border border-[#222]
                         transition-all duration-300 ease-out
                         hover:-translate-y-2 hover:border-amber-500/40
                         hover:shadow-[0_16px_48px_rgba(245,158,11,0.18)]"
            >
              {/* Role badge */}
              <div className="absolute top-4 left-4 z-20
                              bg-black/80 backdrop-blur border border-white/10
                              text-gray-200 text-[10px] font-black uppercase tracking-[0.18em]
                              px-3 py-1.5 rounded-full">
                {coach.label}
              </div>

              {/* Aspect ratio wrapper — same ratio for both cards */}
              <div className="relative w-full" style={{ paddingBottom: '117%' }}>
                <img
                  src={coach.src}
                  alt={coach.alt}
                  loading="lazy"
                  decoding="async"
                  width={coach.width}
                  height={coach.height}
                  className="absolute inset-0 w-full h-full object-cover object-center
                             transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                {/* Subtle amber tint on hover */}
                <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/[0.04] transition-colors duration-300" />
                {/* Bottom gradient for legibility */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />
                {/* Name tag */}
                <div className="absolute bottom-5 left-5 z-10">
                  <p className="text-white font-black text-xl tracking-tight leading-none">{coach.name}</p>
                  <p className="text-amber-400 text-xs font-semibold mt-0.5 uppercase tracking-widest">{coach.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            to="/book"
            className="btn-primary text-base px-10 py-4 gap-2"
          >
            Book Training
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Private and small-group sessions available. Book online in minutes.
          </p>
        </div>
      </div>
    </section>
  )
}


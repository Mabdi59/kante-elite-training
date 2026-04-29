import { Link } from 'react-router-dom'

const coaches = [
  {
    name: 'Coach Tony',
    src: 'https://github.com/user-attachments/assets/fc63ec53-589f-4339-b0b4-e25ad6845a6e',
    alt: 'Coach Tony – Summer Training promo card. Former Division 1 player at Wright State University, Semi-Pro at Vagnharads VSK (Sweden) and Pittsburgh Riverhounds, USSF and UEFA licensed coach at Reynoldsburg High School.',
  },
  {
    name: 'Coach Kante',
    src: 'https://github.com/user-attachments/assets/04d4698b-38fc-4576-9d23-f3e0612a7f8e',
    alt: 'Coach Kante – promo card. Former Division 2 player at Ohio Dominican University, G-MAC 2nd and 3rd team All-Conference honoree, Three-time team MVP, Somali National Team player, USSF licensed coach.',
  },
]

export default function MeetOurCoaches() {
  return (
    <section className="relative bg-[#050505] py-20 px-4 border-t border-[#1a1a1a] overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,53,15,0.18)_0%,_transparent_70%)] pointer-events-none" />
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
          <span className="section-label">Elite Staff</span>
          <h2 className="text-white font-black text-4xl md:text-5xl text-balance">
            Meet Our <span className="gradient-text">Coaches</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-lg mx-auto text-base leading-relaxed">
            Elite experience. Proven development. Real results.
          </p>
        </div>

        {/* Coach cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {coaches.map((coach) => (
            <div
              key={coach.name}
              className="group relative rounded-2xl overflow-hidden border border-[#222] bg-[#111] cursor-pointer
                         transition-all duration-300 ease-out
                         hover:-translate-y-2 hover:scale-[1.02] hover:border-amber-500/40
                         hover:shadow-[0_16px_48px_rgba(245,158,11,0.18)]"
            >
              {/* Aspect ratio wrapper to prevent layout shift */}
              <div className="relative w-full" style={{ paddingBottom: '117%' }}>
                <img
                  src={coach.src}
                  alt={coach.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-center
                             transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  width={680}
                  height={795}
                />
                {/* Subtle amber overlay on hover */}
                <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/[0.04] transition-colors duration-300" />
                {/* Bottom gradient for depth */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
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
            Train With Our Coaches
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

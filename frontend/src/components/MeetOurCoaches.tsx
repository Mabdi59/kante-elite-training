import { Link } from 'react-router-dom'

const COACH_CARD_ASPECT = '117%'
const SUMMER_TRAINING_HREF = '/events#summer-training'

const coaches = [
  {
    name: 'Coach Kante',
    label: 'Founder & Elite Trainer',
    src: 'https://github.com/user-attachments/assets/c11a0a39-8a1f-470c-83a1-354b0085e4e4',
    alt: 'Coach Kante promo card. Former Division 2 player at Ohio Dominican University, G-MAC 2nd and 3rd team All-Conference honoree, three-time team MVP, Somali National Team player, USSF licensed coach and founder of Kante Elite Training.',
    width: 720,
    height: 864,
    ctaLabel: 'See Summer Camps',
  },
  {
    name: 'Coach Tony',
    label: 'Elite Trainer',
    src: 'https://github.com/user-attachments/assets/5c4c6725-8476-4a1c-a6f7-72a940c60d0d',
    alt: 'Coach Tony summer training promo card. Former Division 1 player at Wright State University, semi-pro at Vagnharads VSK in Sweden and Pittsburgh Riverhounds, USSF and UEFA licensed coach at Reynoldsburg High School.',
    width: 620,
    height: 713,
    ctaLabel: 'See Summer Camps',
  },
]

export default function MeetOurCoaches() {
  return (
    <section className="relative overflow-hidden border-t border-[#1a1a1a] bg-[#050505] px-4 py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,53,15,0.18)_0%,_transparent_65%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span className="section-label">Elite Coaching Staff</span>
          <h2 className="text-balance text-4xl font-black text-white md:text-5xl">
            Meet Our <span className="gradient-text">Coaches</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-400">
            Elite experience. Real development. Built for players who want to improve.
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
            Coach Kante and Coach Tony work together across our summer training program.{' '}
            <Link to={SUMMER_TRAINING_HREF} className="text-amber-500 hover:underline">
              See all summer camp dates
            </Link>
            .
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {coaches.map((coach) => (
            <div
              key={coach.name}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#222] bg-[#111] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-[0_16px_48px_rgba(245,158,11,0.18)]"
            >
              <div className="absolute left-4 top-4 z-20 rounded-full border border-white/10 bg-black/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-200 backdrop-blur">
                {coach.label}
              </div>

              <div className="relative w-full" style={{ paddingBottom: COACH_CARD_ASPECT }}>
                <img
                  src={coach.src}
                  alt={coach.alt}
                  loading="lazy"
                  decoding="async"
                  width={coach.width}
                  height={coach.height}
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-amber-500/0 transition-colors duration-300 group-hover:bg-amber-500/[0.04]" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />
                <div className="absolute bottom-5 left-5 z-10">
                  <p className="text-xl font-black leading-none tracking-tight text-white">{coach.name}</p>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-amber-400">{coach.label}</p>
                </div>
              </div>

              <div className="border-t border-[#222] bg-[#0d0d0d] px-5 py-4">
                <Link to={SUMMER_TRAINING_HREF} className="btn-primary w-full py-2.5 text-center text-sm">
                  {coach.ctaLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/book" className="btn-primary gap-2 px-10 py-4 text-base">
            Book Training
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
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

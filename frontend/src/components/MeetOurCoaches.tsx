import { Link } from 'react-router-dom'

export default function MeetOurCoaches() {
  return (
    <section className="relative bg-[#050505] py-20 px-4 border-t border-[#1a1a1a] overflow-hidden">
      {/* Background glow — weighted toward Kante's side (left on desktop) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_rgba(120,53,15,0.22)_0%,_transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.04)_0%,_transparent_55%)] pointer-events-none" />
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
            Train With <span className="gradient-text">Elite Coaches</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto text-base leading-relaxed">
            Led by Coach Kante and supported by experienced high-level staff.
          </p>
        </div>

        {/*
          Asymmetric desktop layout:
          - Left column (wider): Coach Kante — featured, taller card, amber accent, Head Coach badge
          - Right column (narrower): Coach Tony — supporting, shorter card, Elite Staff badge
          Mobile: stacked, Kante first
        */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5 lg:gap-6 max-w-5xl mx-auto lg:items-start">

          {/* ── COACH KANTE — Featured primary card ── */}
          <div className="group relative rounded-2xl overflow-hidden bg-[#111] cursor-pointer
                          border border-amber-500/30
                          shadow-[0_0_32px_rgba(245,158,11,0.10)]
                          transition-all duration-300 ease-out
                          hover:-translate-y-2 hover:border-amber-500/60
                          hover:shadow-[0_20px_56px_rgba(245,158,11,0.22)]">
            {/* Persistent amber top accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 z-10" />

            {/* Featured badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2
                            bg-black/80 backdrop-blur border border-amber-500/40
                            text-amber-400 text-[10px] font-black uppercase tracking-[0.18em]
                            px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              Head Coach & Founder
            </div>

            {/* Aspect ratio wrapper — taller on desktop to reinforce hierarchy */}
            <div className="relative w-full" style={{ paddingBottom: '120%' }}>
              <img
                src="https://github.com/user-attachments/assets/04d4698b-38fc-4576-9d23-f3e0612a7f8e"
                alt="Coach Kante – promo card. Former Division 2 player at Ohio Dominican University, G-MAC 2nd and 3rd team All-Conference honoree, Three-time team MVP, Somali National Team player, USSF licensed coach and founder of Kante Elite Training."
                loading="lazy"
                decoding="async"
                width={720}
                height={864}
                className="absolute inset-0 w-full h-full object-cover object-center
                           transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
              {/* Amber shimmer overlay on hover */}
              <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/[0.05] transition-colors duration-300" />
              {/* Bottom gradient for depth */}
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
              {/* Name tag at bottom */}
              <div className="absolute bottom-5 left-5 z-10">
                <p className="text-white font-black text-xl tracking-tight leading-none">Coach Kante</p>
                <p className="text-amber-400 text-xs font-semibold mt-0.5 uppercase tracking-widest">Kante Elite Training</p>
              </div>
            </div>
          </div>

          {/* ── COACH TONY — Supporting secondary card ── */}
          <div className="group relative rounded-2xl overflow-hidden bg-[#111] cursor-pointer
                          border border-[#252525]
                          transition-all duration-300 ease-out
                          hover:-translate-y-2 hover:border-amber-500/30
                          hover:shadow-[0_16px_40px_rgba(245,158,11,0.13)]
                          lg:mt-10">
            {/* Supporting badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2
                            bg-black/75 backdrop-blur border border-white/10
                            text-gray-300 text-[10px] font-black uppercase tracking-[0.18em]
                            px-3 py-1.5 rounded-full">
              Elite Staff
            </div>

            {/* Aspect ratio wrapper — slightly shorter to emphasise Kante */}
            <div className="relative w-full" style={{ paddingBottom: '115%' }}>
              <img
                src="https://github.com/user-attachments/assets/fc63ec53-589f-4339-b0b4-e25ad6845a6e"
                alt="Coach Tony – Summer Training promo card. Former Division 1 player at Wright State University, Semi-Pro at Vagnharads VSK (Sweden) and Pittsburgh Riverhounds, USSF and UEFA licensed coach at Reynoldsburg High School."
                loading="lazy"
                decoding="async"
                width={620}
                height={713}
                className="absolute inset-0 w-full h-full object-cover object-center
                           transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/[0.04] transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />
              {/* Name tag at bottom */}
              <div className="absolute bottom-5 left-5 z-10">
                <p className="text-white font-bold text-lg tracking-tight leading-none">Coach Tony</p>
                <p className="text-gray-400 text-xs font-medium mt-0.5 uppercase tracking-widest">Elite Staff</p>
              </div>
            </div>
          </div>
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

import { Link } from 'react-router-dom'

const footerLinks = [
  { href: '/training', label: 'Programs' },
  { href: '/events', label: 'Events' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/results', label: 'Results' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/book', label: 'Book a Session' },
]

const accountLinks = [
  { href: '/login', label: 'Sign In' },
  { href: '/register', label: 'Create Account' },
]

export default function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a] pb-[calc(env(safe-area-inset-bottom)+6.75rem)] md:pb-0">
      {/* CTA Banner */}
      <div className="relative overflow-hidden border-b border-[#1a1a1a] bg-black px-4 py-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,53,15,0.25)_0%,_transparent_65%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="relative max-w-xl mx-auto">
          <p className="section-label">Ready to Start?</p>
          <h2 className="mb-6 text-2xl font-black text-white md:text-3xl">
            How fast can your child improve?{' '}
            <span className="gradient-text">Find out.</span>
          </h2>
          <div className="mx-auto flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
            <Link to="/book" className="btn-primary w-full sm:w-auto">
              Book a Session
            </Link>
            <Link to="/training" className="btn-secondary w-full sm:w-auto">
              View Programs
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="page-shell grid grid-cols-1 gap-10 px-4 py-12 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="text-2xl">⚽</span>
            <div>
              <span className="text-white font-black text-lg leading-none block">KANTE ELITE</span>
              <span className="text-amber-500 text-[10px] tracking-widest uppercase leading-none font-semibold">
                Training
              </span>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            Columbus youth soccer training for players ages 8 to 18. Private and small group sessions with a focus on real improvement.
          </p>
          <a
            href="https://www.instagram.com/kanteelitetraining_/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5 text-gray-300 hover:text-amber-400 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            @kanteelitetraining_
          </a>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Explore</h4>
          <ul className="space-y-2.5">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="text-gray-400 hover:text-amber-400 text-sm transition-colors duration-150"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Account</h4>
          <ul className="space-y-2.5">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="text-gray-400 hover:text-amber-400 text-sm transition-colors duration-150"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Contact</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <span className="text-gray-400 text-sm leading-relaxed pt-1">Columbus, Ohio</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <a
                href="mailto:kanteelitetraining@gmail.com"
                className="text-gray-400 hover:text-amber-400 transition-colors text-sm leading-relaxed pt-1 break-all"
              >
                kanteelitetraining@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6Z" />
                </svg>
              </div>
              <a href="tel:+16142852317" className="text-gray-400 hover:text-amber-400 transition-colors text-sm pt-1">
                (614) 285-2317
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1a1a1a] py-5 px-4 flex flex-col gap-2 items-center sm:flex-row sm:justify-between">
        <p className="text-gray-600 text-xs">
          &copy; {new Date().getFullYear()} Kante Elite Training. All rights reserved.
        </p>
        <p className="text-gray-700 text-xs">Columbus, Ohio</p>
      </div>
    </footer>
  )
}

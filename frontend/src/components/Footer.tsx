import { Link } from 'react-router-dom'

const footerLinks = [
  { href: '/training', label: 'Programs' },
  { href: '/events', label: 'Events' },
  { href: '/results', label: 'Results' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/book', label: 'Book a Session' },
]

export default function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a] pb-[calc(env(safe-area-inset-bottom)+6.75rem)] md:pb-0">
      <div className="border-b border-[#1a1a1a] bg-black px-4 py-10 text-center">
        <p className="section-label">Ready to Start?</p>
        <h2 className="mb-6 text-2xl font-black text-white md:text-3xl">
          How fast can your child improve? <span className="text-amber-500">Find out.</span>
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

      <div className="page-shell grid grid-cols-1 gap-10 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <div>
              <span className="text-white font-black text-lg leading-none block">KANTE ELITE</span>
              <span className="text-amber-500 text-[10px] tracking-widest uppercase leading-none font-semibold">
                Training
              </span>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Columbus youth soccer training for players ages 8 to 18. Private and small group sessions with a focus on real improvement.
          </p>
          <a
            href="https://www.instagram.com/kanteelitetraining_/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-gray-400 hover:text-amber-400 text-sm transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            @kanteelitetraining_
          </a>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Quick Links</h4>
          <ul className="space-y-2">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="text-gray-400 hover:text-amber-400 text-sm transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Contact</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">📍</span>
              <span>Columbus, Ohio</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">📧</span>
              <a
                href="mailto:kanteelitetraining@gmail.com"
                className="hover:text-amber-400 transition-colors"
              >
                kanteelitetraining@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">📱</span>
              <a href="tel:+16142852317" className="hover:text-amber-400 transition-colors">
                (614) 285-2317
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#1a1a1a] py-5 px-4 text-center">
        <p className="text-gray-600 text-xs">
          Copyright {new Date().getFullYear()} Kante Elite Training. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

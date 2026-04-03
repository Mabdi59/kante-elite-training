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
    <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a] pb-24 md:pb-0">
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
            Columbus's trusted youth soccer training academy. Developing skilled players and strong people, one session at a time.
          </p>
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
                href="mailto:info@kanteelitetraining.com"
                className="hover:text-amber-400 transition-colors"
              >
                info@kanteelitetraining.com
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">📱</span>
              <a href="tel:+16145550100" className="hover:text-amber-400 transition-colors">
                (614) 555-0100
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

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
    <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a]">
      <div className="bg-black border-b border-[#1a1a1a] py-10 px-4 text-center">
        <p className="section-label">Ready to Start?</p>
        <h2 className="text-white font-black text-2xl md:text-3xl mb-6">
          How fast can your child improve? <span className="text-amber-500">Find out.</span>
        </h2>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/book" className="btn-primary">
            Book a Session
          </Link>
          <Link to="/training" className="btn-secondary">
            View Programs
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
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
          <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Quick Links</h4>
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
          <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Contact</h4>
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

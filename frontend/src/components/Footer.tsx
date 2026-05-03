import { Link } from 'react-router-dom'
import BrandMark from './BrandMark'

const footerLinks = [
  { href: '/training', label: 'Programs' },
  { href: '/events', label: 'Events' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/results', label: 'Results' },
  { href: '/faq', label: 'FAQ' },
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
      <div className="relative overflow-hidden border-b border-[#1a1a1a] bg-black px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(245,158,11,0.12)_0%,_transparent_48%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(120,53,15,0.18)_0%,_transparent_52%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="page-shell relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-label">Ready When You Are</p>
            <h2 className="mb-3 text-2xl font-black text-white md:text-3xl">
              Book online, get confirmation right away, and start with a clear next step.
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-gray-400 sm:text-base">
              Questions before you book? Call, email, or send a message. The direct booking flow is live whenever you are ready.
            </p>
          </div>

          <div className="button-stack-mobile lg:justify-end">
            <Link to="/book" className="btn-primary w-full sm:w-auto">
              Book a Session
            </Link>
            <Link to="/contact" className="btn-secondary w-full sm:w-auto">
              Ask a Question
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="page-shell grid grid-cols-1 gap-10 py-12 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="mb-4 flex items-center gap-3">
            <BrandMark size="footer" showText />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            Columbus-based soccer training for players who want focused coaching, clear feedback, and a real plan for improvement.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="tel:+16142852317"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-400"
            >
              Call
            </a>
            <a
              href="mailto:kanteelitetraining@gmail.com"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-400"
            >
              Email
            </a>
            <a
              href="https://www.instagram.com/kanteelitetraining_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-400"
            >
              Instagram
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase text-white">Explore</h4>
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
          <h4 className="mb-4 text-xs font-bold uppercase text-white">Account</h4>
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
          <h4 className="mb-4 text-xs font-bold uppercase text-white">Contact</h4>
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
      <div className="border-t border-[#1a1a1a] py-5">
        <div className="page-shell">
          <div className="mb-3 flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start">
            <Link to="/privacy" className="text-xs text-gray-600 transition-colors hover:text-gray-400">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-gray-600 transition-colors hover:text-gray-400">Terms of Service</Link>
            <Link to="/cancellation-policy" className="text-xs text-gray-600 transition-colors hover:text-gray-400">Cancellation Policy</Link>
            <Link to="/cookie-policy" className="text-xs text-gray-600 transition-colors hover:text-gray-400">Cookie Policy</Link>
            <Link to="/accessibility" className="text-xs text-gray-600 transition-colors hover:text-gray-400">Accessibility</Link>
          </div>
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-between">
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} Kante Elite Training. All rights reserved.
            </p>
            <p className="text-xs text-gray-700">Columbus, Ohio</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import { getPortalDestination } from '../utils/portal'

const navLinks = [
  { href: '/training', label: 'Programs' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/events', label: 'Events' },
  { href: '/media', label: 'Media' },
  { href: '/results', label: 'Results' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated, isAdmin, logoutUser } = useAuth()
  const portal = getPortalDestination(user?.role)
  const portalPath = portal?.path ?? '/account'
  const portalLabel = portal?.navLabel ?? user?.name?.split(' ')[0] ?? 'Account'
  const currentLabel =
    location.pathname === '/'
      ? ''
      : navLinks.find((link) => location.pathname === link.href || location.pathname.startsWith(`${link.href}/`))?.label ??
        'Kante Elite'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-[#222] bg-black/95 backdrop-blur-sm transition-all duration-300 ${
        scrolled ? '' : 'lg:border-transparent lg:bg-transparent lg:backdrop-blur-0'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:h-20">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img
            src="/images/464169962_1489362111765457_2497551385302895846_n.jpg"
            alt="Kante Elite Training logo"
            loading="eager"
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-amber-500"
          />
          <div>
            <span className="block text-sm font-black leading-none tracking-tight text-white sm:text-base md:text-lg">
              KANTE ELITE
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
              Training
            </span>
            <span className={`mt-1 block text-[11px] font-medium text-gray-500 lg:hidden ${currentLabel ? '' : 'hidden'}`}>
              {currentLabel}
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-6 lg:flex xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${
                location.pathname === link.href
                  ? 'text-amber-500'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <Link to={portalPath} className="text-sm font-semibold text-gray-300 hover:text-white">
                {portalLabel}
              </Link>
              {isAdmin ? (
                <Link to="/admin" className="text-sm font-semibold text-amber-500 hover:text-amber-400">
                  Admin
                </Link>
              ) : null}
              <NotificationBell />
              <button
                type="button"
                onClick={logoutUser}
                className="text-sm font-semibold text-gray-500 transition-colors hover:text-gray-300"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white">
              Login
            </Link>
          )}
          <Link to="/book" className="btn-primary px-6 py-2.5 text-sm">
            Book Now
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>
      </nav>

      {menuOpen ? createPortal((
        <div
          className="fixed inset-0 z-[1000] isolate h-[100dvh] w-screen overflow-y-auto bg-black lg:hidden animate-fade-in"
          style={{ backgroundColor: '#050505', backdropFilter: 'blur(12px)' }}
        >
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.08),_transparent_28%)]" />
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0"
          />

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="fixed right-5 z-10 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white backdrop-blur sm:right-6"
            style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m6 6 12 12" />
              <path d="m18 6-12 12" />
            </svg>
          </button>

          <div className="relative z-10 flex min-h-[100dvh] flex-col overflow-y-auto bg-[#050505] px-5 pb-8 pt-[calc(env(safe-area-inset-top)+1.25rem)] sm:px-6 animate-slide-in-right">
            <div className="mb-8 flex items-start justify-between gap-4 pr-16">
              <div className="max-w-[16rem]">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-500">Menu</p>
                <p className="mt-3 text-2xl font-black leading-tight text-white">Explore Kante Elite</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  Training, tournaments, media, and your account, all in one place.
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`rounded-2xl border px-4 py-4 text-base font-semibold transition-all duration-200 ${
                    location.pathname === link.href
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                      : 'border-white/10 bg-white/[0.03] text-white hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6">
              {isAuthenticated ? (
                <>
                  <Link
                    to={portalPath}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-base font-semibold text-white"
                  >
                    {portalLabel}
                  </Link>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-base font-semibold text-amber-400"
                    >
                      Admin Panel
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={logoutUser}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left text-base font-semibold text-red-400"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-base font-semibold text-white"
                >
                  Login
                </Link>
              )}
              <Link to="/book" className="btn-primary w-full justify-center text-center">
                Book a Session
              </Link>
            </div>
          </div>
        </div>
      ), document.body) : null}
    </header>
  )
}

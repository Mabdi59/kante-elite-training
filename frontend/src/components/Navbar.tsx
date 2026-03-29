import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { href: '/training', label: 'Programs' },
  { href: '/events', label: 'Events' },
  { href: '/results', label: 'Results' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated, isAdmin, isCoach, logoutUser } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur-sm border-b border-[#222]' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">⚽</span>
          <div>
            <span className="text-white font-black text-base md:text-lg tracking-tight leading-none block">
              KANTE ELITE
            </span>
            <span className="text-amber-500 text-[10px] tracking-widest uppercase leading-none font-semibold">
              Training
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
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

        {/* CTA + auth */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="text-sm text-green-400 hover:text-green-300 font-semibold">
                  Admin
                </Link>
              )}
              {isCoach && !isAdmin && (
                <Link to="/coach" className="text-sm text-blue-400 hover:text-blue-300 font-semibold">
                  Coach
                </Link>
              )}
              <Link to="/account" className="text-sm text-gray-300 hover:text-white font-semibold">
                {user?.name?.split(' ')[0]}
              </Link>
              <button
                onClick={logoutUser}
                className="text-sm text-gray-500 hover:text-gray-300 font-semibold transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm text-gray-300 hover:text-white font-semibold">
              Login
            </Link>
          )}
          <Link to="/book" className="btn-primary text-sm px-6 py-2.5">
            Book Now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2 -mr-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span
              className={`block h-0.5 bg-white transition-all duration-300 ${
                menuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block h-0.5 bg-white transition-all duration-300 ${
                menuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 bg-white transition-all duration-300 ${
                menuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black/98 border-t border-[#222] px-4 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-lg font-bold transition-colors ${
                location.pathname === link.href ? 'text-amber-500' : 'text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/account" className="text-lg font-bold text-white">
                My Account
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-lg font-bold text-green-400">
                  Admin Panel
                </Link>
              )}
              {isCoach && !isAdmin && (
                <Link to="/coach" className="text-lg font-bold text-blue-400">
                  Coach Panel
                </Link>
              )}
              <button
                onClick={logoutUser}
                className="text-left text-lg font-bold text-red-400"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="text-lg font-bold text-gray-300">
              Login
            </Link>
          )}
          <Link to="/book" className="btn-primary text-center mt-2">
            Book a Session
          </Link>
        </div>
      )}
    </header>
  )
}

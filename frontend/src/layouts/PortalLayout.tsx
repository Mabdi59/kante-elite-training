import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from '../components/NotificationBell'

export interface PortalNavItem {
  path: string
  label: string
  icon: ReactNode
}

export interface PortalNavSection {
  title?: string
  items: PortalNavItem[]
}

interface PortalLayoutProps {
  children: ReactNode
  /** Brand colour class, e.g. "text-green-400" */
  accentClass: string
  /** Hover / active bg, e.g. "bg-green-500/10" */
  activeBgClass: string
  portalLabel: string
  navSections: PortalNavSection[]
  /** Root path used for exact-match active check, e.g. "/coach" */
  rootPath: string
}

export default function PortalLayout({
  children,
  accentClass,
  activeBgClass,
  portalLabel,
  navSections,
  rootPath,
}: PortalLayoutProps) {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [mobileNavOpen])

  const handleLogout = () => {
    setMobileNavOpen(false)
    logoutUser()
    navigate('/')
  }

  const isActive = (path: string) =>
    path === rootPath
      ? location.pathname === rootPath
      : location.pathname.startsWith(path)

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-[#1a1a1a] flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5 min-w-0" onClick={() => setMobileNavOpen(false)}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-black">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-.53 14.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V8.25a.75.75 0 0 0-1.5 0v5.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3Z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <span className="text-white font-black text-sm leading-none block">KANTE ELITE</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest leading-none ${accentClass}`}>{portalLabel}</span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileNavOpen(false)}
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m6 6 12 12" /><path d="m18 6-12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-4" aria-label="Portal navigation">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <p className="px-3 mb-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileNavOpen(false)}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    isActive(item.path)
                      ? `${activeBgClass} ${accentClass} font-semibold`
                      : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  <span className="flex h-4 w-4 items-center justify-center shrink-0 opacity-80">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="h-8 w-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <span className={`text-xs font-black ${accentClass}`}>
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 text-sm">
            <p className="text-white font-semibold truncate">{user?.name}</p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-left text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-lg hover:bg-[#1a1a1a] flex items-center gap-2"
        >
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#0d0d0d] lg:flex">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-[#1a1a1a] bg-[#0d0d0d] px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <Link to="/" className="block text-lg font-black text-white leading-none">Kante Elite</Link>
          <p className={`mt-0.5 text-[11px] font-bold uppercase tracking-widest ${accentClass}`}>
            {portalLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#111] text-white hover:bg-[#1a1a1a] transition-colors"
            aria-label="Open portal menu"
            aria-expanded={mobileNavOpen}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close portal menu"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] max-w-[86vw] flex-col border-r border-[#1a1a1a] bg-[#0d0d0d] transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="hidden border-b border-[#1a1a1a] bg-[#0d0d0d]/95 px-6 py-3 lg:flex lg:items-center lg:justify-end backdrop-blur-sm">
          <NotificationBell />
        </div>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}

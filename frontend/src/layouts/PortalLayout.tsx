import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      <div className="p-5 border-b border-gray-800 flex items-center justify-between gap-3">
        <div>
          <Link to="/" className="text-xl font-black text-white leading-none block" onClick={() => setMobileNavOpen(false)}>
            Kante Elite
          </Link>
          <p className={`text-xs mt-1 font-semibold uppercase tracking-widest ${accentClass}`}>
            {portalLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(false)}
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-gray-400 hover:text-white"
          aria-label="Close menu"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m6 6 12 12" /><path d="m18 6-12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <p className="px-3 mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive(item.path)
                      ? `${activeBgClass} ${accentClass} font-medium`
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="flex h-4 w-4 items-center justify-center shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="text-sm text-gray-400 mb-3">
          <span className="text-white font-medium">{user?.name}</span>
          <br />
          <span className={`text-xs ${accentClass}`}>{user?.email}</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-left text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
        >
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-950 lg:flex">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-gray-800 bg-gray-950 px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <Link to="/" className="block text-lg font-black text-white leading-none">Kante Elite</Link>
          <p className={`mt-0.5 text-[11px] font-semibold uppercase tracking-widest ${accentClass}`}>
            {portalLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-white"
          aria-label="Open portal menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" />
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close portal menu"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] max-w-[86vw] flex-col border-r border-gray-800 bg-gray-900 transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}

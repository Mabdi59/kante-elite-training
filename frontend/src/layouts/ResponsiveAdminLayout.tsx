import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AdminSidebarNav from '../components/AdminSidebarNav'
import AdminQuickActionFab from '../components/AdminQuickActionFab'
import { useAuth } from '../context/AuthContext'

export default function ResponsiveAdminLayout({ children }: { children: ReactNode }) {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    setMobileNavOpen(false)
    logoutUser()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-950 lg:flex">
      <div className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-gray-800 bg-gray-950 px-4 py-4 lg:hidden">
        <div className="min-w-0">
          <Link to="/" className="block text-lg font-black text-white">
            KANTE ELITE
          </Link>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-green-400">
            Admin Panel
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-white"
          aria-label="Open admin menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>
      </div>

      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close admin menu overlay"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[18.5rem] max-w-[86vw] flex-col border-r border-gray-800 bg-gray-900 transition-transform duration-300 lg:static lg:z-auto lg:w-72 lg:max-w-none ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-800 p-5 lg:p-6">
          <div className="min-w-0">
            <Link to="/" className="block text-lg font-black text-white lg:text-xl">
              KANTE ELITE
            </Link>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-green-400">
              Admin Panel
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-800 bg-gray-950 text-gray-300 lg:hidden"
            aria-label="Close admin menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m6 6 12 12" />
              <path d="m18 6-12 12" />
            </svg>
          </button>
        </div>

        <AdminSidebarNav pathname={location.pathname} />

        <div className="border-t border-gray-800 p-4">
          <div className="mb-3 text-sm text-gray-400">
            <span className="font-medium text-white">{user?.name}</span>
            <br />
            <span className="text-xs text-green-400">{user?.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-3 text-left text-sm text-red-400 transition-colors hover:bg-gray-800 hover:text-red-300"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="panel-shell">{children}</div>
      </main>

      <AdminQuickActionFab />
    </div>
  )
}

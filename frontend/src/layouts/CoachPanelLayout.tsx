import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/coach', label: 'Dashboard', icon: 'D' },
  { path: '/coach/sessions', label: 'My Sessions', icon: 'S' },
  { path: '/coach/availability', label: 'My Availability', icon: 'A' },
  { path: '/coach/profile', label: 'My Profile', icon: 'P' },
]

export default function CoachPanelLayout({ children }: { children: ReactNode }) {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="text-xl font-black text-white">
            Kante Elite
          </Link>
          <p className="text-blue-400 text-xs mt-1 font-semibold uppercase tracking-widest">
            Coach Panel
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.path === '/coach'
                ? location.pathname === '/coach'
                : location.pathname.startsWith(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="w-5 text-center font-semibold">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 mb-3">
            <span className="text-white font-medium">{user?.name}</span>
            <br />
            <span className="text-blue-400 text-xs">{user?.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}

import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface NavItem { path: string; label: string; icon: string }
interface NavSection { title: string; items: NavItem[] }

const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { path: '/parent', label: 'Dashboard', icon: 'D' },
      { path: '/parent/bookings', label: 'Bookings', icon: 'B' },
      { path: '/parent/payments', label: 'Payments', icon: '$' },
    ],
  },
  {
    title: 'My Players',
    items: [
      { path: '/parent/players', label: 'Players', icon: 'P' },
      { path: '/parent/development', label: 'Development', icon: '↑' },
      { path: '/parent/enrollments', label: 'Enrollments', icon: 'E' },
    ],
  },
  {
    title: 'More',
    items: [
      { path: '/parent/messages', label: 'Messages', icon: '✉' },
      { path: '/parent/calendar', label: 'Calendar', icon: '◻' },
      { path: '/parent/waivers', label: 'Waivers & Docs', icon: 'W' },
    ],
  },
]

export default function ParentLayout({ children }: { children: ReactNode }) {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  const isActive = (path: string) =>
    path === '/parent'
      ? location.pathname === '/parent'
      : location.pathname.startsWith(path)

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <Link to="/" className="text-xl font-black text-white">
            Kante Elite
          </Link>
          <p className="text-green-400 text-xs mt-1 font-semibold uppercase tracking-widest">
            Parent Portal
          </p>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto space-y-4">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive(item.path)
                        ? 'bg-green-500/10 text-green-400 font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <span className="w-5 text-center font-semibold shrink-0">{item.icon}</span>
                    {item.label}
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
            <span className="text-green-400 text-xs">{user?.email}</span>
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

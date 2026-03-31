import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminSidebarNav from '../components/AdminSidebarNav'
import type { ReactNode } from 'react'

export const navSections = [
  { path: '/admin/content', label: 'Content', icon: 'WE' },
  { path: '/admin/media', label: 'Media', icon: 'MD' },
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/bookings', label: 'Bookings', icon: '📅' },
  { path: '/admin/programs', label: 'Programs', icon: '⚽' },
  { path: '/admin/events', label: 'Events', icon: '🏆' },
  { path: '/admin/tournaments', label: 'Tournaments', icon: '🥇' },
  { path: '/admin/coaches', label: 'Coaches', icon: '🎽' },
  { path: '/admin/players', label: 'Players', icon: '👦' },
  { path: '/admin/availability', label: 'Availability', icon: '🗓️' },
  { path: '/admin/testimonials', label: 'Testimonials', icon: '💬' },
  { path: '/admin/messages', label: 'Messages', icon: '✉️' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="text-xl font-black text-white">
            KANTE ELITE
          </Link>
          <p className="text-green-400 text-xs mt-1 font-semibold uppercase tracking-widest">
            Admin Panel
          </p>
        </div>

        <AdminSidebarNav pathname={location.pathname} />

        <div className="p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 mb-3">
            <span className="text-white font-medium">{user?.name}</span>
            <br />
            <span className="text-green-400 text-xs">{user?.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}

import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type NavItem = {
  path: string
  label: string
  icon: ReactNode
}

function isItemActive(pathname: string, path: string) {
  return path === '/admin' ? pathname === '/admin' : pathname.startsWith(path)
}

const navItems: NavItem[] = [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 13h6V4H4v9Z" />
        <path d="M14 20h6v-6h-6v6Z" />
        <path d="M14 10h6V4h-6v6Z" />
        <path d="M4 20h6v-3H4v3Z" />
      </svg>
    ),
  },
  {
    path: '/admin/bookings',
    label: 'Bookings',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    path: '/admin/availability',
    label: 'Availability',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 14h8" />
      </svg>
    ),
  },
  {
    path: '/admin/programs',
    label: 'Programs',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v18" />
        <path d="m5 7 7-4 7 4" />
        <path d="m5 17 7 4 7-4" />
      </svg>
    ),
  },
  {
    path: '/admin/events',
    label: 'Events',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
        <path d="m10 14 2 2 4-4" />
      </svg>
    ),
  },
  {
    path: '/admin/tournaments',
    label: 'Tournaments',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
        <path d="M17 6h2a2 2 0 0 1 0 4h-2" />
        <path d="M7 6H5a2 2 0 0 0 0 4h2" />
      </svg>
    ),
  },
  {
    path: '/admin/content',
    label: 'Content',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22V4.5A2.5 2.5 0 0 1 6.5 2Z" />
        <path d="M8 7h8" />
        <path d="M8 11h8" />
      </svg>
    ),
  },
  {
    path: '/admin/media',
    label: 'Media',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="m21 15-4.5-4.5L7 20" />
      </svg>
    ),
  },
  {
    path: '/admin/testimonials',
    label: 'Testimonials',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 8H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2l2-4V8Z" />
        <path d="M20 8h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2l2-4V8Z" />
      </svg>
    ),
  },
  {
    path: '/admin/messages',
    label: 'Messages',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
      </svg>
    ),
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3" />
        <path d="M4 20a5 5 0 0 1 10 0" />
        <circle cx="17" cy="8" r="2.5" />
        <path d="M15 20a5 5 0 0 1 5-4.58" />
      </svg>
    ),
  },
  {
    path: '/admin/payments',
    label: 'Payments',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
      </svg>
    ),
  },
  {
    path: '/admin/waivers',
    label: 'Waivers',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
        <path d="M14 2v6h6" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    ),
  },
  {
    path: '/admin/progress-notes',
    label: 'Progress Notes',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
      </svg>
    ),
  },
  {
    path: '/admin/attendance',
    label: 'Attendance',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    path: '/admin/players',
    label: 'Players',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
      </svg>
    ),
  },
]

export default function AdminSidebarNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex-1 overflow-y-auto p-4">
      <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
        Launch Operations
      </p>

      <div className="space-y-2">
        {navItems.map((item) => {
          const isActive = isItemActive(pathname, item.path)

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-amber-500/10 font-medium text-amber-500'
                  : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
              }`}
            >
              <span className="flex h-4 w-4 items-center justify-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

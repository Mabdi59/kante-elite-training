import type { ReactNode } from 'react'
import PortalLayout, { type PortalNavSection } from './PortalLayout'

const navSections: PortalNavSection[] = [
  {
    items: [
      { path: '/staff', label: 'Dashboard', icon: '📊' },
      { path: '/staff/bookings', label: 'Bookings', icon: '📅' },
      { path: '/staff/messages', label: 'Messages', icon: '✉' },
      { path: '/staff/calendar', label: 'Calendar', icon: '🗓' },
      { path: '/staff/attendance', label: 'Attendance', icon: '✓' },
      { path: '/staff/enrollments', label: 'Enrollments', icon: '📋' },
      { path: '/staff/waivers', label: 'Waivers & Docs', icon: '📄' },
      { path: '/staff/availability', label: 'Availability', icon: '🗓' },
      { path: '/staff/tournaments', label: 'Tournaments', icon: '🏆' },
      { path: '/staff/players', label: 'Players', icon: '👦' },
    ],
  },
]

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <PortalLayout
      accentClass="text-amber-400"
      activeBgClass="bg-amber-500/10"
      portalLabel="Staff Panel"
      navSections={navSections}
      rootPath="/staff"
    >
      {children}
    </PortalLayout>
  )
}

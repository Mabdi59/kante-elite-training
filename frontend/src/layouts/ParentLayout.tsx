import type { ReactNode } from 'react'
import PortalLayout, { type PortalNavSection } from './PortalLayout'

const navSections: PortalNavSection[] = [
  {
    title: 'Main',
    items: [
      { path: '/parent', label: 'Dashboard', icon: '📊' },
      { path: '/parent/bookings', label: 'Bookings', icon: '📅' },
      { path: '/parent/payments', label: 'Payments', icon: '💳' },
    ],
  },
  {
    title: 'My Players',
    items: [
      { path: '/parent/players', label: 'Players', icon: '👦' },
      { path: '/parent/development', label: 'Development', icon: '📈' },
      { path: '/parent/enrollments', label: 'Enrollments', icon: '📋' },
    ],
  },
  {
    title: 'More',
    items: [
      { path: '/parent/messages', label: 'Messages', icon: '✉' },
      { path: '/parent/calendar', label: 'Calendar', icon: '🗓' },
      { path: '/parent/waivers', label: 'Waivers & Docs', icon: '📄' },
    ],
  },
]

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <PortalLayout
      accentClass="text-green-400"
      activeBgClass="bg-green-500/10"
      portalLabel="Parent Portal"
      navSections={navSections}
      rootPath="/parent"
    >
      {children}
    </PortalLayout>
  )
}

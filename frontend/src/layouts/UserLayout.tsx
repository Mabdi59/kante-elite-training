import type { ReactNode } from 'react'
import PortalLayout, { type PortalNavSection } from './PortalLayout'

const navSections: PortalNavSection[] = [
  {
    title: 'Main',
    items: [
      { path: '/user', label: 'Dashboard', icon: '📊' },
      { path: '/user/bookings', label: 'Bookings', icon: '📅' },
      { path: '/user/payments', label: 'Payments', icon: '💳' },
    ],
  },
  {
    title: 'Players',
    items: [
      { path: '/user/players', label: 'Players', icon: '👦' },
      { path: '/user/enrollments', label: 'Enrollments', icon: '📋' },
    ],
  },
  {
    title: 'More',
    items: [
      { path: '/user/messages', label: 'Messages', icon: '✉' },
      { path: '/user/calendar', label: 'Calendar', icon: '🗓' },
      { path: '/user/waivers', label: 'Waivers & Docs', icon: '📄' },
    ],
  },
]

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <PortalLayout
      accentClass="text-teal-400"
      activeBgClass="bg-teal-500/10"
      portalLabel="Account Portal"
      navSections={navSections}
      rootPath="/user"
    >
      {children}
    </PortalLayout>
  )
}

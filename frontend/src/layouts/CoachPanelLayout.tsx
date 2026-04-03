import type { ReactNode } from 'react'
import PortalLayout, { type PortalNavSection } from './PortalLayout'

const navSections: PortalNavSection[] = [
  {
    items: [
      { path: '/coach', label: 'Dashboard', icon: '📊' },
    ],
  },
  {
    title: 'Sessions',
    items: [
      { path: '/coach/sessions', label: 'My Sessions', icon: '📅' },
      { path: '/coach/attendance', label: 'Attendance', icon: '✓' },
      { path: '/coach/notes', label: 'Progress Notes', icon: '📝' },
    ],
  },
  {
    title: 'Profile',
    items: [
      { path: '/coach/availability', label: 'Availability', icon: '🗓' },
      { path: '/coach/profile', label: 'My Profile', icon: '👤' },
    ],
  },
]

export default function CoachPanelLayout({ children }: { children: ReactNode }) {
  return (
    <PortalLayout
      accentClass="text-blue-400"
      activeBgClass="bg-blue-500/10"
      portalLabel="Coach Panel"
      navSections={navSections}
      rootPath="/coach"
    >
      {children}
    </PortalLayout>
  )
}

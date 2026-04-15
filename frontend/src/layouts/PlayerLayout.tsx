import type { ReactNode } from 'react'
import PortalLayout, { type PortalNavSection } from './PortalLayout'

const navSections: PortalNavSection[] = [
  {
    items: [
      { path: '/player', label: 'Dashboard', icon: '📊' },
      { path: '/player/sessions', label: 'Sessions', icon: '📅' },
      { path: '/player/development', label: 'Development', icon: '📈' },
      { path: '/player/calendar', label: 'Calendar', icon: '🗓' },
      { path: '/player/payments', label: 'Payments', icon: '💳' },
      { path: '/player/messages', label: 'Messages', icon: '✉' },
      { path: '/player/waivers', label: 'Waivers & Docs', icon: '📄' },
      { path: '/player/profile', label: 'Profile', icon: '👤' },
    ],
  },
]

export default function PlayerLayout({ children }: { children: ReactNode }) {
  return (
    <PortalLayout
      accentClass="text-cyan-400"
      activeBgClass="bg-cyan-500/10"
      portalLabel="Player Portal"
      navSections={navSections}
      rootPath="/player"
    >
      {children}
    </PortalLayout>
  )
}

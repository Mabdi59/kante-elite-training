import type { ReactNode } from 'react'
import PortalLayout, { type PortalNavSection } from './PortalLayout'

const navSections: PortalNavSection[] = [
  {
    items: [
      { path: '/captain', label: 'Dashboard', icon: '📊' },
      { path: '/captain/tournaments', label: 'Tournaments', icon: '🏆' },
      { path: '/captain/registrations', label: 'Registrations', icon: '📋' },
    ],
  },
]

export default function CaptainLayout({ children }: { children: ReactNode }) {
  return (
    <PortalLayout
      accentClass="text-orange-400"
      activeBgClass="bg-orange-500/10"
      portalLabel="Captain Portal"
      navSections={navSections}
      rootPath="/captain"
    >
      {children}
    </PortalLayout>
  )
}

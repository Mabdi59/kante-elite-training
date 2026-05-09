import type { ReactNode } from 'react'
import PortalLayout, { type PortalNavSection } from './PortalLayout'

const navSections: PortalNavSection[] = [
  {
    items: [
      {
        path: '/coach/dashboard',
        label: 'Dashboard',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        path: '/coach/notes',
        label: 'Progress Notes',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
          </svg>
        ),
      },
      {
        path: '/coach/attendance',
        label: 'Attendance',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        ),
      },
    ],
  },
]

export default function CoachLayout({ children }: { children: ReactNode }) {
  return (
    <PortalLayout
      accentClass="text-green-400"
      activeBgClass="bg-green-500/10"
      portalLabel="Coach Portal"
      navSections={navSections}
      rootPath="/coach/dashboard"
    >
      {children}
    </PortalLayout>
  )
}

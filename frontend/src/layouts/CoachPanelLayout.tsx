import type { ReactNode } from 'react'
import PortalLayout, { type PortalNavSection } from './PortalLayout'

const navSections: PortalNavSection[] = [
  {
    items: [
      { path: '/coach', label: 'Dashboard', icon: (<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>) },
    ],
  },
  {
    title: 'Sessions',
    items: [
      { path: '/coach/sessions', label: 'My Sessions', icon: (<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18"/><path d="M8 2v4M16 2v4"/></svg>) },
      { path: '/coach/attendance', label: 'Attendance', icon: (<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>) },
      { path: '/coach/notes', label: 'Progress Notes', icon: (<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>) },
    ],
  },
  {
    title: 'Profile',
    items: [
      { path: '/coach/availability', label: 'Availability', icon: (<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M8 14h.01M12 14h.01M16 14h.01"/></svg>) },
      { path: '/coach/profile', label: 'My Profile', icon: (<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>) },
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

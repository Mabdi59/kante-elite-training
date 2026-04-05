import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type NavLinkItem = {
  path: string
  label: string
  icon: ReactNode
}

type NavGroup = {
  id: string
  label: string
  icon: ReactNode
  items: NavLinkItem[]
}

type NavEntry =
  | ({ type: 'link' } & NavLinkItem)
  | ({ type: 'group' } & NavGroup)

function DashboardIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 13h6V4H4v9Z" />
      <path d="M14 20h6v-6h-6v6Z" />
      <path d="M14 10h6V4h-6v6Z" />
      <path d="M4 20h6v-3H4v3Z" />
    </svg>
  )
}

function BookingIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

function ContentIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22V4.5A2.5 2.5 0 0 1 6.5 2Z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
    </svg>
  )
}

function MediaIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m21 15-4.5-4.5L7 20" />
    </svg>
  )
}

function ProgramIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v18" />
      <path d="m5 7 7-4 7 4" />
      <path d="m5 17 7 4 7-4" />
    </svg>
  )
}

function EventIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="m10 14 2 2 4-4" />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M17 6h2a2 2 0 0 1 0 4h-2" />
      <path d="M7 6H5a2 2 0 0 0 0 4h2" />
    </svg>
  )
}

function CoachIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function PlayersIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="2.5" />
      <path d="M4 20a5 5 0 0 1 10 0" />
      <circle cx="17" cy="9" r="2" />
      <path d="M15 20a4 4 0 0 1 5-3.87" />
    </svg>
  )
}

function AvailabilityIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14h8" />
    </svg>
  )
}

function QuoteIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 8H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2l2-4V8Z" />
      <path d="M20 8h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2l2-4V8Z" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M4 20a5 5 0 0 1 10 0" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M15 20a5 5 0 0 1 5-4.58" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function ReportsIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  )
}

function AttendanceIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m9 11 3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

function EnrollmentIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M4 20a5 5 0 0 1 10 0" />
      <path d="M19 8v6" />
      <path d="M16 11h6" />
    </svg>
  )
}

function WaiverIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 15l2 2 4-4" />
    </svg>
  )
}

function AuditIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 3h6" />
      <path d="M10 8h4" />
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M10 12h4" />
      <path d="M10 16h4" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="19" cy="12" r="1.2" />
      <circle cx="5" cy="12" r="1.2" />
    </svg>
  )
}

function FamilyIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="7" r="2.5" />
      <path d="M4 19a5 5 0 0 1 10 0" />
      <circle cx="17" cy="9" r="2" />
      <path d="M15 19a4 4 0 0 1 5-3.87" />
    </svg>
  )
}

function ScheduleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 2v4M16 2v4" />
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  )
}


const navEntries: NavEntry[] = [
  {
    type: 'link',
    path: '/admin',
    label: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    type: 'group',
    id: 'families',
    label: 'Families',
    icon: <FamilyIcon />,
    items: [
      { path: '/admin/families', label: 'Families', icon: <FamilyIcon /> },
      { path: '/admin/players', label: 'Players', icon: <PlayersIcon /> },
    ],
  },
  {
    type: 'link',
    path: '/admin/bookings',
    label: 'Bookings',
    icon: <BookingIcon />,
  },
  {
    type: 'group',
    id: 'schedules',
    label: 'Schedules',
    icon: <ScheduleIcon />,
    items: [
      { path: '/admin/recurring-schedules', label: 'Recurring Schedules', icon: <ScheduleIcon /> },
      { path: '/admin/availability', label: 'Availability', icon: <AvailabilityIcon /> },
      { path: '/admin/attendance', label: 'Attendance', icon: <AttendanceIcon /> },
    ],
  },
  {
    type: 'link',
    path: '/admin/coaches',
    label: 'Coaches',
    icon: <CoachIcon />,
  },
  {
    type: 'group',
    id: 'programs',
    label: 'Programs',
    icon: <ProgramIcon />,
    items: [
      { path: '/admin/programs', label: 'Programs', icon: <ProgramIcon /> },
      { path: '/admin/events', label: 'Events', icon: <EventIcon /> },
    ],
  },
  {
    type: 'group',
    id: 'website',
    label: 'Website',
    icon: <ContentIcon />,
    items: [
      { path: '/admin/content', label: 'Content', icon: <ContentIcon /> },
      { path: '/admin/media', label: 'Media', icon: <MediaIcon /> },
      { path: '/admin/testimonials', label: 'Testimonials', icon: <QuoteIcon /> },
    ],
  },
  {
    type: 'group',
    id: 'more',
    label: 'More',
    icon: <MoreIcon />,
    items: [
      { path: '/admin/messages', label: 'Messages', icon: <MessageIcon /> },
      { path: '/admin/tournaments', label: 'Tournaments', icon: <TrophyIcon /> },
      { path: '/admin/enrollments', label: 'Enrollments', icon: <EnrollmentIcon /> },
      { path: '/admin/waivers', label: 'Waivers', icon: <WaiverIcon /> },
      { path: '/admin/users', label: 'Users', icon: <UsersIcon /> },
      { path: '/admin/search', label: 'Search', icon: <SearchIcon /> },
      { path: '/admin/reports', label: 'Reports', icon: <ReportsIcon /> },
      { path: '/admin/audit-logs', label: 'Audit Logs', icon: <AuditIcon /> },
    ],
  },
]

function isItemActive(pathname: string, path: string) {
  return path === '/admin' ? pathname === '/admin' : pathname.startsWith(path)
}

export default function AdminSidebarNav({ pathname }: { pathname: string }) {
  const activeGroupIds = useMemo(
    () =>
      navEntries
        .filter((entry): entry is Extract<NavEntry, { type: 'group' }> => entry.type === 'group')
        .filter((group) => group.items.some((item) => isItemActive(pathname, item.path)))
        .map((group) => group.id),
    [pathname],
  )

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(activeGroupIds.map((id) => [id, true])),
  )

  useEffect(() => {
    setOpenGroups((current) => {
      const next = { ...current }
      for (const groupId of activeGroupIds) next[groupId] = true
      return next
    })
  }, [activeGroupIds])

  const toggleGroup = (groupId: string) => {
    setOpenGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }))
  }

  return (
    <nav className="flex-1 overflow-y-auto p-4">
      <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
        Admin Navigation
      </p>

      <div className="space-y-2">
        {navEntries.map((entry) => {
          if (entry.type === 'link') {
            const isActive = isItemActive(pathname, entry.path)

            return (
              <Link
                key={entry.path}
                to={entry.path}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-green-500/10 text-green-400 font-medium'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center">{entry.icon}</span>
                <span>{entry.label}</span>
              </Link>
            )
          }

          const groupIsActive = entry.items.some((item) => isItemActive(pathname, item.path))
          const groupIsOpen = openGroups[entry.id] ?? false

          return (
            <div key={entry.id} className="rounded-2xl border border-gray-800/80 bg-gray-950/40">
              <button
                type="button"
                onClick={() => toggleGroup(entry.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition-colors ${
                  groupIsActive
                    ? 'text-green-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center">{entry.icon}</span>
                <span className="flex-1 font-medium">{entry.label}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${groupIsOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {groupIsOpen ? (
                <div className="space-y-1 px-2 pb-2">
                  {entry.items.map((item) => {
                    const isActive = isItemActive(pathname, item.path)

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                          isActive
                            ? 'bg-green-500/10 text-green-400 font-medium'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <span className="flex h-4 w-4 items-center justify-center">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </nav>
  )
}

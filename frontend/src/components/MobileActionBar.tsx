import { Link, useLocation } from 'react-router-dom'

const actions = [
  {
    href: '/book',
    label: 'Book Now',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    href: '/training',
    label: 'Programs',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v18" />
        <path d="m5 7 7-4 7 4" />
        <path d="m5 17 7 4 7-4" />
      </svg>
    ),
  },
  {
    href: '/contact',
    label: 'Contact',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
      </svg>
    ),
  },
]

export default function MobileActionBar() {
  const location = useLocation()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:hidden">
      <div className="pointer-events-auto mx-auto grid max-w-lg grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/95 p-2 shadow-[0_-12px_40px_rgba(0,0,0,0.48)] backdrop-blur">
        {actions.map((action) => {
          const active =
            location.pathname === action.href ||
            (action.href !== '/' && location.pathname.startsWith(action.href))

          return (
            <Link
              key={action.href}
              to={action.href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-[3.75rem] flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-2 text-center text-xs font-semibold transition-all ${
                active
                  ? 'bg-amber-500 text-black shadow-[0_8px_24px_rgba(245,158,11,0.28)]'
                  : 'bg-[#111] text-white hover:bg-[#171717]'
              }`}
            >
              <span className="flex items-center justify-center">{action.icon}</span>
              <span>{action.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

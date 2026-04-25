import { useState } from 'react'
import { Link } from 'react-router-dom'

const quickActions = [
  { href: '/admin/media', label: 'Add Post' },
  { href: '/admin/programs?create=1', label: 'Add Program' },
  { href: '/admin/events?create=1', label: 'Add Event' },
]

export default function AdminQuickActionFab() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-24 right-4 z-40 md:hidden">
      {open ? (
        <button
          type="button"
          aria-label="Close quick actions"
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40"
        />
      ) : null}

      <div className="relative flex flex-col items-end gap-3">
        {open ? (
          <div className="animate-fade-up flex flex-col items-end gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                to={action.href}
                onClick={() => setOpen(false)}
                className="min-h-11 rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm font-semibold text-white shadow-2xl"
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-black shadow-2xl transition-transform active:scale-[0.96]"
          aria-label="Open quick actions"
        >
          <svg
            className={`h-6 w-6 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  )
}

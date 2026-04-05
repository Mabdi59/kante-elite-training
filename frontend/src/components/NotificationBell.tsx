import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

interface Notification {
  id: number
  type: string
  title?: string
  body?: string
  readStatus: boolean
  createdAt: string
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await api.get('/notifications/unread-count')
      setUnreadCount(res.data?.count ?? res.data ?? 0)
    } catch {
      // silent
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    fetchCount()
    const interval = setInterval(fetchCount, 60_000)
    return () => clearInterval(interval)
  }, [isAuthenticated, fetchCount])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleOpen = async () => {
    if (!isAuthenticated) return
    if (!open) {
      setLoading(true)
      try {
        const res = await api.get('/notifications/unread')
        setNotifications(res.data ?? [])
      } catch {
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }
    setOpen((prev) => !prev)
  }

  const markRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`, {})
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      // silent
    }
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all', {})
      setNotifications([])
      setUnreadCount(0)
    } catch {
      // silent
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-white/10 bg-zinc-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-green-400 hover:text-green-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">No unread notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 border-b border-white/5 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-100 leading-snug">
                      {n.title || 'Notification'}
                    </p>
                    {n.body ? (
                      <p className="mt-1 text-sm text-gray-300 leading-snug">{n.body}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="shrink-0 text-xs text-gray-500 hover:text-green-400"
                  >
                    ✓
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import {
  getAdminPlayers,
  getAdminBookings,
  getAttendanceSummary,
  getAttendanceByPlayer,
  getPlayerProgressNotes,
} from '../../services/api'
import type {
  PlayerProfile,
  Booking,
  AttendanceRecord,
  PlayerProgressNote,
} from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const skillColor: Record<string, string> = {
  BEGINNER: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  INTERMEDIATE: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  ADVANCED: 'bg-green-500/10 text-green-400 border border-green-500/20',
  ELITE: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
}

const statusColor: Record<string, string> = {
  CONFIRMED: 'bg-green-500/10 text-green-400',
  PENDING: 'bg-amber-500/10 text-amber-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
  COMPLETED: 'bg-blue-500/10 text-blue-400',
  'NO-SHOW': 'bg-gray-500/10 text-gray-400',
}

const attendanceDot: Record<string, string> = {
  PRESENT: 'bg-green-500',
  LATE: 'bg-amber-500',
  ABSENT: 'bg-red-500',
}

type DrawerTab = 'profile' | 'bookings' | 'attendance' | 'notes'

// ─── Player drawer ────────────────────────────────────────────────────────────

interface PlayerDrawerProps {
  player: PlayerProfile
  onClose: () => void
}

function PlayerDrawer({ player, onClose }: PlayerDrawerProps) {
  const [tab, setTab] = useState<DrawerTab>('profile')

  const [bookings, setBookings] = useState<Booking[]>([])
  const [attendanceSummary, setAttendanceSummary] = useState<Record<string, number>>({})
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [notes, setNotes] = useState<PlayerProgressNote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const email = player.parentUserEmail ?? ''

  useEffect(() => {
    if (!email) return
    setLoading(true)
    setError('')
    Promise.all([
      getAdminBookings({ status: undefined }).catch(() => [] as Booking[]),
      getAttendanceSummary(email).catch(() => ({} as Record<string, number>)),
      getAttendanceByPlayer(email).catch(() => [] as AttendanceRecord[]),
      getPlayerProgressNotes(email).catch(() => [] as PlayerProgressNote[]),
    ])
      .then(([allBookings, summary, attendance, progressNotes]) => {
        const filtered = allBookings.filter(
          (b) => b.email?.toLowerCase() === email.toLowerCase(),
        )
        setBookings(filtered)
        setAttendanceSummary(summary)
        setAttendanceRecords(attendance)
        setNotes(progressNotes)
      })
      .catch(() => setError('Failed to load player data.'))
      .finally(() => setLoading(false))
  }, [email])

  const tabs: { id: DrawerTab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'bookings', label: `Bookings (${bookings.length})` },
    { id: 'attendance', label: 'Attendance' },
    { id: 'notes', label: `Notes (${notes.length})` },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl flex flex-col bg-gray-950 border-l border-gray-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">{player.name}</h2>
            {email && <p className="text-gray-500 text-xs mt-0.5">{email}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
            aria-label="Close drawer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-gray-800 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                tab === t.id
                  ? 'bg-green-500 text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4">
              <ErrorBanner message={error} onDismiss={() => setError('')} />
            </div>
          )}

          {loading ? (
            <LoadingSpinner label="Loading player data…" />
          ) : (
            <>
              {tab === 'profile' && (
                <ProfileTab player={player} attendanceSummary={attendanceSummary} />
              )}
              {tab === 'bookings' && <BookingsTab bookings={bookings} />}
              {tab === 'attendance' && <AttendanceTab records={attendanceRecords} />}
              {tab === 'notes' && <NotesTab notes={notes} />}
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileTab({
  player,
  attendanceSummary,
}: {
  player: PlayerProfile
  attendanceSummary: Record<string, number>
}) {
  const present = attendanceSummary['PRESENT'] ?? 0
  const late = attendanceSummary['LATE'] ?? 0
  const absent = attendanceSummary['ABSENT'] ?? 0
  const total = present + late + absent
  const presentRate = total > 0 ? Math.round(((present + late) / total) * 100) : null

  const rows: { label: string; value: string | undefined }[] = [
    { label: 'Date of Birth', value: player.dateOfBirth },
    { label: 'Age', value: player.age != null ? String(player.age) : undefined },
    { label: 'Skill Level', value: player.skillLevel },
    { label: 'Preferred Position', value: player.preferredPosition },
    {
      label: 'Status',
      value: player.active ? 'Active' : 'Inactive',
    },
    { label: 'Parent Email', value: player.parentUserEmail },
    {
      label: 'Registered',
      value: new Date(player.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Attendance summary chips */}
      {total > 0 && (
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Attendance Summary
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { label: 'Present', count: present, color: 'bg-green-500/10 text-green-400 border border-green-500/20' },
                { label: 'Late', count: late, color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
                { label: 'Absent', count: absent, color: 'bg-red-500/10 text-red-400 border border-red-500/20' },
              ] as { label: string; count: number; color: string }[]
            ).map(({ label, count, color }) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${color}`}
              >
                <span className="font-black">{count}</span>
                <span>{label}</span>
              </div>
            ))}
            {presentRate !== null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-700/40 text-gray-300 border border-gray-700">
                <span className="font-black">{presentRate}%</span>
                <span>attendance rate</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Player details */}
      <div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
          Player Details
        </p>
        <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
          {rows
            .filter((r) => r.value)
            .map((r) => (
              <div key={r.label} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-gray-500 text-sm">{r.label}</span>
                <span
                  className={`text-sm font-medium ${
                    r.label === 'Skill Level'
                      ? (skillColor[r.value ?? ''] ?? 'text-white') + ' px-2 py-0.5 rounded-full text-xs'
                      : r.label === 'Status'
                        ? player.active
                          ? 'text-green-400'
                          : 'text-red-400'
                        : 'text-white'
                  }`}
                >
                  {r.value}
                </span>
              </div>
            ))}
        </div>
      </div>

      {player.notes && (
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Internal Notes
          </p>
          <p className="text-gray-300 text-sm bg-gray-900 rounded-xl border border-gray-800 px-4 py-3 leading-relaxed">
            {player.notes}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Bookings tab ─────────────────────────────────────────────────────────────

function BookingsTab({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        icon="Calendar"
        title="No bookings found"
        description="This player has no bookings on record."
      />
    )
  }
  return (
    <div className="space-y-2">
      {[...bookings]
        .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
        .map((b) => (
          <div
            key={b.id}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-white text-sm font-semibold">{b.programName ?? 'Session'}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {new Date(b.bookingDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {b.bookingTime && ` · ${b.bookingTime}`}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                  statusColor[b.bookingStatus ?? ''] ?? 'bg-gray-700 text-gray-300'
                }`}
              >
                {b.bookingStatus ?? 'Unknown'}
              </span>
            </div>
            {b.playerName && (
              <p className="text-gray-600 text-xs mt-1">Player: {b.playerName}</p>
            )}
          </div>
        ))}
    </div>
  )
}

// ─── Attendance tab ───────────────────────────────────────────────────────────

function AttendanceTab({ records }: { records: AttendanceRecord[] }) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon="CheckSquare"
        title="No attendance records"
        description="No attendance has been recorded for this player yet."
      />
    )
  }
  return (
    <div className="space-y-2">
      {[...records]
        .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
        .map((r) => (
          <div
            key={r.id}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${attendanceDot[r.status] ?? 'bg-gray-500'}`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white text-sm font-semibold">
                  {new Date(r.sessionDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    r.status === 'PRESENT'
                      ? 'bg-green-500/10 text-green-400'
                      : r.status === 'LATE'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                </span>
              </div>
              {r.coachNotes && (
                <p className="text-gray-500 text-xs mt-0.5 italic">{r.coachNotes}</p>
              )}
            </div>
            <span className="text-gray-700 text-xs shrink-0">#{r.bookingId}</span>
          </div>
        ))}
    </div>
  )
}

// ─── Notes tab ────────────────────────────────────────────────────────────────

function NotesTab({ notes }: { notes: PlayerProgressNote[] }) {
  if (notes.length === 0) {
    return (
      <EmptyState
        icon="FileText"
        title="No progress notes"
        description="No progress notes have been written for this player yet."
      />
    )
  }
  return (
    <div className="space-y-3">
      {[...notes]
        .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
        .map((n) => (
          <div
            key={n.id}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                {n.title && (
                  <p className="text-white text-sm font-semibold">{n.title}</p>
                )}
                <p className="text-gray-500 text-xs">
                  {new Date(n.sessionDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {n.coachName && ` · ${n.coachName}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {n.rating != null && (
                  <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
                    {n.rating}/10
                  </span>
                )}
                {n.noteType && (
                  <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-semibold">
                    {n.noteType}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{n.content}</p>
          </div>
        ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterSkill, setFilterSkill] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null)

  useEffect(() => {
    document.title = 'Players | Kante Elite Training'
    getAdminPlayers()
      .then(setPlayers)
      .catch(() => setError('Could not load players. Please try again.'))
      .finally(() => setLoading(false))
    return () => {
      document.title = 'Kante Elite Training'
    }
  }, [])

  const visiblePlayers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return players.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.parentUserEmail ?? '').toLowerCase().includes(q)
      const matchesSkill = !filterSkill || p.skillLevel === filterSkill
      return matchesSearch && matchesSkill
    })
  }, [players, search, filterSkill])

  const skillLevels = useMemo(
    () => [...new Set(players.map((p) => p.skillLevel).filter(Boolean))].sort() as string[],
    [players],
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Players</h1>
          <p className="text-gray-400 text-sm mt-1">
            {players.length} player{players.length !== 1 ? 's' : ''} registered.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 w-full max-w-xs"
        />
        {skillLevels.length > 0 && (
          <select
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="">All skill levels</option>
            {skillLevels.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading players…" />
      ) : visiblePlayers.length === 0 ? (
        <EmptyState
          icon="Users"
          title={search || filterSkill ? 'No players match your filters' : 'No players yet'}
          description={
            search || filterSkill
              ? 'Try adjusting your search or skill-level filter.'
              : 'Players appear here once they register profiles under their accounts.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {visiblePlayers.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlayer(p)}
              className="bg-gray-900 border border-gray-800 hover:border-green-500/40 rounded-xl px-5 py-4 text-left transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm group-hover:text-green-400 transition-colors truncate">
                    {p.name}
                  </p>
                  {p.parentUserEmail && (
                    <p className="text-gray-600 text-xs mt-0.5 truncate">{p.parentUserEmail}</p>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                    p.active
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-gray-700 text-gray-500'
                  }`}
                >
                  {p.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {p.skillLevel && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      skillColor[p.skillLevel] ?? 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {p.skillLevel.charAt(0) + p.skillLevel.slice(1).toLowerCase()}
                  </span>
                )}
                {p.preferredPosition && (
                  <span className="text-gray-500 text-xs">{p.preferredPosition}</span>
                )}
                {p.age != null && (
                  <span className="text-gray-600 text-xs">Age {p.age}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Slide-over drawer */}
      {selectedPlayer && (
        <PlayerDrawer player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  )
}

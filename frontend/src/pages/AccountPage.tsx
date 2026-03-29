import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getMyBookings,
  cancelMyBooking,
  getMyPlayers,
  addPlayerProfile,
  removePlayerProfile,
} from '../services/api'
import type { Booking, PlayerProfile, PlayerProfileFormData } from '../types'

const statusColor: Record<string, string> = {
  CONFIRMED: 'text-green-400 bg-green-500/10 border-green-500/30',
  RESERVED: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  CANCELLED: 'text-red-400 bg-red-500/10 border-red-500/30',
  COMPLETED: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
}

const emptyPlayerForm: PlayerProfileFormData = {
  name: '',
  age: undefined,
  skillLevel: '',
  preferredPosition: '',
  notes: '',
}

export default function AccountPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'bookings' | 'players'>('bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [playerForm, setPlayerForm] = useState<PlayerProfileFormData>(emptyPlayerForm)
  const [savingPlayer, setSavingPlayer] = useState(false)

  useEffect(() => {
    Promise.all([
      getMyBookings().catch(() => []),
      getMyPlayers().catch(() => []),
    ]).then(([b, p]) => {
      setBookings(b)
      setPlayers(p)
    }).catch(() => setError('Failed to load data.')).finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this booking?')) return
    setCancelling(id)
    try {
      const updated = await cancelMyBooking(id)
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)))
    } catch {
      alert('Failed to cancel booking. Please try again.')
    } finally {
      setCancelling(null)
    }
  }

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPlayer(true)
    try {
      const created = await addPlayerProfile(playerForm)
      setPlayers((prev) => [...prev, created])
      setPlayerForm(emptyPlayerForm)
      setShowAddPlayer(false)
    } catch {
      alert('Failed to add player profile.')
    } finally {
      setSavingPlayer(false)
    }
  }

  const handleRemovePlayer = async (id: number) => {
    if (!window.confirm('Remove this player profile?')) return
    try {
      await removePlayerProfile(id)
      setPlayers((prev) => prev.filter((p) => p.id !== id))
    } catch {
      alert('Failed to remove player profile.')
    }
  }

  const now = new Date()
  const upcoming = bookings.filter(
    (b) =>
      b.bookingStatus !== 'CANCELLED' && new Date(b.bookingDate) >= now,
  )
  const past = bookings.filter(
    (b) =>
      b.bookingStatus === 'CANCELLED' || new Date(b.bookingDate) < now,
  )

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-black text-white tracking-wider">
          KANTÉ ELITE
        </Link>
        <Link to="/" className="text-gray-400 text-sm hover:text-white transition-colors">
          ← Back to site
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Welcome banner */}
        <div className="mb-8">
          <h1 className="text-white text-4xl font-black mb-1">My Account</h1>
          <p className="text-gray-400">
            Welcome back, <span className="text-green-400 font-semibold">{user?.name}</span>
          </p>
          <p className="text-gray-600 text-sm">{user?.email} · {user?.role}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800 pb-0">
          {(['bookings', 'players'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors capitalize ${
                tab === t
                  ? 'text-green-400 border-green-400'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {t === 'bookings' ? `📅 Bookings (${bookings.length})` : `👦 Players (${players.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-gray-400">Loading…</div>
        ) : tab === 'bookings' ? (
          <>
            {/* Upcoming sessions */}
            <section className="mb-10">
              <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <span>📅</span> Upcoming Sessions ({upcoming.length})
              </h2>
              {upcoming.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                  <p className="text-gray-500 mb-4">No upcoming sessions booked.</p>
                  <Link to="/book" className="btn-primary text-sm">
                    Book a Session
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((b) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      cancelling={cancelling}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Past / cancelled */}
            {past.length > 0 && (
              <section>
                <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🗂️</span> Past & Cancelled
                </h2>
                <div className="space-y-3">
                  {past.map((b) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      cancelling={cancelling}
                      onCancel={handleCancel}
                      muted
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          /* Players Tab */
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">Player Profiles</h2>
              <button
                onClick={() => setShowAddPlayer(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                + Add Player
              </button>
            </div>

            {showAddPlayer && (
              <form
                onSubmit={handleAddPlayer}
                className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6 space-y-4"
              >
                <h3 className="text-white font-bold">New Player Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Player Name *</label>
                    <input
                      type="text"
                      required
                      value={playerForm.name}
                      onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Age</label>
                    <input
                      type="number"
                      min={3}
                      max={25}
                      value={playerForm.age ?? ''}
                      onChange={(e) =>
                        setPlayerForm({ ...playerForm, age: e.target.value ? Number(e.target.value) : undefined })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Skill Level</label>
                    <select
                      value={playerForm.skillLevel ?? ''}
                      onChange={(e) => setPlayerForm({ ...playerForm, skillLevel: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">— select —</option>
                      <option>BEGINNER</option>
                      <option>INTERMEDIATE</option>
                      <option>ADVANCED</option>
                      <option>ELITE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Preferred Position</label>
                    <input
                      type="text"
                      value={playerForm.preferredPosition ?? ''}
                      onChange={(e) =>
                        setPlayerForm({ ...playerForm, preferredPosition: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                      placeholder="e.g. Midfielder"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-400 text-sm mb-1">Notes</label>
                    <textarea
                      rows={2}
                      value={playerForm.notes ?? ''}
                      onChange={(e) => setPlayerForm({ ...playerForm, notes: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={savingPlayer}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    {savingPlayer ? 'Saving…' : 'Add Player'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPlayer(false)}
                    className="bg-gray-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {players.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                <p className="text-gray-500">No player profiles yet. Add your first player!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {players.map((p) => (
                  <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-white font-semibold text-lg">{p.name}</p>
                      <button
                        onClick={() => handleRemovePlayer(p.id)}
                        className="text-red-400 text-xs hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      {p.age && <p>Age: {p.age}</p>}
                      {p.skillLevel && (
                        <p>
                          Level:{' '}
                          <span className="text-white">{p.skillLevel}</span>
                        </p>
                      )}
                      {p.preferredPosition && (
                        <p>
                          Position:{' '}
                          <span className="text-white">{p.preferredPosition}</span>
                        </p>
                      )}
                      {p.notes && <p className="italic text-gray-500 text-xs mt-2">{p.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

function BookingCard({
  booking: b,
  cancelling,
  onCancel,
  muted = false,
}: {
  booking: Booking
  cancelling: number | null
  onCancel: (id: number) => void
  muted?: boolean
}) {
  const canCancel = b.bookingStatus !== 'CANCELLED' && b.bookingStatus !== 'COMPLETED'
  const statusCls = statusColor[b.bookingStatus] ?? 'text-gray-400 bg-gray-800 border-gray-700'

  return (
    <div
      className={`bg-gray-900 border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${muted ? 'opacity-60' : 'border-gray-800'}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <span className="text-white font-bold">{b.programName}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusCls}`}>
            {b.bookingStatus}
          </span>
        </div>
        <p className="text-gray-400 text-sm">
          {b.bookingDate} · {b.bookingTime}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Player: {b.playerName}
          {b.parentName ? ` · Parent: ${b.parentName}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {canCancel && (
          <button
            onClick={() => onCancel(b.id)}
            disabled={cancelling === b.id}
            className="text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
          </button>
        )}
        <Link
          to="/book"
          className="text-sm text-green-400 border border-green-400/30 hover:bg-green-400/10 rounded-lg px-4 py-2 transition-colors"
        >
          Book again
        </Link>
      </div>
    </div>
  )
}

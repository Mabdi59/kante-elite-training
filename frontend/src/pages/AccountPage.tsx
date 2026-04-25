import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getMyBookings,
  cancelMyBooking,
  getMyPlayers,
  addPlayerProfile,
  removePlayerProfile,
  changePassword,
} from '../services/api'
import type { Booking, PlayerProfile, PlayerProfileFormData } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import { calculateAgeFromDateOfBirth } from '../utils/playerAge'

const emptyPlayerForm: PlayerProfileFormData = {
  name: '',
  dateOfBirth: '',
  age: undefined,
  skillLevel: '',
  preferredPosition: '',
  notes: '',
}

export default function AccountPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'bookings' | 'players' | 'security'>('bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [playerForm, setPlayerForm] = useState<PlayerProfileFormData>(emptyPlayerForm)
  const [savingPlayer, setSavingPlayer] = useState(false)

  // Change-password form state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    Promise.all([
      getMyBookings().catch(() => []),
      getMyPlayers().catch(() => []),
    ]).then(([b, p]) => {
      setBookings(b)
      setPlayers(p)
    }).catch(() => setError('Could not load your account data.')).finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this booking?')) return
    setCancelling(id)
    try {
      const updated = await cancelMyBooking(id)
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)))
    } catch {
      setError('Could not cancel that booking. Please try again or contact us.')
    } finally {
      setCancelling(null)
    }
  }

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPlayer(true)
    try {
      const created = await addPlayerProfile({
        ...playerForm,
        dateOfBirth: playerForm.dateOfBirth || undefined,
        age: calculateAgeFromDateOfBirth(playerForm.dateOfBirth) ?? playerForm.age,
      })
      setPlayers((prev) => [...prev, created])
      setPlayerForm(emptyPlayerForm)
      setShowAddPlayer(false)
    } catch {
      setError('Could not add player profile. Please try again.')
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
      setError('Could not remove that player profile.')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('New passwords do not match.')
      return
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }
    setSavingPw(true)
    try {
      await changePassword(pwForm.currentPassword, pwForm.newPassword)
      setPwSuccess('Password updated successfully. Other active sessions have been signed out.')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setPwError(msg ?? 'Could not update password. Please check your current password and try again.')
    } finally {
      setSavingPw(false)
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
      <div className="bg-[#0d0d0d] border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between">
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
            Welcome back, <span className="text-amber-500 font-semibold">{user?.name}</span>
          </p>
          <p className="text-gray-600 text-sm">{user?.email} · {user?.role}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-[#1a1a1a] pb-0">
          {(['bookings', 'players', 'security'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors capitalize ${
                tab === t
                  ? 'text-amber-500 border-amber-500'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {t === 'bookings'
                ? `Bookings (${bookings.length})`
                : t === 'players'
                  ? `Players (${players.length})`
                  : 'Security'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-6">
            <LoadingSpinner label="Loading your account…" />
          </div>
        ) : tab === 'bookings' ? (
          <>
            {/* Upcoming sessions */}
            <section className="mb-10">
              <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                Upcoming Sessions ({upcoming.length})
              </h2>
              {upcoming.length === 0 ? (
                <div className="bg-[#111] border border-[#222] rounded-xl p-6 text-center">
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
        ) : tab === 'players' ? (
          /* Players Tab */
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">Player Profiles</h2>
              <button
                onClick={() => setShowAddPlayer(true)}
                className="btn-primary text-sm"
              >
                + Add Player
              </button>
            </div>

            {showAddPlayer && (
              <form
                onSubmit={handleAddPlayer}
                className="bg-[#111] border border-[#222] rounded-xl p-6 mb-6 space-y-4"
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
                      className="input-field-default"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={playerForm.dateOfBirth ?? ''}
                      onChange={(e) =>
                        setPlayerForm({
                          ...playerForm,
                          dateOfBirth: e.target.value,
                          age: calculateAgeFromDateOfBirth(e.target.value),
                        })
                      }
                      className="input-field-default"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Age</label>
                    <input
                      type="number"
                      min={3}
                      max={25}
                      value={calculateAgeFromDateOfBirth(playerForm.dateOfBirth) ?? playerForm.age ?? ''}
                      readOnly
                      disabled
                      className="input-field-default text-gray-400 cursor-not-allowed disabled:opacity-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Calculated automatically from date of birth.</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Skill Level</label>
                    <select
                      value={playerForm.skillLevel ?? ''}
                      onChange={(e) => setPlayerForm({ ...playerForm, skillLevel: e.target.value })}
                      className="input-field-default"
                    >
                      <option value="">Select level</option>
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
                      className="input-field-default"
                      placeholder="e.g. Midfielder"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-400 text-sm mb-1">Notes</label>
                    <textarea
                      rows={2}
                      value={playerForm.notes ?? ''}
                      onChange={(e) => setPlayerForm({ ...playerForm, notes: e.target.value })}
                      className="input-field-default resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={savingPlayer}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {savingPlayer ? 'Saving…' : 'Add Player'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPlayer(false)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {players.length === 0 ? (
              <div className="bg-[#111] border border-[#222] rounded-xl p-6 text-center">
                <p className="text-gray-500">No player profiles yet. Add your first player!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {players.map((p) => (
                  <div key={p.id} className="bg-[#111] border border-[#222] rounded-xl p-5">
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
        ) : tab === 'security' ? (
          <section>
            <h2 className="text-white text-xl font-bold mb-6">Change Password</h2>
            <form
              onSubmit={handleChangePassword}
              className="bg-[#111] border border-[#222] rounded-xl p-6 max-w-md space-y-4"
            >
              {pwError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-400 text-sm">
                  {pwSuccess}
                </div>
              )}
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  className="input-field-default"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                  className="input-field-default"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                  className="input-field-default"
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={savingPw}
                className="btn-primary w-full justify-center py-3 disabled:opacity-50"
              >
                {savingPw ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </section>
        ) : null}
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

  return (
    <div
      className={`bg-gray-900 border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${muted ? 'opacity-60' : 'border-gray-800'}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <span className="text-white font-bold">{b.programName}</span>
          <StatusBadge status={b.bookingStatus} />
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
          className="text-sm text-amber-500 border border-amber-500/20 hover:bg-amber-500/10 rounded-lg px-4 py-2 transition-colors"
        >
          Book again
        </Link>
      </div>
    </div>
  )
}

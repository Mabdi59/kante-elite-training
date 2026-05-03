import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getMyRegistrations,
  cancelMyRegistration,
  getMyPlayers,
  addPlayerProfile,
  updatePlayerProfile,
  removePlayerProfile,
  changePassword,
} from '../services/api'
import type { PlayerProfile, PlayerProfileFormData, Registration } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import { calculateAgeFromDateOfBirth } from '../utils/playerAge'

type AccountTab = 'sessions' | 'players' | 'security'
type Notice = { type: 'success' | 'error'; message: string } | null

const emptyPlayerForm: PlayerProfileFormData = {
  name: '',
  dateOfBirth: '',
  age: undefined,
  skillLevel: '',
  preferredPosition: '',
  notes: '',
}

const passwordMinLength = 8

export default function AccountPage() {
  const navigate = useNavigate()
  const { user, logoutUser } = useAuth()
  const [tab, setTab] = useState<AccountTab>('sessions')
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<Notice>(null)
  const [cancelling, setCancelling] = useState<number | null>(null)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)

  const [playerModalOpen, setPlayerModalOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<PlayerProfile | null>(null)
  const [playerForm, setPlayerForm] = useState<PlayerProfileFormData>(emptyPlayerForm)
  const [savingPlayer, setSavingPlayer] = useState(false)
  const [playerPendingRemoval, setPlayerPendingRemoval] = useState<PlayerProfile | null>(null)
  const [removingPlayer, setRemovingPlayer] = useState(false)

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    let mounted = true

    Promise.all([
      getMyRegistrations().catch(() => []),
      getMyPlayers().catch(() => []),
    ])
      .then(([registrationsResponse, playersResponse]) => {
        if (!mounted) return
        setRegistrations(registrationsResponse)
        setPlayers(playersResponse)
      })
      .catch(() => showNotice('error', 'Could not load your account data.'))
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 4500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message })
  }

  const handleSignOut = () => {
    logoutUser()
    navigate('/')
  }

  const todayTime = useMemo(() => {
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    return today.getTime()
  }, [])

  const upcoming = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(registration.status) &&
          (!registration.scheduledDate ||
            new Date(`${registration.scheduledDate}T12:00:00`).getTime() >= todayTime),
      ),
    [registrations, todayTime],
  )

  const history = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          ['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(registration.status) ||
          (!!registration.scheduledDate &&
            new Date(`${registration.scheduledDate}T12:00:00`).getTime() < todayTime),
      ),
    [registrations, todayTime],
  )

  const handleCancel = async (registration: Registration) => {
    if (!window.confirm('Cancel this training session?')) return

    setCancelling(registration.id)
    try {
      const updated = await cancelMyRegistration(registration.id)
      setRegistrations((prev) => prev.map((item) => (item.id === registration.id ? updated : item)))
      showNotice('success', 'Session cancelled')
    } catch {
      showNotice('error', 'Could not cancel that session. Please try again or contact us.')
    } finally {
      setCancelling(null)
    }
  }

  const openAddPlayer = () => {
    setEditingPlayer(null)
    setPlayerForm(emptyPlayerForm)
    setPlayerModalOpen(true)
  }

  const openEditPlayer = (player: PlayerProfile) => {
    setEditingPlayer(player)
    setPlayerForm({
      name: player.name,
      dateOfBirth: player.dateOfBirth ?? '',
      age: player.age,
      skillLevel: player.skillLevel ?? '',
      preferredPosition: player.preferredPosition ?? '',
      notes: player.notes ?? '',
    })
    setPlayerModalOpen(true)
  }

  const closePlayerModal = () => {
    if (savingPlayer) return
    setEditingPlayer(null)
    setPlayerForm(emptyPlayerForm)
    setPlayerModalOpen(false)
  }

  const playerFormError = getPlayerFormError(playerForm)

  const handleSavePlayer = async (event: FormEvent) => {
    event.preventDefault()
    const validationError = getPlayerFormError(playerForm)
    if (validationError) {
      showNotice('error', validationError)
      return
    }

    setSavingPlayer(true)
    const payload: PlayerProfileFormData = {
      ...playerForm,
      name: playerForm.name.trim(),
      skillLevel: playerForm.skillLevel?.trim(),
      preferredPosition: playerForm.preferredPosition?.trim(),
      notes: playerForm.notes?.trim() || undefined,
      dateOfBirth: playerForm.dateOfBirth || undefined,
      age: calculateAgeFromDateOfBirth(playerForm.dateOfBirth) ?? playerForm.age,
    }

    try {
      if (editingPlayer) {
        const updated = await updatePlayerProfile(editingPlayer.id, payload)
        setPlayers((prev) => prev.map((player) => (player.id === editingPlayer.id ? updated : player)))
        showNotice('success', 'Player updated')
      } else {
        const created = await addPlayerProfile(payload)
        setPlayers((prev) => [...prev, created])
        showNotice('success', 'Player added')
      }
      setEditingPlayer(null)
      setPlayerForm(emptyPlayerForm)
      setPlayerModalOpen(false)
    } catch {
      showNotice('error', editingPlayer ? 'Could not update player.' : 'Could not add player.')
    } finally {
      setSavingPlayer(false)
    }
  }

  const handleRemovePlayer = async () => {
    if (!playerPendingRemoval) return
    setRemovingPlayer(true)
    try {
      await removePlayerProfile(playerPendingRemoval.id)
      setPlayers((prev) => prev.filter((player) => player.id !== playerPendingRemoval.id))
      setPlayerPendingRemoval(null)
      showNotice('success', 'Player removed')
    } catch {
      showNotice('error', 'Could not remove that player.')
    } finally {
      setRemovingPlayer(false)
    }
  }

  const passwordError = getPasswordError(pwForm)
  const canSubmitPassword = !passwordError && !savingPw

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault()
    if (passwordError) {
      showNotice('error', passwordError)
      return
    }

    setSavingPw(true)
    try {
      await changePassword(pwForm.currentPassword, pwForm.newPassword)
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
      showNotice('success', 'Password changed')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      showNotice('error', msg ?? 'Could not update password. Please check your current password and try again.')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-[#080808] px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="text-xl font-black tracking-wide text-white">
            Kante Elite Training
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white">
              Home
            </Link>
            <Link to="/book" className="btn-primary px-4 py-2 text-sm">
              Book a Session
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-8 rounded-2xl border border-white/10 bg-[#101010] p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-500">My Training</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">Account Dashboard</h1>
              <p className="mt-2 text-gray-400">Manage your sessions, players, and account security.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <p className="text-sm font-semibold text-white">{user?.name ?? 'Training Account'}</p>
              <p className="mt-1 text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
        </section>

        {notice ? (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-semibold ${
              notice.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-red-500/30 bg-red-500/10 text-red-300'
            }`}
          >
            {notice.message}
          </div>
        ) : null}

        <div className="mb-8 flex flex-wrap gap-2 border-b border-white/10">
          {[
            { id: 'sessions', label: `Registrations (${registrations.length})` },
            { id: 'players', label: `Players (${players.length})` },
            { id: 'security', label: 'Security' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as AccountTab)}
              className={`-mb-px border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
                tab === item.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12">
            <LoadingSpinner label="Loading your account..." />
          </div>
        ) : tab === 'sessions' ? (
          <SessionsTab
            upcoming={upcoming}
            history={history}
            cancelling={cancelling}
            onCancel={handleCancel}
            onView={setSelectedRegistration}
          />
        ) : tab === 'players' ? (
          <PlayersTab
            players={players}
            onAdd={openAddPlayer}
            onEdit={openEditPlayer}
            onRemove={setPlayerPendingRemoval}
          />
        ) : (
          <SecurityTab
            pwForm={pwForm}
            setPwForm={setPwForm}
            passwordError={passwordError}
            canSubmit={canSubmitPassword}
            saving={savingPw}
            onSubmit={handleChangePassword}
          />
        )}
      </main>

      {playerModalOpen ? (
        <PlayerModal
          editingPlayer={editingPlayer}
          playerForm={playerForm}
          setPlayerForm={setPlayerForm}
          saving={savingPlayer}
          validationError={playerFormError}
          onSubmit={handleSavePlayer}
          onClose={closePlayerModal}
        />
      ) : null}

      {playerPendingRemoval ? (
        <ConfirmModal
          title="Remove Player"
          body={`Remove ${playerPendingRemoval.name}? This player will no longer appear in your account.`}
          confirmLabel={removingPlayer ? 'Removing...' : 'Remove Player'}
          danger
          disabled={removingPlayer}
          onCancel={() => setPlayerPendingRemoval(null)}
          onConfirm={handleRemovePlayer}
        />
      ) : null}

      {selectedRegistration ? (
        <SessionDetailsModal
          registration={selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
        />
      ) : null}
    </div>
  )
}

function SessionsTab({
  upcoming,
  history,
  cancelling,
  onCancel,
  onView,
}: {
  upcoming: Registration[]
  history: Registration[]
  cancelling: number | null
  onCancel: (registration: Registration) => void
  onView: (registration: Registration) => void
}) {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black">Upcoming Sessions</h2>
          <p className="mt-1 text-sm text-gray-400">Confirmed training registrations tied to this account.</p>
        </div>
        <Link to="/book" className="btn-primary justify-center px-5 py-2.5 text-sm">
          Book a Session
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111] p-8 text-center">
          <p className="text-lg font-bold text-white">You don&apos;t have any sessions booked yet.</p>
          <p className="mt-2 text-sm text-gray-400">Summer Training sessions are ready when you are.</p>
          <Link to="/book" className="btn-primary mt-5 inline-flex px-5 py-2.5 text-sm">
            Book a Session
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {upcoming.map((registration) => (
            <RegistrationCard
              key={registration.id}
              registration={registration}
              cancelling={cancelling}
              onCancel={onCancel}
              onView={onView}
            />
          ))}
        </div>
      )}

      {history.length > 0 ? (
        <div>
          <h3 className="mb-4 text-xl font-black">Past and Cancelled</h3>
          <div className="space-y-3">
            {history.map((registration) => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
                cancelling={cancelling}
                onCancel={onCancel}
                onView={onView}
                muted
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function RegistrationCard({
  registration,
  cancelling,
  onCancel,
  onView,
  muted = false,
}: {
  registration: Registration
  cancelling: number | null
  onCancel: (registration: Registration) => void
  onView: (registration: Registration) => void
  muted?: boolean
}) {
  const canCancel = !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(registration.status)

  return (
    <article className={`rounded-2xl border border-white/10 bg-[#111] p-5 ${muted ? 'opacity-70' : ''}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-white">{getOfferingName(registration)}</h3>
            <StatusBadge status={registration.status} />
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-300">
              {formatEnum(registration.paymentStatus)}
            </span>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-gray-300 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Date" value={formatDate(registration.scheduledDate)} />
            <Detail label="Time" value={formatTimeRange(registration)} />
            <Detail label="Coach" value={registration.sessionCoachLabel ?? 'Coach Kante'} />
            <Detail label="Location" value={registration.sessionLocation ?? 'Location TBA'} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onView(registration)}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/5"
          >
            View Session Details
          </button>
          {canCancel ? (
            <button
              type="button"
              onClick={() => onCancel(registration)}
              disabled={cancelling === registration.id}
              className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelling === registration.id ? 'Cancelling...' : 'Cancel Session'}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function PlayersTab({
  players,
  onAdd,
  onEdit,
  onRemove,
}: {
  players: PlayerProfile[]
  onAdd: () => void
  onEdit: (player: PlayerProfile) => void
  onRemove: (player: PlayerProfile) => void
}) {
  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black">Players</h2>
          <p className="mt-1 text-sm text-gray-400">Keep player details ready for training registrations.</p>
        </div>
        <button type="button" onClick={onAdd} className="btn-primary px-5 py-2.5 text-sm">
          Add Player
        </button>
      </div>

      {players.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111] p-8 text-center">
          <p className="font-bold text-white">No players added yet.</p>
          <p className="mt-2 text-sm text-gray-400">Add a player profile to speed up future registrations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {players.map((player) => (
            <article key={player.id} className="rounded-2xl border border-white/10 bg-[#111] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black">{player.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">Player profile</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(player)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-gray-200 hover:bg-white/5"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(player)}
                    className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Detail label="Age" value={player.age ? String(player.age) : 'Not set'} />
                <Detail label="Level" value={player.skillLevel ? formatEnum(player.skillLevel) : 'Not set'} />
                <Detail label="Position" value={player.preferredPosition ?? 'Not set'} />
                <Detail label="Status" value={player.active ? 'Active' : 'Inactive'} />
              </div>
              {player.notes ? <p className="mt-4 text-sm italic text-gray-500">{player.notes}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function SecurityTab({
  pwForm,
  setPwForm,
  passwordError,
  canSubmit,
  saving,
  onSubmit,
}: {
  pwForm: { currentPassword: string; newPassword: string; confirm: string }
  setPwForm: Dispatch<SetStateAction<{ currentPassword: string; newPassword: string; confirm: string }>>
  passwordError: string
  canSubmit: boolean
  saving: boolean
  onSubmit: (event: FormEvent) => void
}) {
  return (
    <section className="max-w-xl">
      <h2 className="text-2xl font-black">Security</h2>
      <p className="mt-1 text-sm text-gray-400">Change your password using your current password.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-[#111] p-6">
        <Field label="Current Password">
          <input
            type="password"
            required
            value={pwForm.currentPassword}
            onChange={(event) => setPwForm((form) => ({ ...form, currentPassword: event.target.value }))}
            className="input-field-default"
            autoComplete="current-password"
          />
        </Field>
        <Field label="New Password">
          <input
            type="password"
            required
            minLength={passwordMinLength}
            value={pwForm.newPassword}
            onChange={(event) => setPwForm((form) => ({ ...form, newPassword: event.target.value }))}
            className="input-field-default"
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirm New Password">
          <input
            type="password"
            required
            minLength={passwordMinLength}
            value={pwForm.confirm}
            onChange={(event) => setPwForm((form) => ({ ...form, confirm: event.target.value }))}
            className="input-field-default"
            autoComplete="new-password"
          />
        </Field>

        {passwordError ? <p className="text-sm font-semibold text-red-300">{passwordError}</p> : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary w-full justify-center py-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </section>
  )
}

function PlayerModal({
  editingPlayer,
  playerForm,
  setPlayerForm,
  saving,
  validationError,
  onSubmit,
  onClose,
}: {
  editingPlayer: PlayerProfile | null
  playerForm: PlayerProfileFormData
  setPlayerForm: Dispatch<SetStateAction<PlayerProfileFormData>>
  saving: boolean
  validationError: string
  onSubmit: (event: FormEvent) => void
  onClose: () => void
}) {
  const handleDateChange = (value: string) => {
    setPlayerForm((form) => ({
      ...form,
      dateOfBirth: value,
      age: calculateAgeFromDateOfBirth(value) ?? form.age,
    }))
  }

  return (
    <ModalShell title={editingPlayer ? 'Edit Player' : 'Add Player'} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name *">
            <input
              type="text"
              required
              value={playerForm.name}
              onChange={(event) => setPlayerForm((form) => ({ ...form, name: event.target.value }))}
              className="input-field-default"
            />
          </Field>
          <Field label="Age *">
            <input
              type="number"
              min={3}
              max={25}
              required
              value={playerForm.age ?? ''}
              onChange={(event) =>
                setPlayerForm((form) => ({ ...form, age: event.target.value ? Number(event.target.value) : undefined }))
              }
              className="input-field-default"
            />
          </Field>
          <Field label="Level *">
            <select
              required
              value={playerForm.skillLevel ?? ''}
              onChange={(event) => setPlayerForm((form) => ({ ...form, skillLevel: event.target.value }))}
              className="input-field-default"
            >
              <option value="">Select level</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="ELITE">Elite</option>
            </select>
          </Field>
          <Field label="Position *">
            <input
              type="text"
              required
              value={playerForm.preferredPosition ?? ''}
              onChange={(event) => setPlayerForm((form) => ({ ...form, preferredPosition: event.target.value }))}
              className="input-field-default"
              placeholder="Forward, Midfielder, Defender..."
            />
          </Field>
          <Field label="Date of Birth">
            <input
              type="date"
              value={playerForm.dateOfBirth ?? ''}
              onChange={(event) => handleDateChange(event.target.value)}
              className="input-field-default"
            />
          </Field>
          <Field label="Notes">
            <input
              type="text"
              value={playerForm.notes ?? ''}
              onChange={(event) => setPlayerForm((form) => ({ ...form, notes: event.target.value }))}
              className="input-field-default"
              placeholder="Optional"
            />
          </Field>
        </div>
        {validationError ? <p className="text-sm font-semibold text-red-300">{validationError}</p> : null}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={saving} className="btn-secondary justify-center text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !!validationError}
            className="btn-primary justify-center text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving...' : editingPlayer ? 'Update Player' : 'Add Player'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function SessionDetailsModal({
  registration,
  onClose,
}: {
  registration: Registration
  onClose: () => void
}) {
  return (
    <ModalShell title="Session Details" onClose={onClose}>
      <div className="space-y-4">
        <h3 className="text-2xl font-black">{getOfferingName(registration)}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Detail label="Date" value={formatDate(registration.scheduledDate)} />
          <Detail label="Time" value={formatTimeRange(registration)} />
          <Detail label="Coach" value={registration.sessionCoachLabel ?? 'Coach Kante'} />
          <Detail label="Location" value={registration.sessionLocation ?? 'Location TBA'} />
          <Detail label="Status" value={formatEnum(registration.status)} />
          <Detail label="Payment" value={formatEnum(registration.paymentStatus)} />
          <Detail label="Player" value={registration.participantName} />
          <Detail label="Confirmation" value={registration.registrationCode} />
        </div>
        {registration.customerNotes ? (
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">Notes</p>
            <p className="mt-1 text-sm text-gray-300">{registration.customerNotes}</p>
          </div>
        ) : null}
      </div>
    </ModalShell>
  )
}

function ConfirmModal({
  title,
  body,
  confirmLabel,
  danger = false,
  disabled = false,
  onCancel,
  onConfirm,
}: {
  title: string
  body: string
  confirmLabel: string
  danger?: boolean
  disabled?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <ModalShell title={title} onClose={onCancel}>
      <p className="text-sm leading-relaxed text-gray-300">{body}</p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={disabled} className="btn-secondary justify-center text-sm">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={disabled}
          className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            danger ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-amber-500 text-black hover:bg-amber-400'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  )
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 px-4 py-6">
      <button type="button" className="absolute inset-0" aria-label="Close modal" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-gray-500">{label}</span>
      {children}
    </label>
  )
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value || 'Not set'}</p>
    </div>
  )
}

function getOfferingName(registration: Registration) {
  return registration.eventTitle ?? registration.programName ?? 'Summer Training'
}

function formatDate(value?: string) {
  if (!value) return 'Schedule pending'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

function formatTimeRange(registration: Registration) {
  if (!registration.scheduledStartTime) return 'Time TBA'
  const end = registration.scheduledEndTime ? `-${registration.scheduledEndTime}` : ''
  return `${registration.scheduledStartTime}${end}`
}

function formatEnum(value?: string) {
  if (!value) return 'Not set'
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getPlayerFormError(form: PlayerProfileFormData) {
  if (!form.name.trim()) return 'Player name is required.'
  if (!form.age || form.age < 3) return 'Player age is required.'
  if (!form.skillLevel?.trim()) return 'Player level is required.'
  if (!form.preferredPosition?.trim()) return 'Player position is required.'
  return ''
}

function getPasswordError(form: { currentPassword: string; newPassword: string; confirm: string }) {
  if (!form.currentPassword || !form.newPassword || !form.confirm) return 'Complete all password fields.'
  if (form.newPassword.length < passwordMinLength) {
    return `New password must be at least ${passwordMinLength} characters.`
  }
  if (form.newPassword !== form.confirm) return 'New passwords do not match.'
  return ''
}

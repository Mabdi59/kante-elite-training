import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminUsers, onboardFamily } from '../../services/api'
import type { AdminUser, FamilyOnboardingRequest, PlayerOnboardingEntry } from '../../types'
import ErrorBanner from '../../components/ErrorBanner'
import LoadingSpinner from '../../components/LoadingSpinner'
import { calculateAgeFromDateOfBirth } from '../../utils/playerAge'

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite']
const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Any']

const emptyPlayer = (): PlayerOnboardingEntry => ({
  name: '',
  dateOfBirth: '',
  age: undefined,
  skillLevel: '',
  preferredPosition: '',
  notes: '',
  active: true,
})

type ParentMode = 'new' | 'existing'

export default function AdminFamilyOnboardingPage() {
  const [step, setStep] = useState(1)

  // Parent state
  const [parentMode, setParentMode] = useState<ParentMode>('new')
  const [existingUsers, setExistingUsers] = useState<AdminUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
  const [userSearch, setUserSearch] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [parentPassword, setParentPassword] = useState('')

  // Players state
  const [players, setPlayers] = useState<PlayerOnboardingEntry[]>([emptyPlayer()])

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [createdFamilyId, setCreatedFamilyId] = useState<number | null>(null)

  // Track whether existing users have already been fetched to avoid redundant calls
  const usersFetchedRef = useRef(false)

  useEffect(() => {
    if (parentMode === 'existing' && !usersFetchedRef.current) {
      usersFetchedRef.current = true
      setLoadingUsers(true)
      getAdminUsers()
        .then(setExistingUsers)
        .catch(() => setError('Could not load users.'))
        .finally(() => setLoadingUsers(false))
    }
  }, [parentMode])

  const filteredUsers = existingUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()),
  )

  const addPlayer = () => setPlayers((prev) => [...prev, emptyPlayer()])

  const removePlayer = (index: number) =>
    setPlayers((prev) => prev.filter((_, i) => i !== index))

  const updatePlayer = (index: number, field: keyof PlayerOnboardingEntry, value: unknown) =>
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    )

  const validateStep1 = () => {
    if (parentMode === 'new') {
      if (!parentName.trim()) return 'Parent name is required.'
      if (!parentEmail.trim()) return 'Parent email is required.'
    } else {
      if (!selectedUserId) return 'Please select an existing parent.'
    }
    return ''
  }

  const validateStep2 = () => {
    for (let i = 0; i < players.length; i++) {
      if (!players[i].name.trim()) return `Player ${i + 1} name is required.`
    }
    return ''
  }

  const handleNext = () => {
    setError('')
    if (step === 1) {
      const err = validateStep1()
      if (err) { setError(err); return }
    }
    if (step === 2) {
      const err = validateStep2()
      if (err) { setError(err); return }
    }
    setStep((s) => s + 1)
  }

  const handleBack = () => {
    setError('')
    setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const payload: FamilyOnboardingRequest = {
        players: players.map((p) => ({
          ...p,
          dateOfBirth: p.dateOfBirth || undefined,
          age: calculateAgeFromDateOfBirth(p.dateOfBirth) ?? p.age ?? undefined,
          skillLevel: p.skillLevel || undefined,
          preferredPosition: p.preferredPosition || undefined,
          notes: p.notes || undefined,
        })),
      }

      if (parentMode === 'existing') {
        payload.existingParentUserId = selectedUserId as number
      } else {
        payload.parentName = parentName
        payload.parentEmail = parentEmail
        payload.parentPhone = parentPhone || undefined
        payload.emergencyContact = emergencyContact || undefined
        payload.parentPassword = parentPassword || undefined
      }

      const result = await onboardFamily(payload)
      setCreatedFamilyId(result.parentId)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to create family. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedUser = existingUsers.find((u) => u.id === selectedUserId)

  // Success screen
  if (createdFamilyId !== null) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30">
          <svg className="h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 12 2 2 4-4" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <h2 className="text-white text-2xl font-black">Family Created!</h2>
        <p className="text-gray-400">The family has been successfully onboarded.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to={`/admin/families/${createdFamilyId}`}
            className="bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
          >
            View Family
          </Link>
          <Link
            to="/admin/families"
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            All Families
          </Link>
        </div>
      </div>
    )
  }

  const steps = ['Parent Setup', 'Add Players', 'Review & Create']

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/families" className="text-gray-400 hover:text-white transition-colors">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="text-white text-2xl font-black">Onboard Family</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {steps.map((label, i) => {
          const num = i + 1
          const active = step === num
          const done = step > num
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    done
                      ? 'bg-green-500 text-black'
                      : active
                      ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {done ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  ) : (
                    num
                  )}
                </div>
                <span className={`text-xs hidden sm:block ${active ? 'text-green-400' : done ? 'text-gray-300' : 'text-gray-600'}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${done ? 'bg-green-500' : 'bg-gray-800'}`} />
              )}
            </div>
          )
        })}
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {/* Step content */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        {/* ── Step 1: Parent Setup ── */}
        {step === 1 && (
          <>
            <h2 className="text-white text-lg font-bold">Parent Setup</h2>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setParentMode('new')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  parentMode === 'new'
                    ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                    : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                Create New Parent
              </button>
              <button
                type="button"
                onClick={() => setParentMode('existing')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  parentMode === 'existing'
                    ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                    : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                Select Existing
              </button>
            </div>

            {parentMode === 'new' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="space-y-1.5">
                    <span className="text-gray-300 text-sm font-medium">Full Name <span className="text-red-400">*</span></span>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Jane Smith"
                      className="input-field-default py-2.5"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-gray-300 text-sm font-medium">Email <span className="text-red-400">*</span></span>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="input-field-default py-2.5"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="space-y-1.5">
                    <span className="text-gray-300 text-sm font-medium">Phone</span>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="+1 (614) 000-0000"
                      className="input-field-default py-2.5"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-gray-300 text-sm font-medium">Password</span>
                    <input
                      type="text"
                      value={parentPassword}
                      onChange={(e) => setParentPassword(e.target.value)}
                      placeholder="Auto-generated if blank"
                      className="input-field-default py-2.5"
                    />
                  </label>
                </div>
                <label className="space-y-1.5 block">
                  <span className="text-gray-300 text-sm font-medium">Emergency Contact</span>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Name and phone number"
                    className="input-field-default py-2.5"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                {loadingUsers ? (
                  <LoadingSpinner label="Loading users..." />
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="input-field-default py-2.5"
                    />
                    <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-700 divide-y divide-gray-800">
                      {filteredUsers.length === 0 ? (
                        <p className="text-gray-500 text-sm p-4 text-center">No users found</p>
                      ) : (
                        filteredUsers.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => setSelectedUserId(u.id)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors ${
                              selectedUserId === u.id ? 'bg-green-500/10 border-l-2 border-green-500' : ''
                            }`}
                          >
                            <p className={`text-sm font-medium ${selectedUserId === u.id ? 'text-green-400' : 'text-white'}`}>
                              {u.name}
                            </p>
                            <p className="text-gray-400 text-xs">{u.email} · {u.role}</p>
                          </button>
                        ))
                      )}
                    </div>
                    {selectedUser && (
                      <p className="text-green-400 text-sm">
                        Selected: <strong>{selectedUser.name}</strong> ({selectedUser.email})
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Step 2: Add Players ── */}
        {step === 2 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-white text-lg font-bold">Add Players</h2>
              <button
                type="button"
                onClick={addPlayer}
                className="bg-green-500 hover:bg-green-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                + Add Another
              </button>
            </div>

            <div className="space-y-5">
              {players.map((player, idx) => (
                <div key={idx} className="bg-gray-800 rounded-xl p-4 space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm font-semibold">Player {idx + 1}</span>
                    {players.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlayer(idx)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        aria-label="Remove player"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="space-y-1.5">
                      <span className="text-gray-400 text-xs font-medium">Name <span className="text-red-400">*</span></span>
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => updatePlayer(idx, 'name', e.target.value)}
                        placeholder="Player name"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-gray-400 text-xs font-medium">Age</span>
                      <input
                        type="number"
                        value={calculateAgeFromDateOfBirth(player.dateOfBirth) ?? player.age ?? ''}
                        readOnly
                        disabled
                        min={1}
                        max={99}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-400 text-sm cursor-not-allowed disabled:opacity-100"
                      />
                      <span className="text-gray-500 text-[11px]">Calculated automatically from date of birth.</span>
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-gray-400 text-xs font-medium">Date of Birth</span>
                      <input
                        type="date"
                        value={player.dateOfBirth ?? ''}
                        onChange={(e) => {
                          updatePlayer(idx, 'dateOfBirth', e.target.value)
                          updatePlayer(idx, 'age', calculateAgeFromDateOfBirth(e.target.value))
                        }}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-gray-400 text-xs font-medium">Skill Level</span>
                      <select
                        value={player.skillLevel ?? ''}
                        onChange={(e) => updatePlayer(idx, 'skillLevel', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                      >
                        <option value="">Select level</option>
                        {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-gray-400 text-xs font-medium">Preferred Position</span>
                      <select
                        value={player.preferredPosition ?? ''}
                        onChange={(e) => updatePlayer(idx, 'preferredPosition', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                      >
                        <option value="">Select position</option>
                        {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1.5 flex items-end gap-2">
                      <div className="flex-1 space-y-1.5">
                        <span className="text-gray-400 text-xs font-medium">Active</span>
                        <div className="flex items-center gap-2 h-9">
                          <input
                            type="checkbox"
                            id={`active-${idx}`}
                            checked={player.active ?? true}
                            onChange={(e) => updatePlayer(idx, 'active', e.target.checked)}
                            className="h-4 w-4 rounded accent-green-500"
                          />
                          <label htmlFor={`active-${idx}`} className="text-gray-300 text-sm">Active</label>
                        </div>
                      </div>
                    </label>
                  </div>

                  <label className="space-y-1.5 block">
                    <span className="text-gray-400 text-xs font-medium">Notes</span>
                    <textarea
                      value={player.notes ?? ''}
                      onChange={(e) => updatePlayer(idx, 'notes', e.target.value)}
                      placeholder="Any notes about this player..."
                      rows={2}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </label>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Step 3: Review & Create ── */}
        {step === 3 && (
          <>
            <h2 className="text-white text-lg font-bold">Review & Create</h2>

            <div className="space-y-4">
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-gray-300 text-sm font-semibold mb-3">Parent</h3>
                {parentMode === 'existing' && selectedUser ? (
                  <div className="space-y-1">
                    <p className="text-white text-sm"><span className="text-gray-400">Name:</span> {selectedUser.name}</p>
                    <p className="text-white text-sm"><span className="text-gray-400">Email:</span> {selectedUser.email}</p>
                    <p className="text-white text-sm"><span className="text-gray-400">Role:</span> {selectedUser.role}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-white text-sm"><span className="text-gray-400">Name:</span> {parentName}</p>
                    <p className="text-white text-sm"><span className="text-gray-400">Email:</span> {parentEmail}</p>
                    {parentPhone && <p className="text-white text-sm"><span className="text-gray-400">Phone:</span> {parentPhone}</p>}
                    {emergencyContact && <p className="text-white text-sm"><span className="text-gray-400">Emergency:</span> {emergencyContact}</p>}
                    <p className="text-white text-sm"><span className="text-gray-400">Password:</span> {parentPassword ? '(set)' : 'Auto-generated'}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-gray-300 text-sm font-semibold mb-3">
                  Players ({players.length})
                </h3>
                <div className="space-y-3">
                  {players.map((p, i) => (
                    <div key={i} className="border-b border-gray-700 last:border-0 pb-3 last:pb-0">
                      <p className="text-white text-sm font-medium">{p.name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                        {p.age && <span className="text-gray-400 text-xs">Age: {p.age}</span>}
                        {p.skillLevel && <span className="text-gray-400 text-xs">Level: {p.skillLevel}</span>}
                        {p.preferredPosition && <span className="text-gray-400 text-xs">Position: {p.preferredPosition}</span>}
                        <span className={`text-xs ${p.active !== false ? 'text-green-400' : 'text-gray-500'}`}>
                          {p.active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-3">
        <div>
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/families"
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Family'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

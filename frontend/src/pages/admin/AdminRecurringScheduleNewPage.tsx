import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  getAdminFamilies,
  getAdminCoaches,
  getAdminPrograms,
  previewBookingSeries,
  createBookingSeries,
} from '../../services/api'
import type {
  FamilyListItem,
  CoachProfile,
  Program,
  BookingSeriesRequest,
  BookingSeriesPreviewItem,
} from '../../types'
import ErrorBanner from '../../components/ErrorBanner'
import LoadingSpinner from '../../components/LoadingSpinner'

const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const WEEKDAY_LABEL: Record<string, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
}
const DURATIONS = [30, 45, 60, 90]

type EndMode = 'date' | 'weeks'

export default function AdminRecurringScheduleNewPage() {
  const [searchParams] = useSearchParams()
  const preselectedFamilyId = searchParams.get('familyId')

  // Reference data
  const [families, setFamilies] = useState<FamilyListItem[]>([])
  const [coaches, setCoaches] = useState<CoachProfile[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Form state
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | ''>(
    preselectedFamilyId ? Number(preselectedFamilyId) : '',
  )
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([])
  const [selectedCoachId, setSelectedCoachId] = useState<number | ''>('')
  const [selectedProgramId, setSelectedProgramId] = useState<number | ''>('')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endMode, setEndMode] = useState<EndMode>('weeks')
  const [endDate, setEndDate] = useState('')
  const [numberOfWeeks, setNumberOfWeeks] = useState(8)
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([])
  const [bookingTime, setBookingTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [notes, setNotes] = useState('')

  // Preview state
  const [preview, setPreview] = useState<BookingSeriesPreviewItem[] | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [createdId, setCreatedId] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([getAdminFamilies(), getAdminCoaches(), getAdminPrograms()])
      .then(([f, c, p]) => {
        setFamilies(f)
        setCoaches(c)
        setPrograms(p)
      })
      .catch(() => setError('Could not load reference data.'))
      .finally(() => setLoadingData(false))
  }, [])

  const selectedFamily = families.find((f) => f.id === selectedFamilyId)

  // We need player details but FamilyListItem doesn't have players.
  // We'll track selectedPlayerIds as numeric IDs from the families API.
  // For player selection we need FamilyDetail. Use a simplified approach:
  // Just show a text input for player profile IDs for now.
  // Actually we can show FamilyListItem player count and let admin enter IDs.
  // Better: load family detail when a family is selected.

  const toggleWeekday = (day: string) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }

  const buildRequest = (): BookingSeriesRequest => ({
    programId: selectedProgramId as number,
    playerProfileIds: selectedPlayerIds,
    coachUserId: selectedCoachId ? (selectedCoachId as number) : undefined,
    title: title || undefined,
    startDate,
    endDate: endMode === 'date' ? endDate || undefined : undefined,
    numberOfWeeks: endMode === 'weeks' ? numberOfWeeks : undefined,
    weekdays: selectedWeekdays.join(','),
    bookingTime,
    durationMinutes,
    notes: notes || undefined,
  })

  const validateForm = (): string => {
    if (!selectedProgramId) return 'Please select a program.'
    if (selectedPlayerIds.length === 0) return 'Please add at least one player profile ID.'
    if (!startDate) return 'Please set a start date.'
    if (selectedWeekdays.length === 0) return 'Please select at least one weekday.'
    if (!bookingTime) return 'Please set a booking time.'
    return ''
  }

  const handlePreview = async () => {
    setError('')
    const err = validateForm()
    if (err) { setError(err); return }
    setPreviewing(true)
    try {
      const result = await previewBookingSeries(buildRequest())
      setPreview(result)
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to generate preview.'
      setError(msg)
    } finally {
      setPreviewing(false)
    }
  }

  const handleCreate = async () => {
    setError('')
    setCreating(true)
    try {
      const result = await createBookingSeries(buildRequest())
      setCreatedId(result.id)
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to create schedule.'
      setError(msg)
    } finally {
      setCreating(false)
    }
  }

  const hasBlockingConflicts = preview?.some((p) => p.conflict) ?? false
  const conflictCount = preview?.filter((p) => p.conflict).length ?? 0

  if (loadingData) return <LoadingSpinner label="Loading data..." />

  if (createdId !== null) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30">
          <svg className="h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 12 2 2 4-4" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <h2 className="text-white text-2xl font-black">Schedule Created!</h2>
        <p className="text-gray-400">The recurring schedule has been created successfully.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to="/admin/recurring-schedules"
            className="bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
          >
            View All Schedules
          </Link>
          <button
            onClick={() => {
              setCreatedId(null)
              setPreview(null)
            }}
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Create Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/recurring-schedules"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="text-white text-2xl font-black">New Recurring Schedule</h1>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        {/* Family & Players section */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Players</h2>

          <div className="space-y-3">
            <label className="space-y-1.5 block">
              <span className="text-gray-300 text-sm font-medium">Family (optional reference)</span>
              <select
                value={selectedFamilyId}
                onChange={(e) => {
                  setSelectedFamilyId(e.target.value ? Number(e.target.value) : '')
                  setSelectedPlayerIds([])
                }}
                className="input-field-default py-2.5"
              >
                <option value="">Select a family...</option>
                {families.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.email}) | {f.playerCount} player(s)
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 block">
              <span className="text-gray-300 text-sm font-medium">
                Player Profile IDs <span className="text-red-400">*</span>
              </span>
              <input
                type="text"
                placeholder="Enter player profile IDs separated by commas (e.g. 1,2,3)"
                value={selectedPlayerIds.join(',')}
                onChange={(e) => {
                  const ids = e.target.value
                    .split(',')
                    .map((v) => parseInt(v.trim()))
                    .filter((n) => !isNaN(n))
                  setSelectedPlayerIds(ids)
                }}
                className="input-field-default py-2.5"
              />
              {selectedFamily && (
                <p className="text-gray-500 text-xs">
                  Family has {selectedFamily.playerCount} player(s). Enter their profile IDs above.
                </p>
              )}
            </label>
          </div>
        </div>

        <hr className="border-gray-800" />

        {/* Coach & Program */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Program & Coach</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-gray-300 text-sm font-medium">
                Program <span className="text-red-400">*</span>
              </span>
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value ? Number(e.target.value) : '')}
                className="input-field-default py-2.5"
              >
                <option value="">Select program...</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-gray-300 text-sm font-medium">Coach</span>
              <select
                value={selectedCoachId}
                onChange={(e) => setSelectedCoachId(e.target.value ? Number(e.target.value) : '')}
                className="input-field-default py-2.5"
              >
                <option value="">Any / unassigned</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.userId}>{c.userName}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="space-y-1.5 block">
            <span className="text-gray-300 text-sm font-medium">Title (optional)</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Saturday morning training"
              className="input-field-default py-2.5"
            />
          </label>
        </div>

        <hr className="border-gray-800" />

        {/* Schedule */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Schedule</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-gray-300 text-sm font-medium">
                Start Date <span className="text-red-400">*</span>
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field-default py-2.5"
              />
            </label>

            <div className="space-y-1.5">
              <span className="text-gray-300 text-sm font-medium">End By</span>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setEndMode('weeks')}
                  className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
                    endMode === 'weeks'
                      ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                      : 'bg-gray-800 border border-gray-700 text-gray-400'
                  }`}
                >
                  # of Weeks
                </button>
                <button
                  type="button"
                  onClick={() => setEndMode('date')}
                  className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
                    endMode === 'date'
                      ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                      : 'bg-gray-800 border border-gray-700 text-gray-400'
                  }`}
                >
                  End Date
                </button>
              </div>
              {endMode === 'weeks' ? (
                <input
                  type="number"
                  value={numberOfWeeks}
                  onChange={(e) => setNumberOfWeeks(parseInt(e.target.value) || 1)}
                  min={1}
                  max={52}
                  className="input-field-default py-2.5"
                />
              ) : (
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field-default py-2.5"
                />
              )}
            </div>
          </div>

          {/* Weekdays */}
          <div className="space-y-1.5">
            <span className="text-gray-300 text-sm font-medium">
              Weekdays <span className="text-red-400">*</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWeekday(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedWeekdays.includes(day)
                      ? 'bg-green-500 text-black'
                      : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  {WEEKDAY_LABEL[day]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-gray-300 text-sm font-medium">
                Time <span className="text-red-400">*</span>
              </span>
              <input
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="input-field-default py-2.5"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-gray-300 text-sm font-medium">Duration</span>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="input-field-default py-2.5"
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>{d} minutes</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <hr className="border-gray-800" />

        {/* Notes */}
        <label className="space-y-1.5 block">
          <span className="text-gray-300 text-sm font-medium">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
            className="input-field-default py-2.5 resize-none"
          />
        </label>

        <button
          type="button"
          onClick={handlePreview}
          disabled={previewing}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold py-3 rounded-lg transition-colors"
        >
          {previewing ? 'Generating Preview...' : 'Preview Schedule'}
        </button>
      </div>

      {/* Preview section */}
      {preview && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-white font-bold text-lg">Preview</h2>
            <div className="flex gap-3 items-center">
              <span className="text-gray-400 text-sm">{preview.length} sessions</span>
              {conflictCount > 0 && (
                <span className="bg-red-500/10 text-red-400 text-xs px-2.5 py-1 rounded-full">
                  {conflictCount} conflict{conflictCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-500 text-xs font-medium pb-2 pr-3">Date</th>
                  <th className="text-left text-gray-500 text-xs font-medium pb-2 pr-3">Day</th>
                  <th className="text-left text-gray-500 text-xs font-medium pb-2 pr-3">Time</th>
                  <th className="text-left text-gray-500 text-xs font-medium pb-2 pr-3">Coach</th>
                  <th className="text-left text-gray-500 text-xs font-medium pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {preview.map((item, idx) => (
                  <tr
                    key={idx}
                    className={item.conflict ? 'bg-red-900/10' : ''}
                  >
                    <td className="py-2 pr-3 text-gray-300 whitespace-nowrap">{item.date}</td>
                    <td className="py-2 pr-3 text-gray-400 whitespace-nowrap">{item.dayOfWeek}</td>
                    <td className="py-2 pr-3 text-gray-300 whitespace-nowrap">{item.bookingTime}</td>
                    <td className="py-2 pr-3 text-gray-400">{item.coachName ?? '|'}</td>
                    <td className="py-2">
                      {item.conflict ? (
                        <span className="text-red-400 text-xs" title={item.conflictReason}>
                          ⚠ Conflict{item.conflictReason ? `: ${item.conflictReason}` : ''}
                        </span>
                      ) : (
                        <span className="text-green-400 text-xs">✓ OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <p className="text-gray-400 text-sm">
              {hasBlockingConflicts
                ? 'Some sessions have conflicts. You can still create the schedule.'
                : 'No conflicts | ready to create.'}
            </p>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              {creating ? 'Creating...' : 'Create Schedule'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

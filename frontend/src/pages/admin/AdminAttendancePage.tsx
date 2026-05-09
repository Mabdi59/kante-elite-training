import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  getAttendanceByRange,
  upsertAttendance,
  deleteAttendanceRecord,
} from '../../services/api'
import type { AttendanceRecord, AttendanceFormData, AttendanceStatus } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'

// Default to the current calendar month
const today = new Date()
const defaultFrom = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
const defaultTo = today.toISOString().slice(0, 10)

const STATUS_OPTIONS: AttendanceStatus[] = ['PRESENT', 'LATE', 'ABSENT']

const statusColor: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-green-500/10 text-green-400 border border-green-500/20',
  LATE: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  ABSENT: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

const statusDot: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-green-500',
  LATE: 'bg-amber-500',
  ABSENT: 'bg-red-500',
}

interface FormState {
  bookingId: string
  playerEmail: string
  playerName: string
  status: AttendanceStatus
  coachNotes: string
}

const emptyForm: FormState = {
  bookingId: '',
  playerEmail: '',
  playerName: '',
  status: 'PRESENT',
  coachNotes: '',
}

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Range query controls
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)

  // Create / Edit form
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Filter
  const [filterQuery, setFilterQuery] = useState('')

  useEffect(() => {
    document.title = 'Attendance | Kante Elite Training'
    return () => {
      document.title = 'Kante Elite Training'
    }
  }, [])

  const loadRecords = (f: string, t: string) => {
    setLoading(true)
    setError('')
    getAttendanceByRange(f, t)
      .then(setRecords)
      .catch(() => setError('Could not load attendance records. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRecords(from, to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    loadRecords(from, to)
  }

  const visibleRecords = useMemo(() => {
    const q = filterQuery.trim().toLowerCase()
    const filtered = q
      ? records.filter(
          (r) =>
            r.playerEmail.toLowerCase().includes(q) ||
            (r.playerName ?? '').toLowerCase().includes(q),
        )
      : records
    return [...filtered].sort(
      (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
    )
  }, [records, filterQuery])

  const counts = useMemo(
    () =>
      records.reduce(
        (acc, r) => {
          if (r.status === 'PRESENT') acc.present += 1
          else if (r.status === 'LATE') acc.late += 1
          else acc.absent += 1
          return acc
        },
        { present: 0, late: 0, absent: 0 },
      ),
    [records],
  )

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSaveError('')
    setShowForm(true)
  }

  const openEdit = (r: AttendanceRecord) => {
    setEditingId(r.id)
    setForm({
      bookingId: String(r.bookingId),
      playerEmail: r.playerEmail,
      playerName: r.playerName ?? '',
      status: r.status,
      coachNotes: r.coachNotes ?? '',
    })
    setSaveError('')
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setSaveError('')
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    const bookingIdNum = parseInt(form.bookingId, 10)
    if (isNaN(bookingIdNum) || bookingIdNum <= 0) {
      setSaveError('A valid Booking ID (positive integer) is required.')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      const payload: AttendanceFormData = {
        bookingId: bookingIdNum,
        playerEmail: form.playerEmail.trim() || undefined,
        playerName: form.playerName.trim() || undefined,
        status: form.status,
        coachNotes: form.coachNotes.trim() || undefined,
      }
      const saved = await upsertAttendance(payload)
      setRecords((prev) => {
        const existing = prev.findIndex((r) => r.id === saved.id)
        if (existing >= 0) {
          const next = [...prev]
          next[existing] = saved
          return next
        }
        return [saved, ...prev]
      })
      cancelForm()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save attendance record.'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (r: AttendanceRecord) => {
    const label = `${r.playerName ?? r.playerEmail} on ${r.sessionDate.slice(0, 10)}`
    if (!window.confirm(`Delete attendance record for ${label}? This cannot be undone.`)) return
    try {
      await deleteAttendanceRecord(r.id)
      setRecords((prev) => prev.filter((item) => item.id !== r.id))
      if (editingId === r.id) cancelForm()
    } catch {
      setError('Could not delete attendance record.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Attendance</h1>
          <p className="text-gray-400 text-sm mt-1">
            Record and manage player attendance for sessions.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openCreate}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg text-sm"
          >
            + New Record
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {/* Create / Edit form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className={`bg-gray-900 border rounded-xl p-6 mb-6 space-y-4 ${
            editingId ? 'border-blue-500/30' : 'border-green-500/30'
          }`}
        >
          <h2 className="text-white font-bold text-xl">
            {editingId ? 'Edit Attendance Record' : 'New Attendance Record'}
          </h2>

          {saveError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Booking ID <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="number"
                min={1}
                value={form.bookingId}
                onChange={(e) => setForm((f) => ({ ...f, bookingId: e.target.value }))}
                placeholder="e.g. 42"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Status <span className="text-red-400">*</span>
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AttendanceStatus }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Player Email</label>
              <input
                type="email"
                value={form.playerEmail}
                onChange={(e) => setForm((f) => ({ ...f, playerEmail: e.target.value }))}
                placeholder="player@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Player Name</label>
              <input
                type="text"
                value={form.playerName}
                onChange={(e) => setForm((f) => ({ ...f, playerName: e.target.value }))}
                placeholder="e.g. Alex Smith"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Coach Notes</label>
              <textarea
                rows={3}
                value={form.coachNotes}
                onChange={(e) => setForm((f) => ({ ...f, coachNotes: e.target.value }))}
                placeholder="Optional notes about this session…"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-y leading-relaxed"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Record'}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Date-range query */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap items-end gap-3 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-4"
      >
        <div>
          <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            From
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            To
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-lg text-sm"
        >
          Load
        </button>
      </form>

      {loading ? (
        <LoadingSpinner label="Loading attendance records…" />
      ) : (
        <>
          {/* Summary chips */}
          {records.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {(
                [
                  { label: 'Present', count: counts.present, color: 'bg-green-500/10 text-green-400 border border-green-500/20' },
                  { label: 'Late', count: counts.late, color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
                  { label: 'Absent', count: counts.absent, color: 'bg-red-500/10 text-red-400 border border-red-500/20' },
                ] as { label: string; count: number; color: string }[]
              ).map(({ label, count, color }) => (
                <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${color}`}>
                  <span className="text-lg font-black">{count}</span>
                  <span>{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-500/10 text-gray-400 border border-gray-700">
                <span className="text-lg font-black">{records.length}</span>
                <span>Total</span>
              </div>
            </div>
          )}

          {/* Player filter */}
          {records.length > 0 && (
            <div className="mb-4">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter by player email or name…"
                className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600"
              />
            </div>
          )}

          {/* Records list */}
          {visibleRecords.length === 0 ? (
            <EmptyState
              icon="CheckSquare"
              title={filterQuery ? 'No records match that filter' : 'No attendance records in this range'}
              description={
                filterQuery
                  ? 'Try a different player email or name.'
                  : 'Use the date range above to load records, or create a new record with the button above.'
              }
            />
          ) : (
            <div className="space-y-2">
              {visibleRecords.map((r) => (
                <div
                  key={r.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${statusDot[r.status]}`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">
                          {r.playerName ?? r.playerEmail}
                        </span>
                        {r.playerName && (
                          <span className="text-gray-600 text-xs">{r.playerEmail}</span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor[r.status]}`}
                        >
                          {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {new Date(r.sessionDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                        <span className="text-gray-700"> · Booking #{r.bookingId}</span>
                        {r.recordedBy && (
                          <span className="text-gray-700"> · recorded by {r.recordedBy}</span>
                        )}
                      </p>
                      {r.coachNotes && (
                        <p className="text-gray-400 text-xs mt-1 italic">{r.coachNotes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(r)}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r)}
                      className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

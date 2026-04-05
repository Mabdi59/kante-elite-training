import { useMemo, useState } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

interface AttendanceRecord {
  id: number
  bookingId: number
  playerName: string
  playerEmail: string
  status: string
  coachNotes?: string
  sessionDate: string
}

interface AttendanceForm {
  bookingId: string
  playerName: string
  playerEmail: string
  status: string
  coachNotes: string
}

const STATUS_OPTIONS = ['PRESENT', 'ABSENT', 'LATE']
const EMPTY_FORM: AttendanceForm = {
  bookingId: '',
  playerName: '',
  playerEmail: '',
  status: 'PRESENT',
  coachNotes: '',
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function exportCsv(records: AttendanceRecord[]) {
  const header = 'ID,Booking ID,Player,Email,Status,Notes,Session Date'
  const rows = records.map(
    (record) =>
      `${record.id},${record.bookingId},"${record.playerName}","${record.playerEmail}",${record.status},"${record.coachNotes ?? ''}",${record.sessionDate}`,
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'attendance.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function toFormState(record: AttendanceRecord): AttendanceForm {
  return {
    bookingId: String(record.bookingId),
    playerName: record.playerName,
    playerEmail: record.playerEmail,
    status: record.status,
    coachNotes: record.coachNotes ?? '',
  }
}

export default function AdminAttendancePage() {
  const today = new Date()
  const monthAgo = new Date()
  monthAgo.setDate(today.getDate() - 30)

  const [from, setFrom] = useState(formatDateInput(monthAgo))
  const [to, setTo] = useState(formatDateInput(today))
  const [playerEmail, setPlayerEmail] = useState('')
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<AttendanceForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleSearch = async () => {
    if (!from || !to) {
      setError('Please choose both a from date and a to date.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ from, to })
      if (playerEmail.trim()) {
        params.set('playerEmail', playerEmail.trim())
      }
      const response = await api.get(`/attendance/range?${params.toString()}`)
      setRecords(response.data ?? [])
      setSearched(true)
    } catch {
      setError('Failed to load attendance records.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (record: AttendanceRecord) => {
    setForm(toFormState(record))
    setEditingId(record.id)
    setShowForm(true)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        bookingId: Number(form.bookingId),
        playerName: form.playerName,
        playerEmail: form.playerEmail,
        status: form.status,
        coachNotes: form.coachNotes,
      }
      const response = await api.post('/attendance', payload)
      const saved = response.data as AttendanceRecord
      setRecords((prev) => {
        const exists = prev.some((item) => item.id === saved.id)
        return exists ? prev.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...prev]
      })
      setSearched(true)
      resetForm()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ??
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message ??
        'Failed to save attendance record.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (record: AttendanceRecord) => {
    if (!window.confirm(`Delete attendance for ${record.playerName} on ${record.sessionDate}?`)) {
      return
    }

    setDeletingId(record.id)
    setError('')
    try {
      await api.delete(`/attendance/${record.id}`)
      setRecords((prev) => prev.filter((item) => item.id !== record.id))
      if (editingId === record.id) {
        resetForm()
      }
    } catch {
      setError('Failed to delete attendance record.')
    } finally {
      setDeletingId(null)
    }
  }

  const summary = useMemo(() => {
    const total = records.length
    const present = records.filter((record) => record.status === 'PRESENT').length
    const absent = records.filter((record) => record.status === 'ABSENT').length
    const late = records.filter((record) => record.status === 'LATE').length
    const pct = (value: number) => (total ? Math.round((value / total) * 100) : 0)
    return { total, present, absent, late, pct }
  }, [records])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">Attendance Records</h1>
          <p className="mt-1 text-sm text-gray-400">Search, create, edit, export, and delete attendance records.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
        >
          + New Attendance Record
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {showForm && (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <h2 className="mb-4 text-base font-bold text-white">
            {editingId ? `Edit Attendance #${editingId}` : 'New Attendance Record'}
          </h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Booking ID *</label>
              <input
                required
                type="number"
                min={1}
                value={form.bookingId}
                onChange={(event) => setForm({ ...form, bookingId: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Status *</label>
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Player Name *</label>
              <input
                required
                value={form.playerName}
                onChange={(event) => setForm({ ...form, playerName: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Player Email *</label>
              <input
                type="email"
                required
                value={form.playerEmail}
                onChange={(event) => setForm({ ...form, playerEmail: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-400">Coach Notes</label>
              <textarea
                rows={3}
                value={form.coachNotes}
                onChange={(event) => setForm({ ...form, coachNotes: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 flex-wrap">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Record'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400">From</label>
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400">To</label>
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400">Player Email</label>
            <input
              type="email"
              value={playerEmail}
              onChange={(event) => setPlayerEmail(event.target.value)}
              placeholder="player@example.com"
              className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            {records.length > 0 && (
              <button
                type="button"
                onClick={() => exportCsv(records)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner label="Loading records..." />}

      {searched && !loading && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total', value: summary.total, color: 'text-white' },
              { label: 'Present', value: `${summary.present} (${summary.pct(summary.present)}%)`, color: 'text-green-400' },
              { label: 'Absent', value: `${summary.absent} (${summary.pct(summary.absent)}%)`, color: 'text-red-400' },
              { label: 'Late', value: `${summary.late} (${summary.pct(summary.late)}%)`, color: 'text-yellow-400' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-zinc-900 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
                <p className={`mt-2 text-xl font-black ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {records.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center text-gray-400">
              No records found for the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 bg-zinc-900">
                  <tr>
                    {['Player', 'Email', 'Status', 'Session Date', 'Notes', 'Actions'].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-black">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white">{record.playerName}</td>
                      <td className="px-4 py-3 text-gray-400">{record.playerEmail}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            record.status === 'PRESENT'
                              ? 'bg-green-500/20 text-green-400'
                              : record.status === 'ABSENT'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{record.sessionDate}</td>
                      <td className="px-4 py-3 text-gray-500">{record.coachNotes || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => openEdit(record)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(record)}
                            disabled={deletingId === record.id}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                          >
                            {deletingId === record.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}


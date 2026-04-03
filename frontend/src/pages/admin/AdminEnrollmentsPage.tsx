import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

interface ProgramOption {
  id: number
  name: string
}

interface Enrollment {
  id: number
  programId: number
  programName: string
  playerName: string
  playerEmail: string
  parentEmail?: string
  startDate?: string
  endDate?: string
  status: string
  paymentStatus: string
  scheduleType: string
  notes?: string
  createdAt: string
}

interface EnrollmentForm {
  programId: number
  playerName: string
  playerEmail: string
  parentEmail: string
  startDate: string
  endDate: string
  scheduleType: string
  notes: string
}

const STATUS_OPTIONS = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED']
const PAYMENT_STATUSES = ['PENDING', 'SUBMITTED', 'PAID', 'FAILED', 'REFUNDED', 'NOT_REQUIRED']
const SCHEDULE_TYPES = ['ONE_TIME', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']

const EMPTY_FORM: EnrollmentForm = {
  programId: 0,
  playerName: '',
  playerEmail: '',
  parentEmail: '',
  startDate: '',
  endDate: '',
  scheduleType: 'ONE_TIME',
  notes: '',
}

function toFormState(enrollment: Enrollment): EnrollmentForm {
  return {
    programId: enrollment.programId,
    playerName: enrollment.playerName,
    playerEmail: enrollment.playerEmail,
    parentEmail: enrollment.parentEmail ?? '',
    startDate: enrollment.startDate ?? '',
    endDate: enrollment.endDate ?? '',
    scheduleType: enrollment.scheduleType,
    notes: enrollment.notes ?? '',
  }
}

export default function AdminEnrollmentsPage() {
  const [programs, setPrograms] = useState<ProgramOption[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<EnrollmentForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [workingId, setWorkingId] = useState<number | null>(null)

  const token = localStorage.getItem('token')

  useEffect(() => {
    Promise.all([
      axios.get('/api/admin/enrollments', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/programs'),
    ])
      .then(([enrollmentResponse, programResponse]) => {
        setEnrollments(enrollmentResponse.data ?? [])
        setPrograms(programResponse.data?.data ?? [])
      })
      .catch(() => setError('Failed to load enrollments.'))
      .finally(() => setLoading(false))
  }, [token])

  const filtered = useMemo(
    () => (filterStatus ? enrollments.filter((enrollment) => enrollment.status === filterStatus) : enrollments),
    [enrollments, filterStatus],
  )

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (enrollment: Enrollment) => {
    setForm(toFormState(enrollment))
    setEditingId(enrollment.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      parentEmail: form.parentEmail || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      notes: form.notes || null,
    }

    try {
      if (editingId) {
        const response = await axios.put(`/api/admin/enrollments/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setEnrollments((prev) => prev.map((item) => (item.id === editingId ? response.data : item)))
      } else {
        const response = await axios.post('/api/admin/enrollments', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setEnrollments((prev) => [response.data, ...prev])
      }
      resetForm()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ??
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message ??
        'Failed to save enrollment.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    setWorkingId(id)
    try {
      const response = await axios.patch(`/api/admin/enrollments/${id}/status?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEnrollments((prev) => prev.map((item) => (item.id === id ? response.data : item)))
    } catch {
      setError('Failed to update enrollment status.')
    } finally {
      setWorkingId(null)
    }
  }

  const updatePayment = async (id: number, paymentStatus: string) => {
    setWorkingId(id)
    try {
      const response = await axios.patch(`/api/admin/enrollments/${id}/payment?paymentStatus=${paymentStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEnrollments((prev) => prev.map((item) => (item.id === id ? response.data : item)))
    } catch {
      setError('Failed to update payment status.')
    } finally {
      setWorkingId(null)
    }
  }

  const handleDelete = async (enrollment: Enrollment) => {
    if (!window.confirm(`Delete enrollment for ${enrollment.playerName}?`)) {
      return
    }

    setWorkingId(enrollment.id)
    try {
      await axios.delete(`/api/admin/enrollments/${enrollment.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEnrollments((prev) => prev.filter((item) => item.id !== enrollment.id))
      if (editingId === enrollment.id) {
        resetForm()
      }
    } catch {
      setError('Failed to delete enrollment.')
    } finally {
      setWorkingId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading enrollments..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Enrollments</h1>
          <p className="mt-1 text-sm text-gray-400">Admin can create, update, and remove program enrollments.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
          >
            + New Enrollment
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {showForm && (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <h2 className="mb-4 text-base font-bold text-white">
            {editingId ? `Edit Enrollment #${editingId}` : 'New Enrollment'}
          </h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Program *</label>
              <select
                required
                value={form.programId || ''}
                onChange={(event) => setForm({ ...form, programId: Number(event.target.value) })}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="">Select a program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Schedule Type</label>
              <select
                value={form.scheduleType}
                onChange={(event) => setForm({ ...form, scheduleType: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
              >
                {SCHEDULE_TYPES.map((scheduleType) => (
                  <option key={scheduleType} value={scheduleType}>
                    {scheduleType}
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
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Parent Email</label>
              <input
                type="email"
                value={form.parentEmail}
                onChange={(event) => setForm({ ...form, parentEmail: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-400">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-400">Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 flex-wrap">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Enrollment'}
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

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center text-gray-400">
          No enrollments found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-zinc-900">
              <tr>
                {['Player', 'Program', 'Schedule', 'Status', 'Payment', 'Dates', 'Actions'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black">
              {filtered.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{enrollment.playerName}</p>
                    <p className="text-xs text-gray-500">{enrollment.playerEmail}</p>
                    {enrollment.parentEmail ? <p className="text-xs text-gray-500">Parent: {enrollment.parentEmail}</p> : null}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{enrollment.programName}</td>
                  <td className="px-4 py-3 text-gray-400">{enrollment.scheduleType}</td>
                  <td className="px-4 py-3">
                    <select
                      value={enrollment.status}
                      onChange={(event) => updateStatus(enrollment.id, event.target.value)}
                      disabled={workingId === enrollment.id}
                      className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={enrollment.paymentStatus}
                      onChange={(event) => updatePayment(enrollment.id, event.target.value)}
                      disabled={workingId === enrollment.id}
                      className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
                    >
                      {PAYMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <div>{enrollment.startDate || 'No start date'}</div>
                    <div>{enrollment.endDate || 'No end date'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openEdit(enrollment)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(enrollment)}
                        disabled={workingId === enrollment.id}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {workingId === enrollment.id ? 'Working...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


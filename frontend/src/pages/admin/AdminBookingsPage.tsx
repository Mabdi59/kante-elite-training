import { useEffect, useState } from 'react'
import {
  createAdminBooking,
  deleteAdminBooking,
  getAdminBookings,
  getAvailability,
  getPrograms,
  updateAdminBooking,
  updateBookingStatus,
} from '../../services/api'
import type { Booking, BookingFormData, Program } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ErrorBanner from '../../components/ErrorBanner'

const STATUS_OPTIONS = ['RESERVED', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

const emptyForm: BookingFormData = {
  programId: 0,
  bookingDate: '',
  bookingTime: '',
  playerName: '',
  playerAge: '',
  parentName: '',
  email: '',
  phone: '',
  experienceLevel: '',
  notes: '',
}

function toFormState(booking: Booking): BookingFormData {
  return {
    programId: booking.programId,
    bookingDate: booking.bookingDate,
    bookingTime: booking.bookingTime,
    playerName: booking.playerName,
    playerAge: booking.playerAge ?? '',
    parentName: booking.parentName ?? '',
    email: booking.email,
    phone: booking.phone,
    experienceLevel: booking.experienceLevel ?? '',
    notes: booking.notes ?? '',
  }
}

export default function AdminBookingsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterSearch, setFilterSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null)
  const [form, setForm] = useState<BookingFormData>(emptyForm)
  const [savingForm, setSavingForm] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [workingBookingId, setWorkingBookingId] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([getAdminBookings(), getPrograms()])
      .then(([bookingData, programData]) => {
        setBookings(bookingData)
        setPrograms(programData)
      })
      .catch(() => setError('Could not load bookings.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!form.programId || !form.bookingDate) {
      setAvailableSlots([])
      return
    }

    setLoadingSlots(true)
    getAvailability(form.programId, form.bookingDate)
      .then((availability) => setAvailableSlots(availability.availableSlots))
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [form.programId, form.bookingDate])

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus && booking.bookingStatus !== filterStatus) return false
    if (filterDate && booking.bookingDate !== filterDate) return false
    if (!filterSearch) return true
    const query = filterSearch.toLowerCase()
    return (
      booking.playerName.toLowerCase().includes(query) ||
      booking.email.toLowerCase().includes(query) ||
      booking.programName.toLowerCase().includes(query)
    )
  })

  const resetForm = () => {
    setShowForm(false)
    setEditingBookingId(null)
    setForm(emptyForm)
    setAvailableSlots([])
  }

  const openCreate = () => {
    setError('')
    setEditingBookingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (booking: Booking) => {
    setError('')
    setEditingBookingId(booking.id)
    setForm(toFormState(booking))
    setShowForm(true)
  }

  const handleSaveBooking = async (event: React.FormEvent) => {
    event.preventDefault()
    setSavingForm(true)
    setError('')

    try {
      if (editingBookingId !== null) {
        const updated = await updateAdminBooking(editingBookingId, form)
        setBookings((current) =>
          current.map((booking) => (booking.id === editingBookingId ? updated : booking)),
        )
      } else {
        const created = await createAdminBooking(form)
        setBookings((current) => [created, ...current])
      }
      resetForm()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save this booking.'
      setError(message)
    } finally {
      setSavingForm(false)
    }
  }

  const handleStatusChange = async (bookingId: number, status: string) => {
    setWorkingBookingId(bookingId)
    setError('')
    try {
      const updated = await updateBookingStatus(bookingId, status)
      setBookings((current) => current.map((booking) => (booking.id === bookingId ? updated : booking)))
    } catch {
      setError('Could not update the booking status.')
    } finally {
      setWorkingBookingId(null)
    }
  }

  const handleDelete = async (booking: Booking) => {
    if (!window.confirm(`Delete the booking for ${booking.playerName}? This cannot be undone.`)) {
      return
    }

    setWorkingBookingId(booking.id)
    setError('')
    try {
      await deleteAdminBooking(booking.id)
      setBookings((current) => current.filter((item) => item.id !== booking.id))
      if (editingBookingId === booking.id) {
        resetForm()
      }
    } catch {
      setError('Could not delete the booking.')
    } finally {
      setWorkingBookingId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading bookings..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Bookings</h1>
          <p className="text-gray-400 text-sm mt-2">
            Admin can create, edit, cancel, complete, and delete bookings from one place.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a
            href="/api/admin/bookings/export.csv"
            download="bookings.csv"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
          >
            ↓ Export CSV
          </a>
          <button
            onClick={() => (showForm && editingBookingId === null ? resetForm() : openCreate())}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-lg text-sm"
          >
            {showForm && editingBookingId === null ? 'Close Booking Form' : 'Create Booking'}
          </button>
        </div>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      {showForm ? (
        <form onSubmit={handleSaveBooking} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white text-xl font-bold">
            {editingBookingId === null ? 'New Booking' : `Edit Booking #${editingBookingId}`}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Program</label>
              <select
                required
                value={form.programId || ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    programId: Number(event.target.value),
                    bookingTime: '',
                  }))
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
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
              <label className="block text-gray-400 text-sm mb-1">Booking Date</label>
              <input
                type="date"
                required
                value={form.bookingDate}
                onChange={(event) => setForm((current) => ({ ...current, bookingDate: event.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Booking Time</label>
              <input
                type="text"
                required
                value={form.bookingTime}
                onChange={(event) => setForm((current) => ({ ...current, bookingTime: event.target.value }))}
                placeholder="Example: 4:00 PM"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
              <div className="mt-3">
                {loadingSlots ? (
                  <p className="text-gray-500 text-xs">Loading available times...</p>
                ) : availableSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, bookingTime: slot }))}
                        className={`px-3 py-1.5 rounded-full text-xs border ${
                          form.bookingTime === slot
                            ? 'bg-amber-500 text-black border-amber-500'
                            : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-amber-500'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : form.programId && form.bookingDate ? (
                  <p className="text-gray-500 text-xs">
                    No suggested slots found for that date. You can still enter a time manually.
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Player Name</label>
              <input
                required
                value={form.playerName}
                onChange={(event) => setForm((current) => ({ ...current, playerName: event.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Player Age</label>
              <input
                value={form.playerAge}
                onChange={(event) => setForm((current) => ({ ...current, playerAge: event.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Parent Name</label>
              <input
                value={form.parentName}
                onChange={(event) => setForm((current) => ({ ...current, parentName: event.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Phone</label>
              <input
                required
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Experience Level</label>
              <input
                value={form.experienceLevel}
                onChange={(event) =>
                  setForm((current) => ({ ...current, experienceLevel: event.target.value }))
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              type="submit"
              disabled={savingForm}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {savingForm ? 'Saving...' : editingBookingId === null ? 'Create Booking' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search player, email, or program..."
          value={filterSearch}
          onChange={(event) => setFilterSearch(event.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:border-amber-500"
        />
        <select
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(event) => setFilterDate(event.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <p className="text-gray-500 text-sm">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </p>

      {filteredBookings.length === 0 ? (
        <EmptyState
          icon="B"
          title="No bookings found"
          description="Try adjusting the filters or create a new booking."
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isWorking = workingBookingId === booking.id
            return (
              <div key={booking.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[16rem]">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <p className="text-white font-semibold">{booking.playerName}</p>
                      {booking.playerAge ? (
                        <span className="text-gray-500 text-xs bg-gray-800 px-2 py-0.5 rounded-full">
                          Age {booking.playerAge}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-gray-300 text-sm">{booking.programName}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {booking.bookingDate} at {booking.bookingTime}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>{booking.email}</span>
                      <span>{booking.phone}</span>
                      {booking.parentName ? <span>{booking.parentName}</span> : null}
                    </div>
                    {booking.notes ? (
                      <p className="text-gray-500 text-sm mt-2 italic">Notes: {booking.notes}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-3">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={booking.bookingStatus} />
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          booking.paymentStatus === 'PAID'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : booking.paymentStatus === 'PENDING'
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              : booking.paymentStatus === 'FAILED'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : booking.paymentStatus === 'REFUNDED'
                                  ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                  : 'bg-gray-700/40 text-gray-500 border-gray-700/30'
                        }`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openEdit(booking)}
                        className="text-amber-500 hover:text-amber-300 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(booking)}
                        disabled={isWorking}
                        className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(booking.id, status)}
                      disabled={isWorking || booking.bookingStatus === status}
                      className={`text-sm font-semibold px-3 py-2 rounded-lg disabled:opacity-50 ${
                        status === 'CONFIRMED'
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : status === 'COMPLETED'
                            ? 'bg-green-600 hover:bg-green-500 text-white'
                            : status === 'CANCELLED'
                              ? 'bg-red-700 hover:bg-red-600 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {isWorking ? 'Saving...' : status}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

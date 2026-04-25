import { useEffect, useState } from 'react'
import {
  createStaffBooking,
  getAvailability,
  getPrograms,
  getStaffBookings,
  rescheduleStaffBooking,
  updateStaffBookingStatus,
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

export default function StaffBookingsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterSearch, setFilterSearch] = useState('')

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [form, setForm] = useState<BookingFormData>(emptyForm)
  const [savingCreate, setSavingCreate] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [workingBookingId, setWorkingBookingId] = useState<number | null>(null)
  const [editingRescheduleId, setEditingRescheduleId] = useState<number | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')

  useEffect(() => {
    Promise.all([getStaffBookings(), getPrograms()])
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
    if (filterSearch) {
      const query = filterSearch.toLowerCase()
      return (
        booking.playerName.toLowerCase().includes(query) ||
        booking.email.toLowerCase().includes(query) ||
        booking.programName.toLowerCase().includes(query)
      )
    }
    return true
  })

  const handleCreateBooking = async (event: React.FormEvent) => {
    event.preventDefault()
    setSavingCreate(true)
    setError('')

    try {
      const created = await createStaffBooking(form)
      setBookings((current) => [created, ...current])
      setForm(emptyForm)
      setAvailableSlots([])
      setShowCreateForm(false)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not create the booking.'
      setError(message)
    } finally {
      setSavingCreate(false)
    }
  }

  const handleStatusChange = async (bookingId: number, status: string) => {
    setWorkingBookingId(bookingId)
    setError('')

    try {
      const updated = await updateStaffBookingStatus(bookingId, status)
      setBookings((current) => current.map((booking) => (booking.id === bookingId ? updated : booking)))
    } catch {
      setError('Could not update the booking status.')
    } finally {
      setWorkingBookingId(null)
    }
  }

  const openReschedule = (booking: Booking) => {
    setEditingRescheduleId(booking.id)
    setNewDate(booking.bookingDate)
    setNewTime(booking.bookingTime)
  }

  const closeReschedule = () => {
    setEditingRescheduleId(null)
    setNewDate('')
    setNewTime('')
  }

  const handleReschedule = async (bookingId: number) => {
    if (!newDate.trim() || !newTime.trim()) {
      setError('Please enter both a date and time.')
      return
    }

    setWorkingBookingId(bookingId)
    setError('')

    try {
      const updated = await rescheduleStaffBooking(bookingId, newDate, newTime)
      setBookings((current) => current.map((booking) => (booking.id === bookingId ? updated : booking)))
      closeReschedule()
    } catch {
      setError('Could not reschedule the booking.')
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
            Create bookings, update status, and reschedule sessions for families.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm((value) => !value)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-lg text-sm"
        >
          {showCreateForm ? 'Close Booking Form' : 'Create Booking'}
        </button>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      {showCreateForm ? (
        <form onSubmit={handleCreateBooking} className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <h2 className="text-white text-xl font-bold">Quick Booking</h2>

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
                className="input-field-default"
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
                className="input-field-default"
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
                className="input-field-default"
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
                            : 'bg-[#1a1a1a] text-gray-300 border-gray-700 hover:border-amber-500'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : form.programId && form.bookingDate ? (
                  <p className="text-gray-500 text-xs">No suggested slots found for that date.</p>
                ) : null}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Player Name</label>
              <input
                required
                value={form.playerName}
                onChange={(event) => setForm((current) => ({ ...current, playerName: event.target.value }))}
                className="input-field-default"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Player Age</label>
              <input
                value={form.playerAge}
                onChange={(event) => setForm((current) => ({ ...current, playerAge: event.target.value }))}
                className="input-field-default"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Parent Name</label>
              <input
                value={form.parentName}
                onChange={(event) => setForm((current) => ({ ...current, parentName: event.target.value }))}
                className="input-field-default"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="input-field-default"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Phone</label>
              <input
                required
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="input-field-default"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Experience Level</label>
              <input
                value={form.experienceLevel}
                onChange={(event) =>
                  setForm((current) => ({ ...current, experienceLevel: event.target.value }))
                }
                className="input-field-default"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                className="input-field-default resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={savingCreate}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {savingCreate ? 'Saving...' : 'Create Booking'}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm)
                setAvailableSlots([])
                setShowCreateForm(false)
              }}
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
          className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:border-amber-500"
        />
        <select
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value)}
          className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-lg px-3 py-2 text-sm"
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
          className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-lg px-3 py-2 text-sm"
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
            const isRescheduling = editingRescheduleId === booking.id

            return (
              <div key={booking.id} className="bg-[#111] border border-[#222] rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[16rem]">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <p className="text-white font-semibold">{booking.playerName}</p>
                      {booking.playerAge ? (
                        <span className="text-gray-500 text-xs bg-[#1a1a1a] px-2 py-0.5 rounded-full">
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
                    <StatusBadge status={booking.bookingStatus} />
                    <button
                      onClick={() => (isRescheduling ? closeReschedule() : openReschedule(booking))}
                      className="text-amber-500 hover:text-amber-400 text-sm font-medium"
                    >
                      {isRescheduling ? 'Close Reschedule' : 'Reschedule'}
                    </button>
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
                            ? 'bg-amber-500 hover:bg-amber-400 text-white'
                            : status === 'CANCELLED'
                              ? 'bg-red-700 hover:bg-red-600 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {isWorking ? 'Saving...' : status}
                    </button>
                  ))}
                </div>

                {isRescheduling ? (
                  <div className="bg-[#1a1a1a] rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="date"
                      value={newDate}
                      onChange={(event) => setNewDate(event.target.value)}
                      className="bg-[#111] border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={newTime}
                      onChange={(event) => setNewTime(event.target.value)}
                      placeholder="New time"
                      className="bg-[#111] border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => handleReschedule(booking.id)}
                      disabled={isWorking}
                      className="btn-primary disabled:opacity-50"
                    >
                      {isWorking ? 'Saving...' : 'Save New Time'}
                    </button>
                    <button
                      onClick={closeReschedule}
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

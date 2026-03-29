import { useEffect, useState } from 'react'
import { getAdminBookings, updateBookingStatus } from '../../services/api'
import type { Booking } from '../../types'

const STATUS_OPTIONS = ['RESERVED', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

const statusColor: Record<string, string> = {
  CONFIRMED: 'text-green-400',
  RESERVED: 'text-yellow-400',
  CANCELLED: 'text-red-400',
  COMPLETED: 'text-blue-400',
}

function exportCsv(bookings: Booking[]) {
  const header = 'ID,Player,Program,Date,Time,Email,Status'
  const rows = bookings.map(
    (b) =>
      `${b.id},"${b.playerName}","${b.programName}",${b.bookingDate},${b.bookingTime},"${b.email}",${b.bookingStatus}`,
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bookings.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  // Filters
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterSearch, setFilterSearch] = useState('')

  useEffect(() => {
    getAdminBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (id: number, status: string) => {
    setUpdating(id)
    try {
      const updated = await updateBookingStatus(id, status)
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)))
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  const filtered = bookings.filter((b) => {
    if (filterStatus && b.bookingStatus !== filterStatus) return false
    if (filterDate && b.bookingDate !== filterDate) return false
    if (filterSearch) {
      const q = filterSearch.toLowerCase()
      if (
        !b.playerName.toLowerCase().includes(q) &&
        !b.email.toLowerCase().includes(q) &&
        !b.programName.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  if (loading) return <div className="text-gray-400">Loading bookings…</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-white text-3xl font-black">Bookings</h1>
        <button
          onClick={() => exportCsv(filtered)}
          className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg px-4 py-2 transition-colors"
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search player / email / program…"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:border-green-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
        />
        {(filterStatus || filterDate || filterSearch) && (
          <button
            onClick={() => { setFilterStatus(''); setFilterDate(''); setFilterSearch('') }}
            className="text-sm text-gray-500 hover:text-gray-300 px-2"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-gray-500 text-sm mb-4">
        Showing {filtered.length} of {bookings.length} bookings
      </p>

      {filtered.length === 0 ? (
        <p className="text-gray-400">No bookings match your filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800 text-left">
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">Player</th>
                <th className="pb-3 pr-4">Program</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((b) => (
                <tr key={b.id} className="text-gray-300">
                  <td className="py-3 pr-4 text-gray-500">#{b.id}</td>
                  <td className="py-3 pr-4 font-medium text-white">{b.playerName}</td>
                  <td className="py-3 pr-4">{b.programName}</td>
                  <td className="py-3 pr-4">{b.bookingDate}</td>
                  <td className="py-3 pr-4">{b.bookingTime}</td>
                  <td className="py-3 pr-4 text-gray-400">{b.email}</td>
                  <td className={`py-3 pr-4 font-semibold ${statusColor[b.bookingStatus] ?? 'text-gray-400'}`}>
                    {b.bookingStatus}
                  </td>
                  <td className="py-3">
                    <select
                      value={b.bookingStatus}
                      disabled={updating === b.id}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-gray-300 rounded px-2 py-1 text-xs"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
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

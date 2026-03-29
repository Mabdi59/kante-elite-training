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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

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

  if (loading) return <div className="text-gray-400">Loading bookings…</div>

  return (
    <div>
      <h1 className="text-white text-3xl font-black mb-8">Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-400">No bookings yet.</p>
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
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {bookings.map((b) => (
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

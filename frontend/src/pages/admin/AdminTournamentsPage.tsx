import { useEffect, useState } from 'react'
import {
  getAdminTournaments,
  deleteTournament,
  getTournamentRegistrations,
  updateRegistrationStatus,
} from '../../services/api'
import type { Tournament, TeamRegistration } from '../../types'

const statusColor: Record<string, string> = {
  PENDING: 'text-yellow-400',
  APPROVED: 'text-green-400',
  REJECTED: 'text-red-400',
  WAITLISTED: 'text-gray-400',
}

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null)
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([])
  const [regLoading, setRegLoading] = useState(false)

  useEffect(() => {
    getAdminTournaments()
      .then(setTournaments)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadRegistrations = async (id: number) => {
    if (selectedTournament === id) {
      setSelectedTournament(null)
      return
    }
    setSelectedTournament(id)
    setRegLoading(true)
    try {
      const regs = await getTournamentRegistrations(id)
      setRegistrations(regs)
    } catch (err) {
      console.error(err)
    } finally {
      setRegLoading(false)
    }
  }

  const handleRegStatusChange = async (regId: number, status: string) => {
    try {
      const updated = await updateRegistrationStatus(regId, status)
      setRegistrations((prev) => prev.map((r) => (r.id === regId ? updated : r)))
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteTournament = async (id: number) => {
    if (!window.confirm('Delete this tournament?')) return
    try {
      await deleteTournament(id)
      setTournaments((prev) => prev.filter((t) => t.id !== id))
      if (selectedTournament === id) setSelectedTournament(null)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="text-gray-400">Loading tournaments…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-white text-3xl font-black">Tournaments</h1>
        <p className="text-gray-400 text-sm">POST /api/tournaments to create</p>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-gray-400">No tournaments yet.</p>
      ) : (
        <div className="space-y-4">
          {tournaments.map((t) => (
            <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-bold">{t.name}</h3>
                    <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
                      {t.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {t.location} · {t.startDate}
                    {t.endDate ? ` – ${t.endDate}` : ''}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {t.registeredTeams} / {t.maxTeams} teams registered
                  </p>
                </div>
                <div className="flex gap-3 ml-4">
                  <button
                    onClick={() => loadRegistrations(t.id)}
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    {selectedTournament === t.id ? 'Hide' : 'Registrations'}
                  </button>
                  <button
                    onClick={() => handleDeleteTournament(t.id)}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {selectedTournament === t.id && (
                <div className="border-t border-gray-800 p-5">
                  {regLoading ? (
                    <p className="text-gray-400 text-sm">Loading…</p>
                  ) : registrations.length === 0 ? (
                    <p className="text-gray-500 text-sm">No registrations yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-500 text-left border-b border-gray-800">
                            <th className="pb-2 pr-4">Team</th>
                            <th className="pb-2 pr-4">Captain</th>
                            <th className="pb-2 pr-4">Email</th>
                            <th className="pb-2 pr-4">Status</th>
                            <th className="pb-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {registrations.map((r) => (
                            <tr key={r.id} className="text-gray-300">
                              <td className="py-2 pr-4 font-medium text-white">{r.teamName}</td>
                              <td className="py-2 pr-4">{r.captainName}</td>
                              <td className="py-2 pr-4 text-gray-400">{r.contactEmail}</td>
                              <td className={`py-2 pr-4 font-semibold ${statusColor[r.status] ?? 'text-gray-400'}`}>
                                {r.status}
                              </td>
                              <td className="py-2">
                                <select
                                  value={r.status}
                                  onChange={(e) => handleRegStatusChange(r.id, e.target.value)}
                                  className="bg-gray-800 border border-gray-700 text-gray-300 rounded px-2 py-1 text-xs"
                                >
                                  {['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'].map((s) => (
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

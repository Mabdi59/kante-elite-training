import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getMyCoachProfile, getMyCoachSessions } from '../../services/api'
import type { CoachProfile, Booking } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatusBadge from '../../components/StatusBadge'

export default function CoachDashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<CoachProfile | null>(null)
  const [sessions, setSessions] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getMyCoachProfile().catch(() => null),
      getMyCoachSessions().catch(() => []),
    ]).then(([p, s]) => {
      setProfile(p)
      setSessions(s)
      setLoading(false)
    })
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const upcoming = sessions.filter((s) => s.bookingDate >= today && s.bookingStatus !== 'CANCELLED')
  const past = sessions.filter((s) => s.bookingDate < today)

  if (loading) return <LoadingSpinner label="Loading…" />

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-white text-3xl font-black">Hi, {user?.name?.split(' ')[0]}</h1>
          <p className="text-gray-400 mt-1">Here's what's coming up.</p>
        </div>
        {!profile && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 text-yellow-400 text-sm">
            No coach profile found. Ask an admin to set one up.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Coming up</p>
          <p className="text-4xl font-black text-blue-400">{upcoming.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Past sessions</p>
          <p className="text-4xl font-black text-gray-400">{past.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">All time</p>
          <p className="text-4xl font-black text-green-400">{sessions.length}</p>
        </div>
      </div>

      {profile && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white text-xl font-bold mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {profile.bio && (
              <div>
                <p className="text-gray-500 mb-1">Bio</p>
                <p className="text-gray-300">{profile.bio}</p>
              </div>
            )}
            {profile.specialties && (
              <div>
                <p className="text-gray-500 mb-1">Specialties</p>
                <p className="text-gray-300">{profile.specialties}</p>
              </div>
            )}
            {profile.certifications && (
              <div>
                <p className="text-gray-500 mb-1">Certifications</p>
                <p className="text-gray-300">{profile.certifications}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white text-xl font-bold mb-4">Upcoming Sessions</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500 text-sm">Nothing scheduled yet.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 10).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">{s.playerName}</p>
                  <p className="text-gray-400 text-sm">
                    {s.programName} · {s.bookingDate} at {s.bookingTime}
                  </p>
                  {s.email && <p className="text-gray-500 text-xs">{s.email}</p>}
                </div>
                <StatusBadge status={s.bookingStatus} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
    document.title = 'Coach Dashboard | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

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
        <div className="flex flex-wrap gap-2">
          <Link
            to="/coach/sessions"
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Manage Sessions
          </Link>
          <Link
            to="/coach/availability"
            className="bg-[#1a1a1a] hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Manage Availability
          </Link>
          <Link
            to="/coach/profile"
            className="bg-[#1a1a1a] hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Coming up</p>
          <p className="text-4xl font-black text-blue-400">{upcoming.length}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Past sessions</p>
          <p className="text-4xl font-black text-gray-400">{past.length}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">All time</p>
          <p className="text-4xl font-black text-amber-500">{sessions.length}</p>
        </div>
      </div>

      {profile && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
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

      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="text-white text-xl font-bold mb-4">Upcoming Sessions</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500 text-sm">Nothing scheduled yet.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 10).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
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

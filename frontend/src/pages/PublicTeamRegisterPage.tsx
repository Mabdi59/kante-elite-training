import { useEffect, useState, type FormEvent } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getTournamentById, registerTeam } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Tournament } from '../types'

export default function PublicTeamRegisterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [teamName, setTeamName] = useState('')
  const [captainName, setCaptainName] = useState(user?.name ?? '')
  const [contactEmail, setContactEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState('')
  const [clubName, setClubName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingTournament, setLoadingTournament] = useState(true)
  const redirectQuery = id ? `?intent=tournament&redirect=${encodeURIComponent(`/tournaments/${id}/register`)}` : ''
  const portalPath =
    user?.role === 'ADMIN'
      ? '/admin/tournaments'
      : user?.role === 'TEAM_CAPTAIN' || user?.role === 'COACH'
        ? '/captain/registrations'
        : user?.role === 'PARENT'
          ? '/parent'
          : user?.role === 'PLAYER'
            ? '/player'
            : user?.role === 'USER'
              ? '/user'
              : null

  useEffect(() => {
    if (!id) {
      setLoadingTournament(false)
      setError('Tournament not found.')
      return
    }

    getTournamentById(Number(id))
      .then(setTournament)
      .catch(() => setError('Could not load tournament details.'))
      .finally(() => setLoadingTournament(false))
  }, [id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!id) return

    setError('')
    setLoading(true)
    try {
      const registration = await registerTeam({
        teamName,
        captainName,
        contactEmail,
        phone,
        clubName,
        tournamentId: Number(id),
      })
      if (registration.publicAccessUrl) {
        const publicPath = new URL(registration.publicAccessUrl, window.location.origin)
        navigate(`${publicPath.pathname}${publicPath.search ? `${publicPath.search}&new=1` : '?new=1'}`)
        return
      }
      if (registration.guestAccessToken) {
        navigate(`/tournaments/registration/${registration.guestAccessToken}?new=1`)
        return
      }
      setError('Registration was created, but we could not open your registration dashboard.')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black px-4 py-20">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-4 mb-8">
          <Link to="/tournaments" className="text-gray-400 text-sm hover:text-white">
            Back to Tournaments
          </Link>
          {portalPath ? (
            <Link to={portalPath} className="text-orange-400 text-sm hover:text-orange-300">
              Back to Team Portal
            </Link>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
          <div>
            <span className="section-label">Tournament Registration</span>
            <h1 className="text-white text-4xl md:text-5xl font-black mt-3 mb-4">
              Register Your Team
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-xl">
              Sign in with any account, submit your entry, and manage payment, roster, and updates from your registration dashboard.
            </p>

            {error ? (
              <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-red-400 text-sm mt-6">
                {error}
              </div>
            ) : null}

            {!user ? (
              <div className="bg-[#111] border border-[#222] rounded-2xl p-8 mt-8 space-y-5">
                <h2 className="text-white text-2xl font-black">Start With Your Account</h2>
                <p className="text-gray-400 leading-relaxed">
                  Create an account or sign in first. We will take you straight into team registration and save everything in your registration dashboard.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to={`/register${redirectQuery}`} className="btn-primary text-center">
                    Create Account
                  </Link>
                  <Link to={`/login${redirectQuery}`} className="btn-secondary text-center">
                    Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-[#111] border border-[#222] rounded-2xl p-8 space-y-6 mt-8"
              >
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Team Name</label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="input-field-default"
                    placeholder="Your team name"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Captain or Coach Name</label>
                  <input
                    type="text"
                    required
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    className="input-field-default"
                    placeholder="Team captain or coach"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="input-field-default"
                    placeholder="captain@email.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field-default"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Club Name</label>
                    <input
                      type="text"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      className="input-field-default"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || loadingTournament || !tournament}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register Team'}
                </button>
              </form>
            )}
          </div>

          <aside className="lg:pt-14">
            <div className="bg-[#111] border border-[#222] rounded-2xl p-6 sticky top-24">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
                Tournament Details
              </p>

              {loadingTournament ? (
                <p className="text-gray-400 text-sm">Loading tournament details...</p>
              ) : tournament ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-white text-2xl font-black">{tournament.name}</h2>
                    <p className="text-gray-400 text-sm mt-1">{tournament.location}</p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Date</span>
                      <span className="text-white text-right">
                        {tournament.startDate}
                        {tournament.endDate ? ` to ${tournament.endDate}` : ''}
                      </span>
                    </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Teams</span>
                    <span className="text-white text-right">
                        {tournament.registeredTeams} / {tournament.maxTeams}
                      </span>
                    </div>
                    {tournament.ageGroup ? (
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Age Group</span>
                        <span className="text-white text-right">{tournament.ageGroup}</span>
                      </div>
                    ) : null}
                    {tournament.division ? (
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Division</span>
                        <span className="text-white text-right">{tournament.division}</span>
                      </div>
                    ) : null}
                    {tournament.registrationDeadline ? (
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Deadline</span>
                        <span className="text-white text-right">{tournament.registrationDeadline}</span>
                      </div>
                    ) : null}
                    {(tournament.entryFee ?? 0) > 0 ? (
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Entry Fee</span>
                        <span className="text-white text-right">${tournament.entryFee}</span>
                      </div>
                    ) : null}
                  </div>

                  {tournament.description ? (
                    <p className="text-gray-400 text-sm leading-relaxed border-t border-[#1f1f1f] pt-4">
                      {tournament.description}
                    </p>
                  ) : null}

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-amber-400 text-sm font-semibold">
                      Team registration is open. Submit your team details here, then manage everything from your registration dashboard.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  We could not load this tournament right now. Please go back to the tournament list and try again.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

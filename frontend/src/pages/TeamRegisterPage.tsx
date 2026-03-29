import { useState, type FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { registerTeam } from '../services/api'

export default function TeamRegisterPage() {
  const { id } = useParams<{ id: string }>()
  const [teamName, setTeamName] = useState('')
  const [captainName, setCaptainName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!id) return
    setError('')
    setLoading(true)
    try {
      await registerTeam({
        teamName,
        captainName,
        contactEmail,
        tournamentId: Number(id),
      })
      setSuccess(true)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-white text-3xl font-black mb-4">Registration Submitted!</h1>
          <p className="text-gray-400 mb-8">
            Your team has been registered. You'll hear back soon.
          </p>
          <Link to="/tournaments" className="btn-primary">
            View All Tournaments
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/tournaments" className="text-gray-400 text-sm hover:text-white">
            ← Back to Tournaments
          </Link>
          <h1 className="text-white text-3xl font-black mt-4">Register Your Team</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6"
        >
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm mb-2">Team Name</label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              placeholder="Your team name"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Captain Name</label>
            <input
              type="text"
              required
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              placeholder="Team captain's name"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Contact Email</label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              placeholder="captain@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Registering…' : 'Register Team'}
          </button>
        </form>
      </div>
    </div>
  )
}

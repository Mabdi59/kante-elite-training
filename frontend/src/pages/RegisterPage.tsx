import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { register } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { AuthUser, UserRole } from '../types'

export default function RegisterPage() {
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const requestedRole = (searchParams.get('requestedRole') as UserRole | null) ?? undefined
  const isTournamentIntent = searchParams.get('intent') === 'tournament'
  const redirectPath = useMemo(() => {
    const redirect = searchParams.get('redirect')
    return redirect && redirect.startsWith('/') ? redirect : null
  }, [searchParams])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await register(name, email, password, requestedRole)
      const user: AuthUser = { email: res.email, name: res.name, role: res.role }
      loginUser(res.token, res.refreshToken, user)
      if (redirectPath) {
        navigate(redirectPath)
      } else if (res.role === 'TEAM_CAPTAIN') {
        navigate('/captain')
      } else if (res.role === 'COACH') {
        navigate('/coach')
      } else if (res.role === 'ADMIN') {
        navigate('/admin')
      } else if (res.role === 'STAFF') {
        navigate('/staff')
      } else if (res.role === 'PLAYER') {
        navigate('/player')
      } else if (res.role === 'PARENT') {
        navigate('/parent')
      } else if (res.role === 'USER') {
        navigate('/user')
      } else {
        navigate('/')
      }
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
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black text-white">
            KANTÉ ELITE
          </Link>
          <p className="text-gray-400 mt-2">
            {isTournamentIntent ? 'Create your team manager account' : 'Create your account'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6"
        >
          <h1 className="text-white text-2xl font-bold">Register</h1>

          {isTournamentIntent ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-300 text-sm">
              This account will be set up for tournament team management so you can register and manage your team right away.
            </div>
          ) : null}

          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-gray-500 text-sm text-center">
            Already have an account?{' '}
            <Link
              to={
                isTournamentIntent
                  ? `/login?intent=tournament&requestedRole=${requestedRole ?? 'TEAM_CAPTAIN'}${
                      redirectPath ? `&redirect=${encodeURIComponent(redirectPath)}` : ''
                    }`
                  : '/login'
              }
              className="text-green-400 hover:text-green-300"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

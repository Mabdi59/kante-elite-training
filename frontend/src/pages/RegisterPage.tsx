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
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-0.5">
            <span className="text-2xl font-black tracking-tight text-white">KANTÉ ELITE</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-500">Training</span>
          </Link>
          <p className="text-gray-400 mt-4 text-sm">
            {isTournamentIntent ? 'Create your team manager account' : 'Create your account'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#111] border border-[#222] rounded-2xl p-8 space-y-5"
        >
          <div>
            <h1 className="text-white text-xl font-black">Get started</h1>
            <p className="text-gray-500 text-sm mt-1">Create a free account in seconds.</p>
          </div>

          {isTournamentIntent ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-amber-300 text-sm leading-relaxed">
              This account will be set up for tournament team management so you can register and manage your team right away.
            </div>
          ) : null}

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3.5 text-red-400 text-sm flex items-start gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field-default"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field-default"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field-default"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin -ml-1 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account…
              </>
            ) : 'Create Account'}
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
              className="text-amber-500 hover:text-amber-400 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

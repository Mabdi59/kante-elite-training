import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resetPassword } from '../services/api'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await resetPassword(token.trim(), newPassword)
      navigate('/login', { state: { message: 'Password reset successful. Please log in.' } })
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Invalid or expired token. Please request a new one.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-black text-white tracking-wider">
            KANTÉ ELITE
          </Link>
          <h1 className="text-white text-3xl font-black mt-6 mb-2">Reset Password</h1>
          <p className="text-gray-400">Enter your reset code and choose a new password.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-4"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Reset Code</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 font-mono text-sm"
              placeholder="Paste the code from your email"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>

          <p className="text-center text-gray-500 text-sm">
            <Link to="/forgot-password" className="text-green-400 hover:text-green-300">
              Get a new code
            </Link>
            {' · '}
            <Link to="/login" className="text-green-400 hover:text-green-300">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

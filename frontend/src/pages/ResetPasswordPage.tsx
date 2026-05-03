import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
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
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex">
            <BrandMark size="auth" showText />
          </Link>
          <h1 className="text-white text-3xl font-black mt-6 mb-2">Reset Password</h1>
          <p className="text-gray-400 text-sm">Enter your reset code and choose a new password.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#111] border border-[#222] rounded-2xl p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3.5 text-red-400 text-sm flex items-start gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase mb-2">Reset Code</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="input-field-default font-mono text-sm"
              placeholder="Paste the code from your email"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="input-field-default"
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input-field-default"
              placeholder="Repeat password"
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
                Resetting…
              </>
            ) : 'Reset Password'}
          </button>

          <p className="text-center text-gray-500 text-sm">
            <Link to="/forgot-password" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
              Get a new code
            </Link>
            {' · '}
            <Link to="/login" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
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
          <h1 className="text-white text-3xl font-black mt-6 mb-2">Forgot Password</h1>
          <p className="text-gray-400">Enter your email and we'll send a reset token.</p>
        </div>

        {submitted ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-green-400 font-semibold mb-2">Check your email</p>
            <p className="text-gray-400 text-sm">
              If that email is registered, we've sent a password reset token. Check your inbox.
            </p>
            <Link
              to="/reset-password"
              className="inline-block mt-4 text-green-400 underline text-sm"
            >
              Enter reset token →
            </Link>
          </div>
        ) : (
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
              <label className="block text-gray-300 text-sm font-medium mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending…' : 'Send Reset Token'}
            </button>

            <p className="text-center text-gray-500 text-sm">
              <Link to="/login" className="text-green-400 hover:text-green-300">
                Back to Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

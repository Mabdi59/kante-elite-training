import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/api'
import type { ForgotPasswordResult } from '../types'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<ForgotPasswordResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const nextResult = await forgotPassword(email)
      setResult(nextResult)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
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
          <h1 className="text-white text-3xl font-black mt-6 mb-2">Forgot Password</h1>
          <p className="text-gray-400 text-sm">Enter your email and we will guide you through the next step.</p>
        </div>

        {submitted ? (
          <div className="bg-[#111] border border-[#222] rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="text-white font-black text-xl mb-2">
              {result?.emailDeliveryAvailable ? 'Check your inbox' : 'Next steps'}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              {result?.message ?? 'If that email is registered, a reset link has been sent.'}
            </p>
            {result?.emailDeliveryAvailable ? (
              <Link
                to="/reset-password"
                className="inline-block mt-5 text-amber-500 hover:text-amber-400 text-sm font-semibold transition-colors"
              >
                Enter your reset code →
              </Link>
            ) : (
              <Link
                to="/contact"
                className="inline-block mt-5 text-amber-500 hover:text-amber-400 text-sm font-semibold transition-colors"
              >
                Contact support →
              </Link>
            )}
          </div>
        ) : (
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
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field-default"
                placeholder="you@example.com"
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
                  Sending…
                </>
              ) : 'Send reset link'}
            </button>

            <p className="text-center text-gray-500 text-sm">
              <Link to="/login" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
                Back to Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

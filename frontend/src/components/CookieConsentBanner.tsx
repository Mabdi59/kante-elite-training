import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'kante_cookie_consent'

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show banner only if consent hasn't been given yet
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Small delay so the page renders first
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="false"
      className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 sm:pb-6 animate-slide-up"
    >
      <div className="max-w-3xl mx-auto sm:mx-0 sm:max-w-lg bg-[#111] border border-[#2a2a2a] rounded-2xl shadow-2xl shadow-black/60 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Cookies &amp; Privacy</p>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              We use essential cookies to keep the site running and optional analytics cookies to improve your experience. Read our{' '}
              <Link to="/cookie-policy" className="text-amber-500 hover:text-amber-400 transition-colors" onClick={accept}>
                Cookie Policy
              </Link>{' '}
              for details.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={accept}
            className="flex-1 btn-primary justify-center py-2.5 text-sm"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={decline}
            className="flex-1 btn-secondary justify-center py-2.5 text-sm"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  )
}

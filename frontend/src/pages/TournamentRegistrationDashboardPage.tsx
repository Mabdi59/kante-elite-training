import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  createTournamentPaymentCheckout,
  getPublicTournamentRegistration,
  submitTournamentManualPayment,
  submitTournamentRoster,
} from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { TournamentRegistrationDashboard } from '../types'
import ErrorBanner from '../components/ErrorBanner'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'

const PAYMENT_METHODS = ['Card', 'Cash App', 'Zelle', 'Venmo', 'Cash', 'Bank Transfer']

export default function TournamentRegistrationDashboardPage() {
  const { token } = useParams<{ token: string }>()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<TournamentRegistrationDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [rosterText, setRosterText] = useState('')
  const [rosterFile, setRosterFile] = useState<File | null>(null)
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [submittingRoster, setSubmittingRoster] = useState(false)
  const [submittingPayment, setSubmittingPayment] = useState(false)
  const [creatingCheckout, setCreatingCheckout] = useState(false)
  const portalPath =
    user?.role === 'ADMIN'
      ? '/admin/tournaments'
      : user?.role === 'TEAM_CAPTAIN' || user?.role === 'COACH'
        ? '/captain/registrations'
        : null
  const loginPath = token
    ? `/login?intent=tournament&requestedRole=TEAM_CAPTAIN&redirect=${encodeURIComponent(`/tournaments/registration/${token}`)}`
    : '/login'

  useEffect(() => {
    if (!token) {
      setError('Registration link not found.')
      setLoading(false)
      return
    }

    getPublicTournamentRegistration(token)
      .then((data) => {
        setDashboard(data)
        setRosterText(data.rosterText ?? '')
      })
      .catch((err: unknown) => {
        const message =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          'We could not load this registration workspace.'
        setError(message)
      })
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    const paymentState = searchParams.get('payment')
    const isNewRegistration = searchParams.get('new')
    if (isNewRegistration === '1') {
      setNotice('Registration received. Your Team Portal is now ready for payment, roster, and status updates.')
    } else if (paymentState === 'processing') {
      setNotice('Your payment was submitted. We are confirming it now.')
    } else if (paymentState === 'cancelled') {
      setNotice('Payment was cancelled. You can try again whenever you are ready.')
    }
  }, [searchParams])

  const refreshDashboard = async () => {
    if (!token) return
    const data = await getPublicTournamentRegistration(token)
    setDashboard(data)
    setRosterText(data.rosterText ?? '')
  }

  const handleRosterSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return

    setSubmittingRoster(true)
    setError('')
    setNotice('')

    try {
      const data = await submitTournamentRoster(token, { rosterText, rosterFile })
      setDashboard(data)
      setRosterText(data.rosterText ?? '')
      setRosterFile(null)
      setNotice('Roster saved successfully.')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'We could not save your roster right now.'
      setError(message)
    } finally {
      setSubmittingRoster(false)
    }
  }

  const handleManualPaymentSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return

    setSubmittingPayment(true)
    setError('')
    setNotice('')

    try {
      const data = await submitTournamentManualPayment(token, {
        paymentMethod,
        paymentReference,
        notes: paymentNotes,
      })
      setDashboard(data)
      setPaymentReference('')
      setPaymentNotes('')
      setNotice('Payment submission saved. We will review it shortly.')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'We could not save your payment details.'
      setError(message)
    } finally {
      setSubmittingPayment(false)
    }
  }

  const handleCheckout = async () => {
    if (!token) return

    setCreatingCheckout(true)
    setError('')
    setNotice('')

    try {
      const response = await createTournamentPaymentCheckout(token)
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
        return
      }
      setNotice(response.message ?? 'Checkout was created.')
      await refreshDashboard()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'We could not start online payment right now.'
      setError(message)
    } finally {
      setCreatingCheckout(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black px-4 py-24">
        <LoadingSpinner label="Loading registration workspace..." />
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-black px-4 py-24">
        <div className="max-w-xl mx-auto">
          <ErrorBanner message={error || 'We could not load this registration.'} />
        </div>
      </div>
    )
  }

  const { registration } = dashboard
  const teamPortalLink =
    portalPath === '/captain/registrations' ? `/captain/registrations?focus=${registration.id}` : portalPath
  const paymentComplete =
    registration.paymentStatus === 'PAID' || registration.paymentStatus === 'NOT_REQUIRED'
  const canSubmitManualPayment = dashboard.paymentRequired && !paymentComplete

  return (
    <div className="min-h-screen bg-black px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-4 mb-8">
          <Link to="/tournaments" className="text-gray-400 text-sm hover:text-white">
            Back to Tournaments
          </Link>
          {teamPortalLink ? (
            <Link to={teamPortalLink} className="text-orange-400 text-sm hover:text-orange-300">
              Back to Team Portal
            </Link>
          ) : null}
        </div>

        <div className="mb-8">
          <span className="section-label">Team Registration</span>
          <div className="flex items-start justify-between gap-4 flex-wrap mt-3">
            <div>
              <h1 className="text-white text-4xl md:text-5xl font-black mb-4">
                {registration.teamName}
              </h1>
              <p className="text-gray-400 max-w-2xl">
                Your registration is saved to your team account. Review payment, roster, and next steps here, or continue in the Team Portal.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={registration.status} />
              {registration.paymentStatus ? <StatusBadge status={registration.paymentStatus} /> : null}
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-6">
            <ErrorBanner message={error} onDismiss={() => setError('')} />
          </div>
        ) : null}

        {notice ? (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-300 text-sm">
            {notice}
          </div>
        ) : null}

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
          <div className="space-y-6">
            <section className="bg-[#111] border border-[#222] rounded-2xl p-6">
              <h2 className="text-white text-2xl font-black mb-5">Registration Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-black/40 border border-[#1f1f1f] rounded-xl p-4">
                  <p className="text-gray-500 mb-1">Tournament</p>
                  <p className="text-white font-semibold">{registration.tournamentName}</p>
                  {registration.tournamentLocation ? (
                    <p className="text-gray-400 mt-1">{registration.tournamentLocation}</p>
                  ) : null}
                </div>
                <div className="bg-black/40 border border-[#1f1f1f] rounded-xl p-4">
                  <p className="text-gray-500 mb-1">Tournament Date</p>
                  <p className="text-white font-semibold">
                    {registration.tournamentStartDate ?? 'To be confirmed'}
                  </p>
                </div>
                <div className="bg-black/40 border border-[#1f1f1f] rounded-xl p-4">
                  <p className="text-gray-500 mb-1">Captain</p>
                  <p className="text-white font-semibold">{registration.captainName}</p>
                  <p className="text-gray-400 mt-1">{registration.contactEmail}</p>
                </div>
                <div className="bg-black/40 border border-[#1f1f1f] rounded-xl p-4">
                  <p className="text-gray-500 mb-1">Club</p>
                  <p className="text-white font-semibold">
                    {registration.clubName || 'Independent team'}
                  </p>
                  {registration.phone ? (
                    <p className="text-gray-400 mt-1">{registration.phone}</p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="bg-[#111] border border-[#222] rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                <div>
                  <h2 className="text-white text-2xl font-black">Payment</h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Complete payment here or from your Team Portal, then our team will confirm it.
                  </p>
                </div>
                {registration.paymentStatus ? <StatusBadge status={registration.paymentStatus} /> : null}
              </div>

              <div className="bg-black/40 border border-[#1f1f1f] rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-gray-500 text-sm">Entry Fee</p>
                    <p className="text-white text-2xl font-black">
                      {dashboard.paymentRequired ? `$${dashboard.entryFee ?? 0}` : 'No fee required'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Payment Status</p>
                    <p className="text-white font-semibold">
                      {registration.paymentStatus?.replace(/_/g, ' ') ?? 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {dashboard.onlinePaymentAvailable && canSubmitManualPayment ? (
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={creatingCheckout}
                  className="btn-primary w-full sm:w-auto py-3 mb-5 disabled:opacity-50"
                >
                  {creatingCheckout ? 'Starting Checkout...' : 'Pay Online'}
                </button>
              ) : null}

              {canSubmitManualPayment ? (
                <form onSubmit={handleManualPaymentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                        className="input-field-default"
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Reference</label>
                      <input
                        value={paymentReference}
                        onChange={(event) => setPaymentReference(event.target.value)}
                        className="input-field-default"
                        placeholder="Transaction ID or note"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Payment Notes</label>
                    <textarea
                      rows={3}
                      value={paymentNotes}
                      onChange={(event) => setPaymentNotes(event.target.value)}
                      className="input-field-default resize-none"
                      placeholder="Add any details that will help us match your payment."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="bg-gray-100 hover:bg-white disabled:opacity-50 text-black font-bold px-5 py-3 rounded-lg"
                  >
                    {submittingPayment ? 'Saving Payment...' : 'Submit Payment Details'}
                  </button>
                </form>
              ) : (
                <p className="text-gray-400 text-sm">
                  {paymentComplete
                    ? 'Your payment step is complete.'
                    : 'No payment is required for this registration.'}
                </p>
              )}
            </section>

            <section className="bg-[#111] border border-[#222] rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                <div>
                  <h2 className="text-white text-2xl font-black">Roster</h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Add player names in the notes box, upload a roster file, or do both. You can update it later from your Team Portal.
                  </p>
                </div>
                {dashboard.rosterSubmitted ? <StatusBadge status="APPROVED" /> : <StatusBadge status="PENDING" />}
              </div>

              {dashboard.rosterFileName || dashboard.rosterSubmittedAt ? (
                <div className="bg-black/40 border border-[#1f1f1f] rounded-xl p-4 mb-5 text-sm">
                  {dashboard.rosterFileName ? (
                    <p className="text-white font-semibold">Current file: {dashboard.rosterFileName}</p>
                  ) : null}
                  {dashboard.rosterSubmittedAt ? (
                    <p className="text-gray-400 mt-1">Last updated: {dashboard.rosterSubmittedAt}</p>
                  ) : null}
                </div>
              ) : null}

              <form onSubmit={handleRosterSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Roster Notes</label>
                  <textarea
                    rows={6}
                    value={rosterText}
                    onChange={(event) => setRosterText(event.target.value)}
                    className="input-field-default resize-none"
                    placeholder="Example: Player names, jersey numbers, positions, or any roster notes."
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Roster File</label>
                  <input
                    type="file"
                    onChange={(event) => setRosterFile(event.target.files?.[0] ?? null)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-300"
                  />
                  <p className="text-gray-500 text-xs mt-2">Accepted size up to 10 MB.</p>
                </div>

                <button
                  type="submit"
                  disabled={submittingRoster}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold px-5 py-3 rounded-lg"
                >
                  {submittingRoster ? 'Saving Roster...' : 'Save Roster'}
                </button>
              </form>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="bg-[#111] border border-[#222] rounded-2xl p-6">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
                What Happens Next
              </p>
              <ul className="space-y-3 text-sm">
                {dashboard.nextSteps.map((step) => (
                  <li key={step} className="text-gray-300 leading-relaxed flex gap-3">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-[#111] border border-[#222] rounded-2xl p-6">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
                Team Portal
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {teamPortalLink
                  ? 'This registration is also saved in your Team Portal. You can manage the same payment and roster steps there anytime.'
                  : 'Team registrations are tied to a team account. Sign in to manage payment, roster, and updates from your Team Portal.'}
              </p>
              {teamPortalLink ? (
                <Link
                  to={teamPortalLink}
                  className="inline-flex bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                >
                  Open Team Portal
                </Link>
              ) : (
                <Link
                  to={loginPath}
                  className="inline-flex bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                >
                  Sign In
                </Link>
              )}
            </section>

            {dashboard.lastFollowUpSentAt ? (
              <section className="bg-[#111] border border-[#222] rounded-2xl p-6">
                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
                  Last Update
                </p>
                <p className="text-white font-semibold">{dashboard.lastFollowUpSentAt}</p>
                <p className="text-gray-400 text-sm mt-2">
                  We also send important updates to {registration.contactEmail}.
                </p>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  buildTournamentRosterDownloadUrl,
  createTournamentPaymentCheckout,
  deleteCaptainRegistration,
  getCaptainRegistrations,
  getPublicTournamentRegistration,
  getTournaments,
  submitTournamentManualPayment,
  submitTournamentRoster,
  updateCaptainRegistration,
} from '../../services/api'
import type {
  TeamRegistration,
  TeamRegistrationFormData,
  Tournament,
  TournamentRegistrationDashboard,
} from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'
import StatusBadge from '../../components/StatusBadge'
import { formatTournamentDateRange } from '../../utils/tournament'

const emptyForm: TeamRegistrationFormData = {
  teamName: '',
  captainName: '',
  contactEmail: '',
  phone: '',
  clubName: '',
  tournamentId: 0,
}

const PAYMENT_METHODS = ['Card', 'Cash App', 'Zelle', 'Venmo', 'Cash', 'Bank Transfer']

export default function CaptainRegistrationsPage() {
  const [searchParams] = useSearchParams()
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [workspaceId, setWorkspaceId] = useState<number | null>(null)
  const [workspace, setWorkspace] = useState<TournamentRegistrationDashboard | null>(null)
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [workspaceError, setWorkspaceError] = useState('')
  const [submittingRoster, setSubmittingRoster] = useState(false)
  const [submittingPayment, setSubmittingPayment] = useState(false)
  const [creatingCheckout, setCreatingCheckout] = useState(false)
  const [rosterText, setRosterText] = useState('')
  const [rosterFile, setRosterFile] = useState<File | null>(null)
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [form, setForm] = useState<TeamRegistrationFormData>(emptyForm)

  const focusedRegistrationId = (() => {
    const value = searchParams.get('focus')
    if (!value) return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  })()


  useEffect(() => {
    document.title = 'Registrations | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    Promise.all([getCaptainRegistrations(), getTournaments()])
      .then(([registrationData, tournamentData]) => {
        setRegistrations(registrationData)
        setTournaments(tournamentData)
      })
      .catch(() => setError('Could not load your registrations.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const paymentState = searchParams.get('payment')
    const isNewRegistration = searchParams.get('new')

    if (isNewRegistration === '1') {
      setNotice('Registration received. Your Team Portal is now ready for payment, roster, and status updates.')
      return
    }
    if (paymentState === 'processing') {
      setNotice('Your payment was submitted. We are confirming it now.')
      return
    }
    if (paymentState === 'cancelled') {
      setNotice('Payment was cancelled. You can try again whenever you are ready.')
    }
  }, [searchParams])

  useEffect(() => {
    if (!focusedRegistrationId || registrations.length === 0 || workspaceId === focusedRegistrationId) {
      return
    }

    const focusedRegistration = registrations.find((registration) => registration.id === focusedRegistrationId)
    if (focusedRegistration) {
      void openWorkspace(focusedRegistration)
    }
  }, [focusedRegistrationId, registrations, workspaceId])

  const syncRegistration = (updated: TeamRegistration) => {
    setRegistrations((current) =>
      current.map((registration) => (registration.id === updated.id ? { ...registration, ...updated } : registration)),
    )
  }

  const openWorkspace = async (registration: TeamRegistration) => {
    setWorkspaceId(registration.id)
    setWorkspace(null)
    setWorkspaceError('')
    setError('')

    if (!registration.guestAccessToken) {
      setWorkspaceError('This registration workspace is not available yet.')
      return
    }

    setWorkspaceLoading(true)
    try {
      const data = await getPublicTournamentRegistration(registration.guestAccessToken)
      setWorkspace(data)
      setRosterText(data.rosterText ?? '')
      setRosterFile(null)
      setPaymentMethod(PAYMENT_METHODS[0])
      setPaymentReference('')
      setPaymentNotes('')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not load this registration workspace.'
      setWorkspaceError(msg)
    } finally {
      setWorkspaceLoading(false)
    }
  }

  const closeWorkspace = () => {
    setWorkspaceId(null)
    setWorkspace(null)
    setWorkspaceError('')
    setRosterText('')
    setRosterFile(null)
    setPaymentMethod(PAYMENT_METHODS[0])
    setPaymentReference('')
    setPaymentNotes('')
  }

  const startEdit = (registration: TeamRegistration) => {
    setEditingId(registration.id)
    setForm({
      teamName: registration.teamName,
      captainName: registration.captainName,
      contactEmail: registration.contactEmail,
      phone: registration.phone ?? '',
      clubName: registration.clubName ?? '',
      tournamentId: registration.tournamentId,
    })
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingId) return

    setSaving(true)
    setError('')

    try {
      const updated = await updateCaptainRegistration(editingId, form)
      syncRegistration(updated)
      cancelEdit()
      if (workspaceId === updated.id) {
        await openWorkspace(updated)
      }
      setNotice('Registration details updated.')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not update that registration.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (registrationId: number) => {
    if (!window.confirm('Remove this registration?')) return

    try {
      await deleteCaptainRegistration(registrationId)
      setRegistrations((current) => current.filter((registration) => registration.id !== registrationId))
      if (editingId === registrationId) {
        cancelEdit()
      }
      if (workspaceId === registrationId) {
        closeWorkspace()
      }
      setNotice('Registration removed.')
    } catch {
      setError('Could not remove that registration.')
    }
  }

  const handleRosterSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!workspace?.registration.guestAccessToken) return

    setSubmittingRoster(true)
    setError('')
    setNotice('')
    setWorkspaceError('')

    try {
      const data = await submitTournamentRoster(workspace.registration.guestAccessToken, {
        rosterText,
        rosterFile,
      })
      setWorkspace(data)
      syncRegistration(data.registration)
      setRosterText(data.rosterText ?? '')
      setRosterFile(null)
      setNotice('Roster saved successfully.')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save your roster right now.'
      setWorkspaceError(msg)
    } finally {
      setSubmittingRoster(false)
    }
  }

  const handleManualPaymentSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!workspace?.registration.guestAccessToken) return

    setSubmittingPayment(true)
    setError('')
    setNotice('')
    setWorkspaceError('')

    try {
      const data = await submitTournamentManualPayment(workspace.registration.guestAccessToken, {
        paymentMethod,
        paymentReference,
        notes: paymentNotes,
      })
      setWorkspace(data)
      syncRegistration(data.registration)
      setPaymentReference('')
      setPaymentNotes('')
      setNotice('Payment details submitted. We will review them shortly.')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save your payment details.'
      setWorkspaceError(msg)
    } finally {
      setSubmittingPayment(false)
    }
  }

  const handleCheckout = async () => {
    if (!workspace?.registration.guestAccessToken) return

    setCreatingCheckout(true)
    setError('')
    setNotice('')
    setWorkspaceError('')

    try {
      const response = await createTournamentPaymentCheckout(workspace.registration.guestAccessToken)
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
        return
      }
      setNotice(response.message ?? 'Checkout was created.')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not start online payment right now.'
      setWorkspaceError(msg)
    } finally {
      setCreatingCheckout(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading registrations..." />

  const selectedRegistration =
    workspace?.registration ??
    registrations.find((registration) => registration.id === workspaceId) ??
    null
  const paymentComplete =
    workspace?.registration.paymentStatus === 'PAID' ||
    workspace?.registration.paymentStatus === 'NOT_REQUIRED'
  const canSubmitManualPayment = !!workspace?.paymentRequired && !paymentComplete
  const rosterDownloadUrl = workspace?.registration.guestAccessToken
    ? buildTournamentRosterDownloadUrl(workspace.registration.guestAccessToken)
    : null
  const workspaceTournamentDate = workspace
    ? formatTournamentDateRange(
        workspace.registration.tournamentStartDate,
        workspace.registration.tournamentEndDate,
      )
    : 'To be confirmed'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-3xl font-black">Registrations</h1>
          <p className="text-gray-400 text-sm mt-2">
            Manage each team entry, update details, submit payment, and keep your roster current from one place.
          </p>
        </div>
        <Link
          to="/captain/tournaments"
          className="bg-orange-500 hover:bg-orange-400 text-black text-sm font-bold px-4 py-2 rounded-lg"
        >
          Register a Team
        </Link>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      {notice ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-amber-400 text-sm">
          {notice}
        </div>
      ) : null}

      {editingId ? (
        <form onSubmit={handleSave} className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-white text-xl font-bold">Edit Registration</h2>
              <p className="text-gray-400 text-sm mt-1">
                Update your team details or move this registration to another tournament.
              </p>
            </div>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Team Name</label>
              <input
                required
                value={form.teamName}
                onChange={(event) => setForm((current) => ({ ...current, teamName: event.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Captain Name</label>
              <input
                required
                value={form.captainName}
                onChange={(event) => setForm((current) => ({ ...current, captainName: event.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Contact Email</label>
              <input
                type="email"
                required
                value={form.contactEmail}
                onChange={(event) => setForm((current) => ({ ...current, contactEmail: event.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Phone</label>
              <input
                value={form.phone ?? ''}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Club Name</label>
              <input
                value={form.clubName ?? ''}
                onChange={(event) => setForm((current) => ({ ...current, clubName: event.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Tournament</label>
              <select
                value={form.tournamentId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, tournamentId: Number(event.target.value) }))
                }
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
              >
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-5 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {workspaceId ? (
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-3">
                Team Registration Workspace
              </p>
              <h2 className="text-white text-2xl font-black">
                {selectedRegistration?.teamName ?? 'Registration'}
              </h2>
              <p className="text-gray-400 text-sm mt-2 max-w-2xl">
                This is the main place to manage payment, roster, and tournament updates for your team.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedRegistration?.status ? <StatusBadge status={selectedRegistration.status} /> : null}
              {selectedRegistration?.paymentStatus ? (
                <StatusBadge status={selectedRegistration.paymentStatus} />
              ) : null}
              <button
                type="button"
                onClick={closeWorkspace}
                className="text-sm text-gray-400 hover:text-white px-3 py-2"
              >
                Close Workspace
              </button>
            </div>
          </div>

          {workspaceLoading ? (
            <LoadingSpinner label="Loading registration workspace..." />
          ) : workspaceError ? (
            <ErrorBanner message={workspaceError} onDismiss={() => setWorkspaceError('')} />
          ) : workspace ? (
            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="space-y-6">
                <section className="bg-black/30 border border-[#222] rounded-xl p-5">
                  <h3 className="text-white text-xl font-bold mb-4">Registration Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-black/40 border border-[#1f1f1f] rounded-xl p-4">
                      <p className="text-gray-500 mb-1">Tournament</p>
                      <p className="text-white font-semibold">{workspace.registration.tournamentName}</p>
                      {workspace.registration.tournamentLocation ? (
                        <p className="text-gray-400 mt-1">{workspace.registration.tournamentLocation}</p>
                      ) : null}
                    </div>
                    <div className="bg-black/40 border border-[#1f1f1f] rounded-xl p-4">
                      <p className="text-gray-500 mb-1">Tournament Date</p>
                      <p className="text-white font-semibold">{workspaceTournamentDate}</p>
                    </div>
                    <div className="bg-black/40 border border-[#1f1f1f] rounded-xl p-4">
                      <p className="text-gray-500 mb-1">Captain</p>
                      <p className="text-white font-semibold">{workspace.registration.captainName}</p>
                      <p className="text-gray-400 mt-1">{workspace.registration.contactEmail}</p>
                    </div>
                    <div className="bg-black/40 border border-[#1f1f1f] rounded-xl p-4">
                      <p className="text-gray-500 mb-1">Club</p>
                      <p className="text-white font-semibold">
                        {workspace.registration.clubName || 'Independent team'}
                      </p>
                      {workspace.registration.phone ? (
                        <p className="text-gray-400 mt-1">{workspace.registration.phone}</p>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className="bg-black/30 border border-[#222] rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                    <div>
                      <h3 className="text-white text-xl font-bold">Payment</h3>
                      <p className="text-gray-400 text-sm mt-2">
                        Complete payment here or send your payment details so our team can confirm them.
                      </p>
                    </div>
                    {workspace.registration.paymentStatus ? (
                      <StatusBadge status={workspace.registration.paymentStatus} />
                    ) : null}
                  </div>

                  <div className="bg-black/40 border border-[#1f1f1f] rounded-xl p-4 mb-5">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-gray-500 text-sm">Entry Fee</p>
                        <p className="text-white text-2xl font-black">
                          {workspace.paymentRequired ? `$${workspace.entryFee ?? 0}` : 'No fee required'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-sm">Payment Status</p>
                        <p className="text-white font-semibold">
                          {workspace.registration.paymentStatus?.replace(/_/g, ' ') ?? 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {workspace.onlinePaymentAvailable && canSubmitManualPayment ? (
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={creatingCheckout}
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold px-5 py-3 rounded-lg mb-5"
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
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white"
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
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white"
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
                          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white resize-none"
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

                <section className="bg-black/30 border border-[#222] rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                    <div>
                      <h3 className="text-white text-xl font-bold">Roster</h3>
                      <p className="text-gray-400 text-sm mt-2">
                        Add player names in the notes box, upload a roster file, or do both.
                      </p>
                    </div>
                    {workspace.rosterSubmitted ? (
                      <StatusBadge status="APPROVED" />
                    ) : (
                      <StatusBadge status="PENDING" />
                    )}
                  </div>

                  {workspace.rosterFileName || workspace.rosterSubmittedAt ? (
                    <div className="bg-black/40 border border-[#1f1f1f] rounded-xl p-4 mb-5 text-sm">
                      {workspace.rosterFileName ? (
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-white font-semibold">Current file: {workspace.rosterFileName}</p>
                          {rosterDownloadUrl ? (
                            <a
                              href={rosterDownloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-amber-400 hover:text-amber-300"
                            >
                              Download
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                      {workspace.rosterSubmittedAt ? (
                        <p className="text-gray-400 mt-1">Last updated: {workspace.rosterSubmittedAt}</p>
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
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white resize-none"
                        placeholder="Example: Player names, jersey numbers, positions, or any roster notes."
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Roster File</label>
                      <input
                        type="file"
                        onChange={(event) => setRosterFile(event.target.files?.[0] ?? null)}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-gray-300"
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

              <div className="space-y-6">
                <section className="bg-black/30 border border-[#222] rounded-xl p-5">
                  <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
                    What Happens Next
                  </p>
                  <ul className="space-y-3 text-sm">
                    {workspace.nextSteps.map((step) => (
                      <li key={step} className="text-gray-300 leading-relaxed flex gap-3">
                        <span className="text-orange-400 mt-0.5">*</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bg-black/30 border border-[#222] rounded-xl p-5">
                  <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
                    Team Portal
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This registration is saved in your Team Portal. Return here anytime to review status, payment, and roster updates.
                  </p>
                </section>

                {workspace.lastFollowUpSentAt ? (
                  <section className="bg-black/30 border border-[#222] rounded-xl p-5">
                    <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
                      Last Update
                    </p>
                    <p className="text-white font-semibold">{workspace.lastFollowUpSentAt}</p>
                    <p className="text-gray-400 text-sm mt-2">
                      We also send important updates to {workspace.registration.contactEmail}.
                    </p>
                  </section>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {registrations.length === 0 ? (
        <EmptyState
          icon="T"
          title="No registrations yet"
          description="Register your first team to start tracking tournament entries here."
          action={
            <Link
              to="/captain/tournaments"
              className="bg-orange-500 text-black font-bold px-5 py-2 rounded-lg text-sm"
            >
              Browse Tournaments
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {registrations.map((registration) => {
            const registrationRosterDownloadUrl =
              registration.guestAccessToken && registration.rosterFileName
                ? buildTournamentRosterDownloadUrl(registration.guestAccessToken)
                : null

            return (
              <div key={registration.id} className="bg-[#111] border border-[#222] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <p className="text-white font-semibold text-lg">{registration.teamName}</p>
                      <StatusBadge status={registration.status} />
                      {registration.paymentStatus ? <StatusBadge status={registration.paymentStatus} /> : null}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {registration.tournamentName}
                      {registration.tournamentLocation ? `, ${registration.tournamentLocation}` : ''}
                    </p>
                    {registration.tournamentStartDate ? (
                      <p className="text-gray-500 text-sm mt-1">
                        Tournament date: {formatTournamentDateRange(registration.tournamentStartDate, registration.tournamentEndDate)}
                      </p>
                    ) : null}
                    <p className="text-gray-500 text-sm mt-1">
                      Captain: {registration.captainName}, {registration.contactEmail}
                    </p>
                    {registration.phone ? (
                      <p className="text-gray-500 text-sm">Phone: {registration.phone}</p>
                    ) : null}
                    {registration.clubName ? (
                      <p className="text-gray-500 text-sm">Club: {registration.clubName}</p>
                    ) : null}
                    {registration.rosterSubmitted ? (
                      <p className="text-gray-500 text-sm">Roster on file</p>
                    ) : null}
                    {registration.rosterFileName ? (
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-gray-500">{registration.rosterFileName}</span>
                        {registrationRosterDownloadUrl ? (
                          <a
                            href={registrationRosterDownloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-amber-400 hover:text-amber-300"
                          >
                            Download roster
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => void openWorkspace(registration)}
                      className={`rounded-lg px-4 py-2 text-sm border ${
                        workspaceId === registration.id
                          ? 'text-white border-white/30 bg-white/10'
                          : 'text-gray-300 border-gray-600 hover:bg-[#1a1a1a]'
                      }`}
                    >
                      {workspaceId === registration.id ? 'Workspace Open' : 'Open Workspace'}
                    </button>
                    <button
                      onClick={() => startEdit(registration)}
                      className="text-orange-400 border border-orange-400/30 hover:bg-orange-400/10 rounded-lg px-4 py-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(registration.id)}
                      className="text-red-400 border border-red-400/30 hover:bg-red-400/10 rounded-lg px-4 py-2 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import FormatSelector from '../../components/FormatSelector'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  bulkCreateTournamentTeamPlayers,
  createAdminTournamentRegistration,
  createTournament,
  createTournamentMatch,
  createTournamentTeamPlayer,
  deleteAdminTournamentRegistration,
  deleteTournamentMatch,
  deleteTournamentTeamPlayer,
  generateTournamentSchedule,
  getAdminTournamentWorkflow,
  seedTournamentKnockoutBracket,
  updateAdminTournamentRegistration,
  updateTournament,
  updateTournamentMatch,
  updateTournamentTeamPlayer,
} from '../../services/api'
import type {
  AdminTeamRegistrationFormData,
  StandingEntry,
  TeamPlayer,
  TeamPlayerFormData,
  Tournament,
  TournamentMatch,
  TournamentMatchFormData,
  TournamentWorkflow,
  TournamentWorkflowTeam,
} from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'

type WorkflowStep = 'details' | 'teams' | 'players' | 'format' | 'schedule' | 'results' | 'standings'

type TournamentFormState = {
  name: string
  location: string
  startDate: string
  endDate: string
  maxTeams: number
  description: string
  status: string
  ageGroup: string
  registrationDeadline: string
  division: string
  entryFee: number
  notes: string
  formatType: string
  teamsPerGroup: number
  advancePerGroup: number
  pointsForWin: number
  pointsForDraw: number
  pointsForLoss: number
  matchDurationMinutes: number
  thirdPlaceMatchEnabled: boolean
}

const WORKFLOW_STEPS: { key: WorkflowStep; label: string; hint: string }[] = [
  { key: 'details', label: '1. Tournament', hint: 'Create and update the event.' },
  { key: 'teams', label: '2. Teams', hint: 'Add and manage team entries.' },
  { key: 'players', label: '3. Players', hint: 'Build rosters for each team.' },
  { key: 'format', label: '4. Format', hint: 'Set match rules and structure.' },
  { key: 'schedule', label: '5. Schedule', hint: 'Build the full match list.' },
  { key: 'results', label: '6. Results', hint: 'Enter scores and finalize games.' },
  { key: 'standings', label: '7. Standings', hint: 'Live table sorted by points.' },
]

const TOURNAMENT_STATUSES = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']
const REGISTRATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED']
const PAYMENT_STATUSES = ['PENDING', 'SUBMITTED', 'PAID', 'FAILED', 'REFUNDED', 'NOT_REQUIRED']
const MATCH_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'FINAL', 'POSTPONED', 'CANCELLED']

const emptyTournamentForm = (): TournamentFormState => ({
  name: '',
  location: '',
  startDate: '',
  endDate: '',
  maxTeams: 8,
  description: '',
  status: 'UPCOMING',
  ageGroup: '',
  registrationDeadline: '',
  division: '',
  entryFee: 0,
  notes: '',
  formatType: 'ROUND_ROBIN',
  teamsPerGroup: 4,
  advancePerGroup: 2,
  pointsForWin: 3,
  pointsForDraw: 1,
  pointsForLoss: 0,
  matchDurationMinutes: 50,
  thirdPlaceMatchEnabled: false,
})

const emptyRegistrationForm = (tournamentId = 0): AdminTeamRegistrationFormData => ({
  teamName: '',
  captainName: '',
  contactEmail: '',
  phone: '',
  clubName: '',
  tournamentId,
  status: 'PENDING',
  paymentStatus: 'PENDING',
  paymentMethod: '',
  paymentReference: '',
  paymentNotes: '',
  rosterText: '',
})

const emptyPlayerForm = (): TeamPlayerFormData => ({
  fullName: '',
  jerseyNumber: '',
  position: '',
  captain: false,
  notes: '',
})

const emptyMatchForm = (): TournamentMatchFormData => ({
  homeTeamId: undefined,
  awayTeamId: undefined,
  stageName: '',
  roundName: '',
  matchDate: '',
  kickoffTime: '',
  venue: '',
  fieldName: '',
  status: 'SCHEDULED',
  homeScore: '',
  awayScore: '',
  notes: '',
})

function toTournamentForm(tournament: Tournament | null | undefined): TournamentFormState {
  if (!tournament) return emptyTournamentForm()
  return {
    name: tournament.name ?? '',
    location: tournament.location ?? '',
    startDate: tournament.startDate ?? '',
    endDate: tournament.endDate ?? '',
    maxTeams: tournament.maxTeams ?? 8,
    description: tournament.description ?? '',
    status: tournament.status ?? 'UPCOMING',
    ageGroup: tournament.ageGroup ?? '',
    registrationDeadline: tournament.registrationDeadline ?? '',
    division: tournament.division ?? '',
    entryFee: Number(tournament.entryFee ?? 0),
    notes: tournament.notes ?? '',
    formatType: tournament.formatType ?? 'ROUND_ROBIN',
    teamsPerGroup: tournament.teamsPerGroup ?? 4,
    advancePerGroup: tournament.advancePerGroup ?? 2,
    pointsForWin: tournament.pointsForWin ?? 3,
    pointsForDraw: tournament.pointsForDraw ?? 1,
    pointsForLoss: tournament.pointsForLoss ?? 0,
    matchDurationMinutes: tournament.matchDurationMinutes ?? 50,
    thirdPlaceMatchEnabled: Boolean(tournament.thirdPlaceMatchEnabled),
  }
}

function toMatchForm(match: TournamentMatch): TournamentMatchFormData {
  return {
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    stageName: match.stageName ?? '',
    roundName: match.roundName ?? '',
    matchDate: match.matchDate ?? '',
    kickoffTime: match.kickoffTime ? match.kickoffTime.slice(0, 5) : '',
    venue: match.venue ?? '',
    fieldName: match.fieldName ?? '',
    status: match.status ?? 'SCHEDULED',
    homeScore: match.homeScore ?? '',
    awayScore: match.awayScore ?? '',
    notes: match.notes ?? '',
  }
}

export default function AdminTournamentWorkflowPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tournamentId = id ? Number(id) : null
  const currentStep = (searchParams.get('step') as WorkflowStep) || 'details'

  const [workflow, setWorkflow] = useState<TournamentWorkflow | null>(null)
  const [tournamentForm, setTournamentForm] = useState<TournamentFormState>(emptyTournamentForm())
  const [loading, setLoading] = useState(Boolean(tournamentId))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [registrationForm, setRegistrationForm] = useState<AdminTeamRegistrationFormData>(emptyRegistrationForm())
  const [editingRegistrationId, setEditingRegistrationId] = useState<number | null>(null)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [playerForm, setPlayerForm] = useState<TeamPlayerFormData>(emptyPlayerForm())
  const [editingPlayer, setEditingPlayer] = useState<TeamPlayer | null>(null)

  const [matchForm, setMatchForm] = useState<TournamentMatchFormData>(emptyMatchForm())
  const [editingMatch, setEditingMatch] = useState<TournamentMatch | null>(null)
  const [showMatchForm, setShowMatchForm] = useState(false)

  // Inline result editing: matchId → { homeScore, awayScore, status }
  const [inlineResults, setInlineResults] = useState<
    Record<number, { homeScore: string; awayScore: string; status: string }>
  >({})
  const [savingResultId, setSavingResultId] = useState<number | null>(null)

  // Bulk player import
  const [bulkImportText, setBulkImportText] = useState('')
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [importingBulk, setImportingBulk] = useState(false)

  const selectedTeam = useMemo(
    () => workflow?.teams.find((team) => team.teamId === selectedTeamId) ?? null,
    [selectedTeamId, workflow],
  )

  const setStep = (step: WorkflowStep) => {
    const next = new URLSearchParams(searchParams)
    next.set('step', step)
    setSearchParams(next)
  }

  const loadWorkflow = async (targetId: number) => {
    setLoading(true)
    try {
      const data = await getAdminTournamentWorkflow(targetId)
      setWorkflow(data)
      setTournamentForm(toTournamentForm(data.tournament))
      setSelectedTeamId((current) => {
        if (current && data.teams.some((team) => team.teamId === current)) return current
        return data.teams[0]?.teamId ?? null
      })
    } catch {
      setError('Failed to load the tournament workflow.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!tournamentId) {
      setWorkflow(null)
      setTournamentForm(emptyTournamentForm())
      setLoading(false)
      return
    }
    loadWorkflow(tournamentId)
  }, [tournamentId])

  const saveTournament = async (nextStep?: WorkflowStep) => {
    setSaving(true)
    setError('')
    try {
      if (!tournamentId) {
        const created = await createTournament(tournamentForm)
        navigate(`/admin/tournaments/${created.id}/workflow?step=${nextStep ?? 'teams'}`)
        return
      }
      await updateTournament(tournamentId, tournamentForm)
      await loadWorkflow(tournamentId)
      if (nextStep) setStep(nextStep)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save this tournament.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const saveFormat = async () => {
    const teamCount = workflow?.teams.length ?? 0
    if (teamCount > 0) {
      if (tournamentForm.formatType === 'GROUP_STAGE') {
        if (teamCount % tournamentForm.teamsPerGroup !== 0) {
          setError(
            `With ${teamCount} teams, the teams-per-group value (${tournamentForm.teamsPerGroup}) must divide evenly. Adjust either value before saving.`,
          )
          return
        }
        if (tournamentForm.advancePerGroup >= tournamentForm.teamsPerGroup) {
          setError('Teams advancing per group must be less than teams per group.')
          return
        }
      }
      if (tournamentForm.formatType === 'KNOCKOUT') {
        const isPowerOfTwo = (teamCount & (teamCount - 1)) === 0
        if (!isPowerOfTwo) {
          // window.confirm returns true for OK (continue) and false for Cancel (abort)
          const confirmed = window.confirm(`Knockout format works best with a power-of-2 team count (2, 4, 8, 16…). You have ${teamCount} teams. Continue anyway?`)
          if (!confirmed) return
        }
      }
    }
    await saveTournament('schedule')
  }

  const saveRegistration = async () => {
    if (!tournamentId) return
    setSaving(true)
    setError('')
    try {
      if (editingRegistrationId) {
        await updateAdminTournamentRegistration(editingRegistrationId, registrationForm)
      } else {
        await createAdminTournamentRegistration({ ...registrationForm, tournamentId })
      }
      setShowRegistrationForm(false)
      setEditingRegistrationId(null)
      setRegistrationForm(emptyRegistrationForm(tournamentId))
      await loadWorkflow(tournamentId)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save this team.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const savePlayer = async () => {
    if (!tournamentId || !selectedTeam) return
    setSaving(true)
    setError('')
    try {
      if (editingPlayer) {
        await updateTournamentTeamPlayer(tournamentId, selectedTeam.teamId, editingPlayer.id, playerForm)
      } else {
        await createTournamentTeamPlayer(tournamentId, selectedTeam.teamId, playerForm)
      }
      setPlayerForm(emptyPlayerForm())
      setEditingPlayer(null)
      await loadWorkflow(tournamentId)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save this player.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const saveMatch = async () => {
    if (!tournamentId) return
    setSaving(true)
    setError('')
    try {
      if (editingMatch) {
        await updateTournamentMatch(tournamentId, editingMatch.id, matchForm)
      } else {
        await createTournamentMatch(tournamentId, matchForm)
      }
      setMatchForm(emptyMatchForm())
      setEditingMatch(null)
      setShowMatchForm(false)
      await loadWorkflow(tournamentId)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save this match.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const openRegistrationEditor = (team: TournamentWorkflowTeam) => {
    if (!tournamentId) return
    setEditingRegistrationId(team.registrationId)
    setRegistrationForm({
      tournamentId,
      teamName: team.teamName,
      captainName: team.captainName,
      contactEmail: team.contactEmail,
      phone: team.phone ?? '',
      clubName: team.clubName ?? '',
      status: team.registrationStatus,
      paymentStatus: team.paymentStatus ?? 'PENDING',
      paymentMethod: '',
      paymentReference: '',
      paymentNotes: '',
      rosterText: '',
    })
    setShowRegistrationForm(true)
  }

  const openMatchEditor = (match: TournamentMatch) => {
    setEditingMatch(match)
    setMatchForm(toMatchForm(match))
    setShowMatchForm(true)
  }

  const selectTeamForPlayers = (teamId: number) => {
    setSelectedTeamId(teamId)
    setPlayerForm(emptyPlayerForm())
    setEditingPlayer(null)
    setShowBulkImport(false)
    setBulkImportText('')
  }

  const openInlineResult = (match: TournamentMatch) => {
    setInlineResults((prev) => ({
      ...prev,
      [match.id]: {
        homeScore: match.homeScore != null ? String(match.homeScore) : '',
        awayScore: match.awayScore != null ? String(match.awayScore) : '',
        status: match.status ?? 'SCHEDULED',
      },
    }))
  }

  const saveInlineResult = async (match: TournamentMatch) => {
    if (!tournamentId) return
    const data = inlineResults[match.id]
    if (!data) return
    setSavingResultId(match.id)
    setError('')
    try {
      await updateTournamentMatch(tournamentId, match.id, {
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        stageName: match.stageName ?? '',
        roundName: match.roundName ?? '',
        matchDate: match.matchDate ?? '',
        kickoffTime: match.kickoffTime ? match.kickoffTime.slice(0, 5) : '',
        venue: match.venue ?? '',
        fieldName: match.fieldName ?? '',
        status: data.status,
        homeScore: data.homeScore == null || data.homeScore === '' ? '' : Number(data.homeScore),
        awayScore: data.awayScore == null || data.awayScore === '' ? '' : Number(data.awayScore),
        notes: match.notes ?? '',
      })
      setInlineResults((prev) => {
        const next = { ...prev }
        delete next[match.id]
        return next
      })
      await loadWorkflow(tournamentId)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save this result.'
      setError(message)
    } finally {
      setSavingResultId(null)
    }
  }

  const runBulkImport = async () => {
    if (!tournamentId || !selectedTeamId || !bulkImportText.trim()) return
    setImportingBulk(true)
    setError('')
    try {
      const lines = bulkImportText.split('\n')
      await bulkCreateTournamentTeamPlayers(tournamentId, selectedTeamId, lines)
      setBulkImportText('')
      setShowBulkImport(false)
      await loadWorkflow(tournamentId)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Bulk import failed.'
      setError(message)
    } finally {
      setImportingBulk(false)
    }
  }

  const currentStepIndex = WORKFLOW_STEPS.findIndex((step) => step.key === currentStep)
  const previousStep = WORKFLOW_STEPS[Math.max(currentStepIndex - 1, 0)]?.key ?? 'details'
  const nextStep = WORKFLOW_STEPS[Math.min(currentStepIndex + 1, WORKFLOW_STEPS.length - 1)]?.key ?? 'standings'

  if (loading) return <LoadingSpinner label="Loading tournament workflow..." />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link to="/admin/tournaments" className="text-sm text-cyan-400 hover:text-cyan-300">
            Back to tournaments
          </Link>
          <h1 className="text-white text-3xl font-black mt-2">
            {workflow?.tournament.name ?? 'New Tournament Workflow'}
          </h1>
          <p className="text-gray-400 text-sm mt-2 max-w-2xl">
            Move step by step through tournament setup, team management, roster building, format rules,
            scheduling, and results.
          </p>
        </div>
        {workflow?.tournament ? <StatusBadge status={workflow.tournament.status} /> : null}
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
        {WORKFLOW_STEPS.map((step) => (
          <button
            key={step.key}
            type="button"
            disabled={!tournamentId && step.key !== 'details'}
            onClick={() => setStep(step.key)}
            className={`rounded-xl border px-4 py-4 text-left transition-colors ${
              currentStep === step.key
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-gray-800 bg-gray-900 hover:border-gray-700'
            } disabled:opacity-40`}
          >
            <div className="text-white font-bold text-sm">{step.label}</div>
            <div className="text-gray-500 text-xs mt-1">{step.hint}</div>
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        {currentStep === 'details' ? (
          <>
            <h2 className="text-white font-black text-2xl">Tournament Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Tournament name</label>
                <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="e.g. Summer Cup 2026" value={tournamentForm.name} onChange={(e) => setTournamentForm((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Location</label>
                <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="e.g. Kante Elite Complex" value={tournamentForm.location} onChange={(e) => setTournamentForm((prev) => ({ ...prev, location: e.target.value }))} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Status</label>
                <select className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" value={tournamentForm.status} onChange={(e) => setTournamentForm((prev) => ({ ...prev, status: e.target.value }))}>{TOURNAMENT_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Start date</label>
                <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" type="date" value={tournamentForm.startDate} onChange={(e) => setTournamentForm((prev) => ({ ...prev, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">End date</label>
                <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" type="date" value={tournamentForm.endDate} onChange={(e) => setTournamentForm((prev) => ({ ...prev, endDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Registration deadline</label>
                <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" type="date" value={tournamentForm.registrationDeadline} onChange={(e) => setTournamentForm((prev) => ({ ...prev, registrationDeadline: e.target.value }))} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Max teams</label>
                <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" type="number" min={2} value={tournamentForm.maxTeams} onChange={(e) => setTournamentForm((prev) => ({ ...prev, maxTeams: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Age group</label>
                <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="e.g. U14, U18, Open" value={tournamentForm.ageGroup} onChange={(e) => setTournamentForm((prev) => ({ ...prev, ageGroup: e.target.value }))} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Division</label>
                <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="e.g. Elite, Recreational" value={tournamentForm.division} onChange={(e) => setTournamentForm((prev) => ({ ...prev, division: e.target.value }))} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Entry fee ($)</label>
                <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" type="number" min={0} value={tournamentForm.entryFee} onChange={(e) => setTournamentForm((prev) => ({ ...prev, entryFee: Number(e.target.value) }))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Description (public)</label>
                <textarea className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm min-h-[110px]" placeholder="Describe the tournament for participants and families." value={tournamentForm.description} onChange={(e) => setTournamentForm((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Internal notes</label>
                <textarea className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm min-h-[110px]" placeholder="Notes for staff and coaches (not shown publicly)." value={tournamentForm.notes} onChange={(e) => setTournamentForm((prev) => ({ ...prev, notes: e.target.value }))} />
              </div>
            </div>
            <button type="button" onClick={() => saveTournament('teams')} disabled={saving} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-50">
              {saving ? 'Saving...' : tournamentId ? 'Save and Continue' : 'Create Tournament'}
            </button>
          </>
        ) : null}
        {currentStep === 'teams' && workflow ? (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-white font-black text-2xl">Teams</h2>
                <p className="text-gray-400 text-sm mt-1">Add teams manually or edit registrations before building rosters.</p>
              </div>
              <button type="button" onClick={() => { setRegistrationForm(emptyRegistrationForm(tournamentId ?? 0)); setEditingRegistrationId(null); setShowRegistrationForm(true) }} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg text-sm">
                Add Team
              </button>
            </div>

            {showRegistrationForm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950 border border-gray-800 rounded-xl p-4">
                <input className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="Team name" value={registrationForm.teamName} onChange={(e) => setRegistrationForm((prev) => ({ ...prev, teamName: e.target.value }))} />
                <input className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="Captain name" value={registrationForm.captainName} onChange={(e) => setRegistrationForm((prev) => ({ ...prev, captainName: e.target.value }))} />
                <input className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="Contact email" value={registrationForm.contactEmail} onChange={(e) => setRegistrationForm((prev) => ({ ...prev, contactEmail: e.target.value }))} />
                <input className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="Phone" value={registrationForm.phone ?? ''} onChange={(e) => setRegistrationForm((prev) => ({ ...prev, phone: e.target.value }))} />
                <input className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="Club name" value={registrationForm.clubName ?? ''} onChange={(e) => setRegistrationForm((prev) => ({ ...prev, clubName: e.target.value }))} />
                <select className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" value={registrationForm.status} onChange={(e) => setRegistrationForm((prev) => ({ ...prev, status: e.target.value }))}>{REGISTRATION_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
                <select className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" value={registrationForm.paymentStatus} onChange={(e) => setRegistrationForm((prev) => ({ ...prev, paymentStatus: e.target.value }))}>{PAYMENT_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
                <div className="md:col-span-2 flex gap-3">
                  <button type="button" onClick={saveRegistration} disabled={saving} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-50">{saving ? 'Saving...' : editingRegistrationId ? 'Save Team' : 'Create Team'}</button>
                  <button type="button" onClick={() => setShowRegistrationForm(false)} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">Close</button>
                </div>
              </div>
            ) : null}

            {workflow.teams.length === 0 ? <EmptyState title="No teams yet" description="Add teams before you move into player rosters and scheduling." /> : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {workflow.teams.map((team) => (
                  <div key={team.teamId} className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-white font-bold">{team.teamName}</div>
                        <div className="text-gray-400 text-sm">{team.captainName}, {team.contactEmail}</div>
                      </div>
                      <div className="flex gap-2">
                        <StatusBadge status={team.registrationStatus} />
                        {team.paymentStatus ? <StatusBadge status={team.paymentStatus} /> : null}
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs">{team.playerCount} players added</div>
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" onClick={() => openRegistrationEditor(team)} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs">Edit</button>
                      <button type="button" onClick={() => { setSelectedTeamId(team.teamId); setStep('players') }} className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-lg text-xs">Players</button>
                      <button type="button" onClick={async () => { if (!window.confirm(`Delete ${team.teamName}?`)) return; await deleteAdminTournamentRegistration(team.registrationId); await loadWorkflow(tournamentId!) }} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
        {currentStep === 'players' && workflow ? (
          <>
            <h2 className="text-white font-black text-2xl">Players</h2>
            {workflow.teams.length === 0 ? <EmptyState title="Add teams first" description="Players are attached to teams, so start with the Teams step." /> : (
              <div className="grid grid-cols-1 xl:grid-cols-[260px,1fr] gap-5">
                <div className="space-y-2">
                  {workflow.teams.map((team) => (
                    <button key={team.teamId} type="button" onClick={() => selectTeamForPlayers(team.teamId)} className={`w-full text-left rounded-xl border px-4 py-3 ${selectedTeamId === team.teamId ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-800 bg-gray-950 hover:border-gray-700'}`}>
                      <div className="text-white font-semibold">{team.teamName}</div>
                      <div className="text-gray-500 text-xs mt-1">{team.playerCount} players</div>
                    </button>
                  ))}
                </div>
                <div className="space-y-4">
                  {selectedTeam ? (
                    <>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-gray-400 text-sm">Roster for <span className="text-white font-semibold">{selectedTeam.teamName}</span></p>
                        <button
                          type="button"
                          onClick={() => { setShowBulkImport((v) => !v); setBulkImportText('') }}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg"
                        >
                          {showBulkImport ? 'Cancel Paste Import' : 'Paste Import'}
                        </button>
                      </div>

                      {showBulkImport ? (
                        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3">
                          <p className="text-gray-400 text-xs">One player per line. Format: <span className="text-gray-300">Name</span> or <span className="text-gray-300">Name, Jersey, Position</span></p>
                          <textarea
                            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm min-h-[130px] font-mono"
                            placeholder={"Alex Johnson\nMarcus Lee, 7, Forward\nJordan Smith, 10, Midfielder"}
                            value={bulkImportText}
                            onChange={(e) => setBulkImportText(e.target.value)}
                          />
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={runBulkImport}
                              disabled={importingBulk || !bulkImportText.trim()}
                              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                            >
                              {importingBulk ? 'Importing...' : `Import ${bulkImportText.split('\n').filter((l) => l.trim()).length} Players`}
                            </button>
                            <button type="button" onClick={() => { setShowBulkImport(false); setBulkImportText('') }} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">Cancel</button>
                          </div>
                        </div>
                      ) : null}

                      <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="Player name" value={playerForm.fullName} onChange={(e) => setPlayerForm((prev) => ({ ...prev, fullName: e.target.value }))} />
                        <input className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="Jersey number" value={playerForm.jerseyNumber ?? ''} onChange={(e) => setPlayerForm((prev) => ({ ...prev, jerseyNumber: e.target.value }))} />
                        <input className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="Position" value={playerForm.position ?? ''} onChange={(e) => setPlayerForm((prev) => ({ ...prev, position: e.target.value }))} />
                        <label className="flex items-center gap-3 text-gray-300 text-sm"><input type="checkbox" checked={Boolean(playerForm.captain)} onChange={(e) => setPlayerForm((prev) => ({ ...prev, captain: e.target.checked }))} /> Team captain</label>
                        <textarea className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm min-h-[100px] md:col-span-2" placeholder="Notes" value={playerForm.notes ?? ''} onChange={(e) => setPlayerForm((prev) => ({ ...prev, notes: e.target.value }))} />
                        <div className="md:col-span-2 flex gap-3">
                          <button type="button" onClick={savePlayer} disabled={saving} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-50">{saving ? 'Saving...' : editingPlayer ? 'Save Player' : 'Add Player'}</button>
                          <button type="button" onClick={() => { setPlayerForm(emptyPlayerForm()); setEditingPlayer(null) }} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">Clear</button>
                        </div>
                      </div>
                      {selectedTeam.players.length === 0 ? <EmptyState title="No players added yet" description="Add players above or use Paste Import for multiple players at once." /> : (
                        <div className="space-y-3">
                          {selectedTeam.players.map((player) => (
                            <div key={player.id} className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex items-start justify-between gap-4">
                              <div>
                                <div className="text-white font-semibold">{player.fullName}</div>
                                <div className="text-gray-400 text-sm">{player.position || 'No position'}{player.jerseyNumber ? `, #${player.jerseyNumber}` : ''}</div>
                                {player.captain ? <div className="text-cyan-400 text-xs mt-1">Captain</div> : null}
                              </div>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => { setEditingPlayer(player); setPlayerForm({ fullName: player.fullName, jerseyNumber: player.jerseyNumber ?? '', position: player.position ?? '', captain: Boolean(player.captain), notes: player.notes ?? '' }) }} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs">Edit</button>
                                <button type="button" onClick={async () => { if (!window.confirm(`Delete ${player.fullName}?`)) return; await deleteTournamentTeamPlayer(tournamentId!, selectedTeam.teamId, player.id); await loadWorkflow(tournamentId!) }} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs">Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : <EmptyState title="Choose a team" description="Select a team on the left to manage players." />}
                </div>
              </div>
            )}
          </>
        ) : null}
        {currentStep === 'format' ? (
          <>
            <h2 className="text-white font-black text-2xl">Format</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormatSelector
                value={tournamentForm.formatType}
                onChange={(val) => { setTournamentForm((prev) => ({ ...prev, formatType: val })); setError('') }}
              />
              <div className="col-span-full">
                {tournamentForm.formatType === 'ROUND_ROBIN' && (
                  <p className="text-gray-400 text-sm bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                    All teams play each other once. Points are awarded for wins and draws. Final standings determine the winner.
                  </p>
                )}
                {tournamentForm.formatType === 'GROUP_STAGE' && (
                  <p className="text-gray-400 text-sm bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                    Teams compete in groups, then the top teams advance to elimination rounds. Group standings determine who progresses.
                  </p>
                )}
                {tournamentForm.formatType === 'KNOCKOUT' && (
                  <p className="text-gray-400 text-sm bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                    Single elimination bracket. Lose once and you're out. Works best with a power-of-2 number of teams (2, 4, 8, 16…).
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Match duration (minutes)</label>
                <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" type="number" min={1} value={tournamentForm.matchDurationMinutes} onChange={(e) => setTournamentForm((prev) => ({ ...prev, matchDurationMinutes: Number(e.target.value) }))} />
              </div>
              {tournamentForm.formatType !== 'KNOCKOUT' && (
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Teams per group</label>
                  <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" type="number" min={2} value={tournamentForm.teamsPerGroup} onChange={(e) => setTournamentForm((prev) => ({ ...prev, teamsPerGroup: Number(e.target.value) }))} />
                </div>
              )}
              {tournamentForm.formatType === 'GROUP_STAGE' && (
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Teams advancing per group</label>
                  <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" type="number" min={1} value={tournamentForm.advancePerGroup} onChange={(e) => setTournamentForm((prev) => ({ ...prev, advancePerGroup: Number(e.target.value) }))} />
                </div>
              )}
              {tournamentForm.formatType !== 'KNOCKOUT' && (
                <>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Points for win</label>
                    <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" type="number" min={0} value={tournamentForm.pointsForWin} onChange={(e) => setTournamentForm((prev) => ({ ...prev, pointsForWin: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Points for draw</label>
                    <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" type="number" min={0} value={tournamentForm.pointsForDraw} onChange={(e) => setTournamentForm((prev) => ({ ...prev, pointsForDraw: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Points for loss</label>
                    <input className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" type="number" min={0} value={tournamentForm.pointsForLoss} onChange={(e) => setTournamentForm((prev) => ({ ...prev, pointsForLoss: Number(e.target.value) }))} />
                  </div>
                </>
              )}
              <div className="flex items-center gap-3 pt-5">
                <input id="thirdPlace" type="checkbox" checked={tournamentForm.thirdPlaceMatchEnabled} onChange={(e) => setTournamentForm((prev) => ({ ...prev, thirdPlaceMatchEnabled: e.target.checked }))} className="w-4 h-4" />
                <label htmlFor="thirdPlace" className="text-gray-300 text-sm cursor-pointer">Enable third place match</label>
              </div>
            </div>
            <button type="button" onClick={saveFormat} disabled={saving} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Format'}
            </button>
          </>
        ) : null}
        {currentStep === 'schedule' && workflow ? (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-white font-black text-2xl">Schedule</h2>
                {workflow.tournament.formatType === 'ROUND_ROBIN' && (
                  <p className="text-gray-400 text-sm mt-1">Auto Build generates round-robin matches — every team plays every other team once.</p>
                )}
                {workflow.tournament.formatType === 'GROUP_STAGE' && (
                  <p className="text-gray-400 text-sm mt-1">Auto Build generates group-phase matches and placeholder knockout rounds. Fill in knockout teams after groups complete.</p>
                )}
                {(!workflow.tournament.formatType || workflow.tournament.formatType === 'KNOCKOUT') && (
                  <p className="text-gray-400 text-sm mt-1">Auto Build generates a single-elimination bracket. Teams must be an even number for this to work.</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (!tournamentId) return
                    const overwrite = workflow.matches.length > 0 && window.confirm('Overwrite the current schedule?')
                    if (workflow.matches.length > 0 && !overwrite) return
                    setError('')
                    try {
                      await generateTournamentSchedule(tournamentId, overwrite)
                    } catch (err: unknown) {
                      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Could not generate schedule.')
                      return
                    }
                    await loadWorkflow(tournamentId)
                  }}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg text-sm"
                >
                  Auto Build Schedule
                </button>
                {workflow.tournament.formatType === 'GROUP_STAGE' && workflow.matches.some((m) => m.stageName === 'Knockout' && !m.homeTeamId && !m.awayTeamId) && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!tournamentId) return
                      setError('')
                      try {
                        await seedTournamentKnockoutBracket(tournamentId)
                        await loadWorkflow(tournamentId)
                      } catch (err: unknown) {
                        setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Could not seed the knockout bracket.')
                      }
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-lg text-sm"
                  >
                    Seed Knockout Bracket
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMatchForm({ ...emptyMatchForm(), venue: workflow.tournament.location, matchDate: workflow.tournament.startDate })
                    setEditingMatch(null)
                    setShowMatchForm(true)
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Manual Match
                </button>
              </div>
            </div>

            {showMatchForm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950 border border-gray-800 rounded-xl p-4">
                <select className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" value={matchForm.homeTeamId ?? ''} onChange={(e) => setMatchForm((prev) => ({ ...prev, homeTeamId: e.target.value ? Number(e.target.value) : undefined }))}><option value="">Home team</option>{workflow.teams.map((team) => <option key={team.teamId} value={team.teamId}>{team.teamName}</option>)}</select>
                <select className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" value={matchForm.awayTeamId ?? ''} onChange={(e) => setMatchForm((prev) => ({ ...prev, awayTeamId: e.target.value ? Number(e.target.value) : undefined }))}><option value="">Away team</option>{workflow.teams.map((team) => <option key={team.teamId} value={team.teamId}>{team.teamName}</option>)}</select>
                <input className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="Stage" value={matchForm.stageName ?? ''} onChange={(e) => setMatchForm((prev) => ({ ...prev, stageName: e.target.value }))} />
                <input className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="Round" value={matchForm.roundName ?? ''} onChange={(e) => setMatchForm((prev) => ({ ...prev, roundName: e.target.value }))} />
                <input className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" type="date" value={matchForm.matchDate ?? ''} onChange={(e) => setMatchForm((prev) => ({ ...prev, matchDate: e.target.value }))} />
                <input className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" type="time" value={matchForm.kickoffTime ?? ''} onChange={(e) => setMatchForm((prev) => ({ ...prev, kickoffTime: e.target.value }))} />
                <input className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="Venue" value={matchForm.venue ?? ''} onChange={(e) => setMatchForm((prev) => ({ ...prev, venue: e.target.value }))} />
                <input className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" placeholder="Field name" value={matchForm.fieldName ?? ''} onChange={(e) => setMatchForm((prev) => ({ ...prev, fieldName: e.target.value }))} />
                <select className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm" value={matchForm.status} onChange={(e) => setMatchForm((prev) => ({ ...prev, status: e.target.value }))}>{MATCH_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
                <textarea className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm min-h-[100px] md:col-span-2" placeholder="Notes" value={matchForm.notes ?? ''} onChange={(e) => setMatchForm((prev) => ({ ...prev, notes: e.target.value }))} />
                <div className="md:col-span-2 flex gap-3">
                  <button type="button" onClick={saveMatch} disabled={saving} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-50">{saving ? 'Saving...' : editingMatch ? 'Save Match' : 'Create Match'}</button>
                  <button type="button" onClick={() => { setShowMatchForm(false); setEditingMatch(null); setMatchForm(emptyMatchForm()) }} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">Close</button>
                </div>
              </div>
            ) : null}

            {workflow.matches.length === 0 ? <EmptyState title="No matches yet" description="Build the schedule once teams and format are ready." /> : (() => {
              const hasUnseededKnockout = workflow.tournament.formatType === 'GROUP_STAGE' && workflow.matches.some((m) => m.stageName === 'Knockout' && !m.homeTeamId && !m.awayTeamId)
              const stageOrder = Array.from(new Set(workflow.matches.map((m) => m.stageName || 'Unassigned')))
              return (
                <div className="space-y-6">
                  {hasUnseededKnockout && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-sm">
                      Knockout bracket slots are waiting to be seeded. Once all group matches are <span className="font-bold text-white">FINAL</span>, click <span className="font-bold text-white">Seed Knockout Bracket</span> to fill them with the group stage winners.
                    </div>
                  )}
                  {stageOrder.map((stage) => {
                    const stageMatches = workflow.matches.filter((m) => (m.stageName || 'Unassigned') === stage)
                    return (
                      <div key={stage}>
                        <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">{stage}</div>
                        <div className="space-y-3">
                          {stageMatches.map((match) => (
                            <div key={match.id} className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex items-start justify-between gap-4">
                              <div>
                                <div className="text-white font-semibold">
                                  {match.homeTeamName
                                    ? match.homeTeamName
                                    : <span className="text-gray-500 italic">TBD</span>}
                                  {' vs '}
                                  {match.awayTeamName
                                    ? match.awayTeamName
                                    : <span className="text-gray-500 italic">TBD</span>}
                                </div>
                                <div className="text-gray-400 text-sm mt-1">{match.stageName || 'Stage not set'}{match.roundName ? `, ${match.roundName}` : ''}</div>
                                <div className="text-gray-500 text-xs mt-1">{match.matchDate || 'Date TBD'}{match.kickoffTime ? ` at ${match.kickoffTime.slice(0, 5)}` : ''}{match.venue ? `, ${match.venue}` : ''}</div>
                              </div>
                              <div className="flex gap-2 items-start">
                                <StatusBadge status={match.status} />
                                <button type="button" onClick={() => openMatchEditor(match)} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs">Edit</button>
                                <button type="button" onClick={async () => { if (!window.confirm('Delete this match?')) return; await deleteTournamentMatch(tournamentId!, match.id); await loadWorkflow(tournamentId!) }} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs">Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </>
        ) : null}
        {currentStep === 'results' && workflow ? (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-white font-black text-2xl">Results</h2>
                <p className="text-gray-400 text-sm mt-1">Enter scores to update standings automatically. Set status to <span className="text-white">Final</span> to count the result.</p>
              </div>
              {workflow.completedMatches > 0 ? (
                <button type="button" onClick={() => setStep('standings')} className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 px-4 py-2 rounded-lg text-sm font-semibold">
                  View Standings →
                </button>
              ) : null}
            </div>
            {workflow.matches.length === 0 ? <EmptyState title="Build the schedule first" description="Results are entered against scheduled matches." /> : (() => {
              const stageOrder = Array.from(new Set(workflow.matches.map((m) => m.stageName || 'Unassigned')))
              return (
                <div className="space-y-6">
                  {stageOrder.map((stage) => {
                    const stageMatches = workflow.matches.filter((m) => (m.stageName || 'Unassigned') === stage)
                    return (
                      <div key={stage}>
                        <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">{stage}</div>
                        <div className="space-y-3">
                          {stageMatches.map((match) => {
                            const inline = inlineResults[match.id]
                            const isSaving = savingResultId === match.id
                            return (
                              <div key={match.id} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                                <div className="flex items-start gap-4 flex-wrap">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-white font-semibold">{match.homeTeamName ?? 'TBD'} vs {match.awayTeamName ?? 'TBD'}</div>
                                    <div className="text-gray-400 text-sm mt-1">{match.stageName || 'Stage not set'}{match.roundName ? `, ${match.roundName}` : ''}{match.matchDate ? ` · ${match.matchDate}` : ''}</div>
                                  </div>
                                  {!inline ? (
                                    <div className="flex items-center gap-3 shrink-0">
                                      <StatusBadge status={match.status} />
                                      <div className="text-white font-black text-xl tabular-nums">{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</div>
                                      <button type="button" onClick={() => openInlineResult(match)} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs">Enter Score</button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                                      <input
                                        type="number"
                                        min={0}
                                        value={inline.homeScore}
                                        onChange={(e) => setInlineResults((prev) => ({ ...prev, [match.id]: { ...prev[match.id], homeScore: e.target.value } }))}
                                        className="w-14 bg-black border border-gray-700 rounded-lg px-2 py-1.5 text-white text-sm text-center tabular-nums"
                                        placeholder="0"
                                      />
                                      <span className="text-gray-500">:</span>
                                      <input
                                        type="number"
                                        min={0}
                                        value={inline.awayScore}
                                        onChange={(e) => setInlineResults((prev) => ({ ...prev, [match.id]: { ...prev[match.id], awayScore: e.target.value } }))}
                                        className="w-14 bg-black border border-gray-700 rounded-lg px-2 py-1.5 text-white text-sm text-center tabular-nums"
                                        placeholder="0"
                                      />
                                      <select
                                        value={inline.status}
                                        onChange={(e) => setInlineResults((prev) => ({ ...prev, [match.id]: { ...prev[match.id], status: e.target.value } }))}
                                        className="bg-black border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs"
                                      >
                                        {MATCH_STATUSES.map((s) => <option key={s}>{s}</option>)}
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() => saveInlineResult(match)}
                                        disabled={isSaving}
                                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-3 py-1.5 rounded-lg text-xs disabled:opacity-50"
                                      >
                                        {isSaving ? '...' : 'Save'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setInlineResults((prev) => { const next = { ...prev }; delete next[match.id]; return next })}
                                        className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
            {workflow.matches.some((m) => m.stageName === 'Knockout') && (
              <AdminBracketView matches={workflow.matches} />
            )}
          </>
        ) : null}

        {currentStep === 'standings' && workflow ? (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-white font-black text-2xl">Standings</h2>
                <p className="text-gray-400 text-sm mt-1">Auto-calculated from finalized match results. Sorted by points, goal difference, goals scored.</p>
              </div>
              <div className="text-gray-500 text-sm">{workflow.completedMatches} / {workflow.matches.length} matches completed</div>
            </div>
            {workflow.tournament.formatType === 'KNOCKOUT' ? (
              <EmptyState title="No standings for knockout format" description="Knockout tournaments use a bracket — only match results matter." />
            ) : (() => {
              const groupStandings = workflow.tournament.formatType === 'GROUP_STAGE'
                ? (workflow.standings ?? []).filter((s) => s.groupName?.startsWith('Group '))
                : (workflow.standings ?? [])
              return !groupStandings.length ? (
                <EmptyState title="No standings yet" description="Mark matches as Final in the Results step to see the live standings table." />
              ) : (
                <StandingsTable standings={groupStandings} />
              )
            })()}
          </>
        ) : null}


        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <button
            type="button"
            onClick={() => setStep(previousStep)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setStep(nextStep)}
            disabled={!tournamentId && currentStep === 'details'}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Standings Table component ─────────────────────────────────────────────────

function StandingsTable({ standings }: { standings: StandingEntry[] }) {
  const groups = standings.reduce<Record<string, StandingEntry[]>>((acc, entry) => {
    const key = entry.groupName ?? 'All Matches'
    ;(acc[key] = acc[key] ?? []).push(entry)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([groupName, rows]) => (
        <div key={groupName}>
          <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">{groupName}</div>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950">
                  <th className="text-left text-gray-500 font-medium px-4 py-2.5 w-8">#</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-2.5">Team</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-2.5 w-10" title="Played">P</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-2.5 w-10" title="Won">W</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-2.5 w-10" title="Drawn">D</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-2.5 w-10" title="Lost">L</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-2.5 w-10" title="Goals For">GF</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-2.5 w-10" title="Goals Against">GA</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-2.5 w-10" title="Goal Difference">GD</th>
                  <th className="text-center text-white font-bold px-4 py-2.5 w-12" title="Points">Pts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.teamId} className={`border-b border-gray-900 last:border-0 ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}`}>
                    <td className="px-4 py-3 text-gray-500 text-center">{row.position}</td>
                    <td className="px-4 py-3 text-white font-semibold">{row.teamName}</td>
                    <td className="px-3 py-3 text-gray-400 text-center tabular-nums">{row.played}</td>
                    <td className="px-3 py-3 text-green-400 text-center tabular-nums">{row.won}</td>
                    <td className="px-3 py-3 text-gray-400 text-center tabular-nums">{row.drawn}</td>
                    <td className="px-3 py-3 text-red-400 text-center tabular-nums">{row.lost}</td>
                    <td className="px-3 py-3 text-gray-400 text-center tabular-nums">{row.goalsFor}</td>
                    <td className="px-3 py-3 text-gray-400 text-center tabular-nums">{row.goalsAgainst}</td>
                    <td className={`px-3 py-3 text-center tabular-nums font-medium ${row.goalDifference > 0 ? 'text-green-400' : row.goalDifference < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>
                    <td className="px-4 py-3 text-white font-black text-center tabular-nums">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Admin Bracket View ────────────────────────────────────────────────────────

function AdminBracketView({ matches }: { matches: TournamentMatch[] }) {
  const bracketMatches = matches.filter((m) => m.stageName === 'Knockout')
  if (bracketMatches.length === 0) return null

  const knownRoundOrder = ['Round of 32', 'Round of 16', 'Round of 8', 'Quarterfinal', 'Semifinal', 'Final']

  const roundMap = new Map<string, TournamentMatch[]>()
  for (const m of bracketMatches) {
    const base = (m.roundName ?? 'Round').replace(/\s+\d+$/, '').trim()
    const key = knownRoundOrder.find((r) => r.toLowerCase() === base.toLowerCase()) ?? base
    const arr = roundMap.get(key) ?? []
    arr.push(m)
    roundMap.set(key, arr)
  }

  const sorted: [string, TournamentMatch[]][] = []
  for (const r of knownRoundOrder) {
    if (roundMap.has(r)) sorted.push([r, roundMap.get(r)!])
  }
  for (const [k, v] of roundMap.entries()) {
    if (!knownRoundOrder.some((r) => r.toLowerCase() === k.toLowerCase())) sorted.push([k, v])
  }

  return (
    <div className="mt-6">
      <h3 className="text-white font-black text-lg mb-1">Knockout Bracket</h3>
      <p className="text-gray-500 text-sm mb-4">
        Winners automatically advance when a match is saved as <span className="text-white font-semibold">FINAL</span>.
      </p>
      <div className="flex gap-5 overflow-x-auto pb-4">
        {sorted.map(([roundName, roundMatches]) => (
          <div key={roundName} className="flex flex-col gap-3 min-w-[210px]">
            <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest text-center">{roundName}</div>
            <div className="flex flex-col gap-3 justify-around h-full">
              {roundMatches.map((m) => {
                const isFinal = m.status === 'FINAL'
                const homeWon = isFinal && m.homeScore != null && m.awayScore != null && m.homeScore > m.awayScore
                const awayWon = isFinal && m.homeScore != null && m.awayScore != null && m.awayScore > m.homeScore
                return (
                  <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden text-sm">
                    <div className={`flex items-center justify-between px-3 py-2.5 gap-3 ${homeWon ? 'bg-cyan-500/10' : ''}`}>
                      <span className={`font-semibold truncate ${homeWon ? 'text-cyan-300' : m.homeTeamName ? 'text-gray-200' : 'text-gray-600 italic'}`}>
                        {m.homeTeamName ?? 'TBD'}
                      </span>
                      {isFinal && m.homeScore != null && (
                        <span className={`tabular-nums font-black shrink-0 ${homeWon ? 'text-cyan-300' : 'text-gray-400'}`}>{m.homeScore}</span>
                      )}
                    </div>
                    <div className="h-px bg-gray-800" />
                    <div className={`flex items-center justify-between px-3 py-2.5 gap-3 ${awayWon ? 'bg-cyan-500/10' : ''}`}>
                      <span className={`font-semibold truncate ${awayWon ? 'text-cyan-300' : m.awayTeamName ? 'text-gray-200' : 'text-gray-600 italic'}`}>
                        {m.awayTeamName ?? 'TBD'}
                      </span>
                      {isFinal && m.awayScore != null && (
                        <span className={`tabular-nums font-black shrink-0 ${awayWon ? 'text-cyan-300' : 'text-gray-400'}`}>{m.awayScore}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicTournamentView } from '../services/api'
import type { StandingEntry, TournamentMatch, TournamentWorkflow, TournamentWorkflowTeam } from '../types'
import PageSkeleton from '../components/PageSkeleton'
import StatusBadge from '../components/StatusBadge'

type Tab = 'overview' | 'teams' | 'schedule' | 'standings' | 'bracket'

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<TournamentWorkflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')

  useEffect(() => {
    if (!id) return
    getPublicTournamentView(Number(id))
      .then(setData)
      .catch(() => setError('Could not load tournament details.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    const name = data?.tournament.name
    if (name) {
      document.title = `${name} | Kante Elite Training`
    }
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [data?.tournament.name])

  const isKnockout = data?.tournament.formatType === 'KNOCKOUT'
  const hasKnockoutMatches = data?.matches.some((m) => m.stageName === 'Knockout') ?? false
  const showBracket = isKnockout || (data?.tournament.formatType === 'GROUP_STAGE' && hasKnockoutMatches)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'teams', label: `Teams (${data?.teams.length ?? 0})` },
    { key: 'schedule', label: `Schedule (${data?.matches.length ?? 0})` },
    ...(data?.standings && data.standings.length > 0
      ? [{ key: 'standings' as Tab, label: 'Standings' }]
      : []),
    ...(showBracket && data && data.matches.length > 0
      ? [{ key: 'bracket' as Tab, label: 'Bracket' }]
      : []),
  ]

  if (loading) return <PageSkeleton titleWidthClassName="w-64" count={4} />

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>
          <p className="text-white text-xl font-bold mb-2">Tournament Not Found</p>
          <p className="text-gray-400 text-sm mb-6">{error || 'This tournament does not exist.'}</p>
          <Link to="/tournaments" className="text-amber-500 hover:text-amber-400 text-sm">← Back to Tournaments</Link>
        </div>
      </div>
    )
  }

  const t = data.tournament
  const spotsLeft = t.maxTeams - t.registeredTeams
  const isDeadlinePassed = t.registrationDeadline ? new Date(t.registrationDeadline) < new Date() : false
  const canRegister = spotsLeft > 0 && t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && !isDeadlinePassed

  return (
    <div className="bg-black pt-20 pb-32 sm:pb-36 md:pb-16">
      {/* Hero / header */}
      <div className="bg-[#0a0a0a] border-b border-[#1a1a1a] py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Link to="/tournaments" className="text-amber-500 hover:text-amber-400 text-sm mb-6 inline-flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            All Tournaments
          </Link>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <StatusBadge status={t.status} />
                {t.ageGroup && (
                  <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    {t.ageGroup}
                  </span>
                )}
                {t.division && (
                  <span className="text-xs text-gray-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                    {t.division}
                  </span>
                )}
              </div>
              <h1 className="text-white text-4xl font-black mb-2">{t.name}</h1>
              <p className="text-gray-400">{t.location}</p>
            </div>
            <div className="w-full shrink-0 md:w-auto">
              {canRegister ? (
                <Link
                  to={`/tournaments/${t.id}/register`}
                  className="btn-primary block w-full text-center md:w-auto"
                >
                  Register Team
                </Link>
              ) : (
                <div className="w-full rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] px-6 py-3 text-center text-sm font-semibold text-gray-500 md:w-auto">
                  {t.status === 'COMPLETED' ? 'Tournament Ended' : t.status === 'CANCELLED' ? 'Cancelled' : isDeadlinePassed ? 'Registration Closed' : 'Team Spots Full'}
                </div>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <StatCard label="Start Date" value={formatDate(t.startDate)} />
            {t.endDate && t.endDate !== t.startDate && <StatCard label="End Date" value={formatDate(t.endDate)} />}
            <StatCard
              label="Teams"
              value={`${t.registeredTeams} / ${t.maxTeams}`}
              color={spotsLeft > 3 ? 'text-green-400' : spotsLeft > 0 ? 'text-yellow-400' : 'text-red-400'}
            />
            {t.registrationDeadline && (
              <StatCard
                label="Reg. Deadline"
                value={formatDate(t.registrationDeadline)}
                color={isDeadlinePassed ? 'text-red-400' : 'text-white'}
              />
            )}
            {(t.entryFee ?? 0) > 0 && <StatCard label="Entry Fee" value={`$${t.entryFee}`} color="text-yellow-400" />}
            <StatCard label="Format" value={formatType(t.formatType)} />
            <StatCard label="Completed" value={`${data.completedMatches} / ${data.matches.length} matches`} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-20 border-b border-[#1a1a1a] bg-black/95 px-4 backdrop-blur md:top-20">
        <div
          className="mx-auto flex max-w-5xl gap-2 overflow-x-auto overflow-y-visible py-2 whitespace-nowrap overscroll-x-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              type="button"
              onClick={() => setTab(tabItem.key)}
              className={`min-h-11 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                tab === tabItem.key
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'text-gray-500 hover:bg-[#111] hover:text-gray-300'
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
        {tab === 'overview' && <OverviewTab tournament={t} />}
        {tab === 'teams' && <TeamsTab teams={data.teams} />}
        {tab === 'schedule' && <ScheduleTab matches={data.matches} />}
        {tab === 'standings' && data.standings?.length > 0 && <StandingsTab standings={data.standings} />}
        {tab === 'bracket' && showBracket && <BracketTab matches={data.matches} />}
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d?: string | null) {
  if (!d) return '|'
  try {
    // Parse as local date by splitting the date string to avoid UTC offset shifts
    const parts = d.split('-').map(Number)
    const year = parts[0]
    const month = parts[1]
    const day = parts[2]
    if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) return d
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return d
  }
}

function formatType(t?: string | null) {
  if (!t) return 'Round Robin'
  return t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function StatCard({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl px-4 py-3">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className={`font-bold text-sm ${color}`}>{value}</p>
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ tournament: t }: { tournament: TournamentWorkflow['tournament'] }) {
  return (
    <div className="space-y-8">
      {t.description ? (
        <section>
          <h2 className="text-white font-black text-xl mb-3">About This Tournament</h2>
          <p className="text-gray-400 leading-relaxed whitespace-pre-line">{t.description}</p>
        </section>
      ) : null}
      <section>
        <h2 className="text-white font-black text-xl mb-4">Tournament Details</h2>
        <div className="bg-[#111] border border-[#222] rounded-xl divide-y divide-[#1a1a1a]">
          {[
            ['Location', t.location],
            ['Age Group', t.ageGroup],
            ['Division', t.division],
            ['Format', formatType(t.formatType)],
            ['Start Date', formatDate(t.startDate)],
            ['End Date', formatDate(t.endDate)],
            ['Registration Deadline', formatDate(t.registrationDeadline)],
            ['Max Teams', String(t.maxTeams)],
            ['Entry Fee', (t.entryFee ?? 0) > 0 ? `$${t.entryFee}` : 'Free'],
            ['Match Duration', t.matchDurationMinutes ? `${t.matchDurationMinutes} minutes` : null],
            ['Points for Win', t.pointsForWin != null ? String(t.pointsForWin) : null],
            ['Points for Draw', t.pointsForDraw != null ? String(t.pointsForDraw) : null],
          ]
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-500 text-sm">{label}</span>
                <span className="text-white text-sm font-medium">{value}</span>
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}

// ─── Teams Tab ────────────────────────────────────────────────────────────────

function TeamsTab({ teams }: { teams: TournamentWorkflowTeam[] }) {
  const approved = teams.filter((t) => t.registrationStatus === 'APPROVED')
  const others = teams.filter((t) => t.registrationStatus !== 'APPROVED')

  if (teams.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
        </div>
        <p className="text-white font-semibold">No teams registered yet</p>
        <p className="text-sm mt-1">Be the first team to register for this tournament.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {approved.length > 0 && (
        <section>
          <h2 className="text-white font-black text-xl mb-4">Confirmed Teams ({approved.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {approved.map((team) => <TeamCard key={team.teamId} team={team} />)}
          </div>
        </section>
      )}
      {others.length > 0 && (
        <section>
          <h2 className="text-white font-black text-xl mb-4">Pending / Waitlisted ({others.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {others.map((team) => <TeamCard key={team.teamId} team={team} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function TeamCard({ team }: { team: TournamentWorkflowTeam }) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-white font-bold">{team.teamName}</p>
        <StatusBadge status={team.registrationStatus} />
      </div>
      {team.clubName && <p className="text-gray-500 text-xs mb-1">{team.clubName}</p>}
      <p className="text-gray-400 text-sm">{team.captainName}</p>
      <p className="text-gray-500 text-xs mt-2">{team.playerCount} players</p>
      {team.players && team.players.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#222] space-y-1">
          {team.players.slice(0, 6).map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-xs text-gray-400">
              {p.jerseyNumber && <span className="text-gray-600 w-5 text-right">#{p.jerseyNumber}</span>}
              <span className={p.captain ? 'text-amber-400 font-semibold' : ''}>{p.fullName}{p.captain ? ' (C)' : ''}</span>
              {p.position && <span className="text-gray-600">· {p.position}</span>}
            </div>
          ))}
          {team.players.length > 6 && (
            <p className="text-gray-600 text-xs">+{team.players.length - 6} more</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Schedule Tab ─────────────────────────────────────────────────────────────

function ScheduleTab({ matches }: { matches: TournamentMatch[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, TournamentMatch[]>()
    for (const m of matches) {
      const key = m.stageName ?? 'Matches'
      const arr = map.get(key) ?? []
      arr.push(m)
      map.set(key, arr)
    }
    return map
  }, [matches])

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
        </div>
        <p className="text-white font-semibold">Schedule not published yet</p>
        <p className="text-sm mt-1">Check back once the tournament organizers set match times.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([stage, stageMatches]) => (
        <section key={stage}>
          <h2 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-4">{stage}</h2>
          <div className="space-y-3">
            {stageMatches.map((m) => <MatchRow key={m.id} match={m} />)}
          </div>
        </section>
      ))}
    </div>
  )
}

function MatchRow({ match: m }: { match: TournamentMatch }) {
  const isFinal = m.status === 'FINAL'
  return (
    <div className="rounded-2xl border border-[#222] bg-[#111] p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        {/* Teams + score */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-[#222] bg-black/30 p-3 sm:p-4">
          <span className="truncate text-right text-sm font-semibold text-white sm:text-base">{m.homeTeamName ?? 'TBD'}</span>
          <div className={`rounded-xl px-4 py-3 text-center text-xl font-black tabular-nums sm:text-2xl ${isFinal ? 'bg-amber-500/10 text-amber-400' : 'bg-[#1a1a1a] text-gray-400'}`}>
            <div className="mb-1 text-[10px] uppercase tracking-[0.18em] sm:text-xs">{isFinal ? 'Final' : 'Match'}</div>
            {isFinal ? `${m.homeScore ?? 0} – ${m.awayScore ?? 0}` : 'vs'}
          </div>
          <span className="truncate text-sm font-semibold text-white sm:text-base">{m.awayTeamName ?? 'TBD'}</span>
        </div>
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 sm:text-sm">
          {m.roundName && <span>{m.roundName}</span>}
          {m.matchDate && <span>{formatDate(m.matchDate)}</span>}
          {m.kickoffTime && <span>{m.kickoffTime.slice(0, 5)}</span>}
          {m.venue && <span>{m.venue}</span>}
          {m.fieldName && <span>· {m.fieldName}</span>}
          <StatusBadge status={m.status} className="w-full justify-center sm:w-auto" />
        </div>
      </div>
    </div>
  )
}

// ─── Standings Tab ────────────────────────────────────────────────────────────

function StandingsTab({ standings }: { standings: StandingEntry[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, StandingEntry[]>()
    for (const row of standings) {
      const key = row.groupName ?? 'All Matches'
      const arr = map.get(key) ?? []
      arr.push(row)
      map.set(key, arr)
    }
    return map
  }, [standings])

  return (
    <div className="space-y-8">
      {Array.from(groups.entries()).map(([groupName, rows]) => (
        <section key={groupName}>
          <h2 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-4">{groupName}</h2>
          <div className="overflow-x-auto rounded-xl border border-[#222]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#222] bg-[#0a0a0a]">
                  <th className="text-left text-gray-500 font-medium px-4 py-3 w-8">#</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3">Team</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-3 w-10" title="Played">P</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-3 w-10" title="Won">W</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-3 w-10" title="Drawn">D</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-3 w-10" title="Lost">L</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-3 w-10" title="Goals For">GF</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-3 w-10" title="Goals Against">GA</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-3 w-10" title="Goal Difference">GD</th>
                  <th className="text-center text-white font-bold px-4 py-3 w-12" title="Points">Pts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.teamId} className={`border-b border-[#1a1a1a] last:border-0 ${i % 2 === 0 ? 'bg-[#111]' : 'bg-[#0d0d0d]'}`}>
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
        </section>
      ))}
    </div>
  )
}

// ─── Bracket Tab ──────────────────────────────────────────────────────────────

function BracketTab({ matches }: { matches: TournamentMatch[] }) {
  // Only show matches in the Knockout stage (works for both KNOCKOUT and GROUP_STAGE formats)
  const bracketMatches = matches.filter((m) => m.stageName === 'Knockout')

  const rounds = useMemo(() => {
    const knownRoundOrder = ['Round of 32', 'Round of 16', 'Round of 8', 'Quarterfinal', 'Semifinal', 'Final']
    const thirdPlaceKey = 'Third Place'
    const map = new Map<string, TournamentMatch[]>()
    for (const m of bracketMatches) {
      const key = m.roundName ?? 'Round'
      const base = key.replace(/\s+\d+$/, '').trim()
      const normalized = knownRoundOrder.find((r) => base.toLowerCase() === r.toLowerCase()) ?? base
      const arr = map.get(normalized) ?? []
      arr.push(m)
      map.set(normalized, arr)
    }
    const sortedEntries: [string, TournamentMatch[]][] = []
    for (const r of knownRoundOrder) {
      if (map.has(r)) sortedEntries.push([r, map.get(r)!])
    }
    // Third Place after Final
    if (map.has(thirdPlaceKey)) sortedEntries.push([thirdPlaceKey, map.get(thirdPlaceKey)!])
    for (const [k, v] of map.entries()) {
      const known = [...knownRoundOrder, thirdPlaceKey]
      if (!known.some((r) => r.toLowerCase() === k.toLowerCase())) {
        sortedEntries.push([k, v])
      }
    }
    return sortedEntries
  }, [bracketMatches])

  if (bracketMatches.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
          </svg>
        </div>
        <p className="text-white font-semibold">Bracket not available yet</p>
        <p className="text-sm mt-1">The knockout bracket will appear here once matches have been seeded.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">Knockout bracket: winners advance from left to right.</p>
      <div
        className="-mx-4 overflow-x-auto overflow-y-visible px-4 pb-4 overscroll-x-contain snap-x snap-mandatory sm:mx-0 sm:px-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex min-w-max items-start gap-6 pr-4 sm:gap-8 sm:pr-0">
          {(rounds as [string, TournamentMatch[]][]).map(([roundName, roundMatches]) => (
            <div key={roundName} className="flex w-[220px] shrink-0 snap-start flex-col">
              <h3 className={`text-xs font-bold uppercase tracking-widest text-center mb-3 ${roundName === 'Final' ? 'text-amber-400' : roundName === 'Third Place' ? 'text-gray-400' : 'text-amber-500/70'}`}>
                {roundName}
              </h3>
              <div className="flex flex-col gap-4">
                {roundMatches.map((m) => (
                  <BracketMatch key={m.id} match={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BracketMatch({ match: m }: { match: TournamentMatch }) {
  const isFinal = m.status === 'FINAL'
  const homeWon = isFinal && m.homeScore != null && m.awayScore != null && m.homeScore > m.awayScore
  const awayWon = isFinal && m.homeScore != null && m.awayScore != null && m.awayScore > m.homeScore
  const isSeeded = m.homeTeamName != null || m.awayTeamName != null

  return (
    <div className={`border rounded-xl overflow-hidden text-sm ${isFinal ? 'bg-[#111] border-[#333]' : isSeeded ? 'bg-[#111] border-[#222]' : 'bg-[#0d0d0d] border-[#222]'}`}>
      <BracketTeamRow name={m.homeTeamName ?? 'TBD'} score={isFinal ? m.homeScore : undefined} won={homeWon} seeded={!!m.homeTeamName} />
      <div className="h-px bg-[#222]" />
      <BracketTeamRow name={m.awayTeamName ?? 'TBD'} score={isFinal ? m.awayScore : undefined} won={awayWon} seeded={!!m.awayTeamName} />
      {m.status !== 'SCHEDULED' && (
        <div className={`px-3 py-1 text-xs font-semibold border-t border-[#222] ${isFinal ? 'text-green-400' : m.status === 'IN_PROGRESS' ? 'text-amber-400' : 'text-gray-500'}`}>
          {m.status}
        </div>
      )}
    </div>
  )
}

function BracketTeamRow({ name, score, won, seeded }: { name: string; score?: number | null; won: boolean; seeded: boolean }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 gap-3 ${won ? 'bg-green-500/10' : ''}`}>
      <span className={`font-semibold truncate ${won ? 'text-green-300' : seeded ? 'text-gray-200' : 'text-gray-600 italic'}`}>
        {won && '▶ '}{name}
      </span>
      {score != null && (
        <span className={`tabular-nums font-black shrink-0 text-base ${won ? 'text-green-300' : 'text-gray-400'}`}>{score}</span>
      )}
    </div>
  )
}


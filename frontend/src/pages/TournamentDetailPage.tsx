import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicTournamentView } from '../services/api'
import type { StandingEntry, TournamentMatch, TournamentWorkflow, TournamentWorkflowTeam } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
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

  if (loading) return <LoadingSpinner label="Loading tournament..." />

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-white text-xl font-bold mb-2">Tournament Not Found</p>
          <p className="text-gray-400 text-sm mb-6">{error || 'This tournament does not exist.'}</p>
          <Link to="/tournaments" className="text-cyan-400 hover:text-cyan-300 text-sm">← Back to Tournaments</Link>
        </div>
      </div>
    )
  }

  const t = data.tournament
  const spotsLeft = t.maxTeams - t.registeredTeams
  const isDeadlinePassed = t.registrationDeadline ? new Date(t.registrationDeadline) < new Date() : false
  const canRegister = spotsLeft > 0 && t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && !isDeadlinePassed

  return (
    <div className="min-h-screen bg-black">
      {/* Hero / header */}
      <div className="bg-gray-950 border-b border-gray-800 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Link to="/tournaments" className="text-cyan-400 hover:text-cyan-300 text-sm mb-6 inline-block">
            ← All Tournaments
          </Link>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <StatusBadge status={t.status} />
                {t.ageGroup && (
                  <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                    {t.ageGroup}
                  </span>
                )}
                {t.division && (
                  <span className="text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                    {t.division}
                  </span>
                )}
              </div>
              <h1 className="text-white text-4xl font-black mb-2">{t.name}</h1>
              <p className="text-gray-400">{t.location}</p>
            </div>
            <div className="shrink-0">
              {canRegister ? (
                <Link
                  to={`/tournaments/${t.id}/register`}
                  className="block bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-xl text-sm transition-colors"
                >
                  Register Team
                </Link>
              ) : (
                <div className="bg-gray-800 text-gray-500 font-semibold px-6 py-3 rounded-xl text-sm text-center">
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
      <div className="border-b border-gray-800 px-4 sticky top-0 bg-black z-10">
        <div className="max-w-5xl mx-auto flex gap-1 overflow-x-auto">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              type="button"
              onClick={() => setTab(tabItem.key)}
              className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab === tabItem.key
                  ? 'border-cyan-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-4 py-10">
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
  if (!d) return '—'
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
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
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
        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
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
              <div key={label} className="flex justify-between items-center px-5 py-3">
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
        <div className="text-4xl mb-3">👥</div>
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
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-white font-bold">{team.teamName}</p>
        <StatusBadge status={team.registrationStatus} />
      </div>
      {team.clubName && <p className="text-gray-500 text-xs mb-1">{team.clubName}</p>}
      <p className="text-gray-400 text-sm">{team.captainName}</p>
      <p className="text-gray-500 text-xs mt-2">{team.playerCount} players</p>
      {team.players && team.players.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-800 space-y-1">
          {team.players.slice(0, 6).map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-xs text-gray-400">
              {p.jerseyNumber && <span className="text-gray-600 w-5 text-right">#{p.jerseyNumber}</span>}
              <span className={p.captain ? 'text-cyan-400 font-semibold' : ''}>{p.fullName}{p.captain ? ' (C)' : ''}</span>
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
        <div className="text-4xl mb-3">📅</div>
        <p className="text-white font-semibold">Schedule not published yet</p>
        <p className="text-sm mt-1">Check back once the tournament organizers set match times.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([stage, stageMatches]) => (
        <section key={stage}>
          <h2 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">{stage}</h2>
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
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Teams + score */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-white font-semibold text-sm truncate flex-1 text-right">{m.homeTeamName ?? 'TBD'}</span>
          <div className={`shrink-0 px-3 py-1 rounded-lg text-sm font-black tabular-nums ${isFinal ? 'bg-cyan-500/10 text-cyan-300' : 'bg-gray-800 text-gray-400'}`}>
            {isFinal ? `${m.homeScore ?? 0} – ${m.awayScore ?? 0}` : 'vs'}
          </div>
          <span className="text-white font-semibold text-sm truncate flex-1">{m.awayTeamName ?? 'TBD'}</span>
        </div>
        {/* Meta */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap text-xs text-gray-500">
          {m.roundName && <span>{m.roundName}</span>}
          {m.matchDate && <span>{formatDate(m.matchDate)}</span>}
          {m.kickoffTime && <span>{m.kickoffTime.slice(0, 5)}</span>}
          {m.venue && <span>{m.venue}</span>}
          {m.fieldName && <span>· {m.fieldName}</span>}
          <StatusBadge status={m.status} />
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
          <h2 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">{groupName}</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950">
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
                  <tr key={row.teamId} className={`border-b border-gray-900 last:border-0 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}`}>
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
        <div className="text-4xl mb-3">🏆</div>
        <p className="text-white font-semibold">Bracket not available yet</p>
        <p className="text-sm mt-1">The knockout bracket will appear here once matches have been seeded.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">Knockout bracket — winners advance from left to right.</p>
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex gap-8 items-start" style={{ minWidth: 'max-content' }}>
          {(rounds as [string, TournamentMatch[]][]).map(([roundName, roundMatches]) => (
            <div key={roundName} className="flex flex-col w-[220px] shrink-0">
              <h3 className={`text-xs font-bold uppercase tracking-widest text-center mb-3 ${roundName === 'Final' ? 'text-yellow-400' : roundName === 'Third Place' ? 'text-gray-400' : 'text-cyan-400'}`}>
                {roundName === 'Final' ? '🏆 ' : ''}{roundName}
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
    <div className={`border rounded-xl overflow-hidden text-sm ${isFinal ? 'bg-gray-900 border-gray-700' : isSeeded ? 'bg-gray-900 border-gray-800' : 'bg-gray-950 border-gray-800'}`}>
      <BracketTeamRow name={m.homeTeamName ?? 'TBD'} score={isFinal ? m.homeScore : undefined} won={homeWon} seeded={!!m.homeTeamName} />
      <div className="h-px bg-gray-800" />
      <BracketTeamRow name={m.awayTeamName ?? 'TBD'} score={isFinal ? m.awayScore : undefined} won={awayWon} seeded={!!m.awayTeamName} />
      {m.status !== 'SCHEDULED' && (
        <div className={`px-3 py-1 text-xs font-semibold border-t border-gray-800 ${isFinal ? 'text-green-400' : m.status === 'IN_PROGRESS' ? 'text-yellow-400' : 'text-gray-500'}`}>
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


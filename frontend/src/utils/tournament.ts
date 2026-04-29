import type { Tournament } from '../types'

function parseTournamentDate(value?: string | null) {
  if (!value) return null

  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null

  const parsed = new Date(year, month - 1, day)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

export function formatTournamentDate(value?: string | null, fallback = 'TBD') {
  const parsed = parseTournamentDate(value)
  if (!parsed) return fallback

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTournamentDateRange(
  startDate?: string | null,
  endDate?: string | null,
  fallback = 'To be confirmed',
) {
  if (!startDate) return fallback

  const formattedStart = formatTournamentDate(startDate, startDate)
  if (endDate && endDate !== startDate) {
    return `${formattedStart} - ${formatTournamentDate(endDate, endDate)}`
  }

  return formattedStart
}

export function getTournamentRegistrationState(
  tournament: Pick<Tournament, 'maxTeams' | 'registeredTeams' | 'registrationDeadline' | 'status'>,
) {
  const spotsLeft = Math.max(tournament.maxTeams - tournament.registeredTeams, 0)
  const isDeadlinePassed = tournament.registrationDeadline
    ? new Date(`${tournament.registrationDeadline}T23:59:59`).getTime() < Date.now()
    : false
  const isCompleted = tournament.status === 'COMPLETED'
  const isCancelled = tournament.status === 'CANCELLED'
  const canRegister = !isCompleted && !isCancelled && !isDeadlinePassed && spotsLeft > 0

  let unavailableLabel: string | null = null
  if (isCompleted) {
    unavailableLabel = 'Tournament Ended'
  } else if (isCancelled) {
    unavailableLabel = 'Tournament Cancelled'
  } else if (isDeadlinePassed) {
    unavailableLabel = 'Registration Closed'
  } else if (spotsLeft === 0) {
    unavailableLabel = 'Team Spots Full'
  }

  return {
    spotsLeft,
    isDeadlinePassed,
    canRegister,
    unavailableLabel,
  }
}

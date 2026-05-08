import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTournaments } from '../services/api'
import type { Tournament } from '../types'
import StatusBadge from '../components/StatusBadge'
import ErrorBanner from '../components/ErrorBanner'
import CTASection from '../components/CTASection'
import {
  formatTournamentDate,
  formatTournamentDateRange,
  getTournamentRegistrationState,
} from '../utils/tournament'

const POLL_INTERVAL_MS = 60_000

function TournamentCard({ tournament: t }: { tournament: Tournament }) {
  const registrationState = getTournamentRegistrationState(t)
  const spotsLeft = registrationState.spotsLeft
  const canRegister = registrationState.canRegister
  const cardCtaLabel =
    t.status === 'COMPLETED'
      ? 'View Results'
      : t.status === 'CANCELLED'
        ? 'Cancelled'
        : registrationState.unavailableLabel ?? 'View Tournament'

  return (
    <Link
      to={`/tournaments/${t.id}`}
      className="block bg-[#111] border border-[#222] hover:border-amber-500/30 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-0.5 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white text-xl font-black leading-tight group-hover:text-amber-400 transition-colors">{t.name}</h3>
          <p className="text-gray-400 text-sm mt-0.5">{t.location}</p>
          <p className="text-gray-500 text-xs mt-1">{formatTournamentDateRange(t.startDate, t.endDate)}</p>
        </div>
        <StatusBadge status={t.status} className="ml-2 shrink-0 mt-0.5" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
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
        {(t.entryFee ?? 0) > 0 && (
          <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full">
            ${t.entryFee} entry
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm text-gray-400 mb-4 flex-1">
        <div className="flex justify-between">
          <span>Dates</span>
          <span className="text-right text-white">{formatTournamentDateRange(t.startDate, t.endDate)}</span>
        </div>
        {t.registrationDeadline ? (
          <div className="flex justify-between">
            <span>Reg. Deadline</span>
            <span className={registrationState.isDeadlinePassed ? 'text-red-400' : 'text-white'}>
              {formatTournamentDate(t.registrationDeadline)}
              {registrationState.isDeadlinePassed ? ' (closed)' : ''}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span>Teams Registered</span>
          <span className="text-white">{t.registeredTeams} / {t.maxTeams}</span>
        </div>
        <div className="flex justify-between">
          <span>Spots Left</span>
          <span className={spotsLeft > 3 ? 'text-green-400' : spotsLeft > 0 ? 'text-amber-400' : 'text-red-400'}>
            {spotsLeft > 0 ? spotsLeft : 'Full'}
          </span>
        </div>
      </div>

      {t.description && (
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{t.description}</p>
      )}

      {canRegister ? (
        <div className="block w-full text-center bg-amber-500 group-hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl transition-colors text-sm">
          View &amp; Register
        </div>
      ) : (
        <div className="w-full text-center bg-[#1a1a1a] border border-[#2a2a2a] text-gray-500 font-semibold py-2.5 rounded-xl text-sm">
          {cardCtaLabel}
        </div>
      )}
    </Link>
  )
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showPast, setShowPast] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    document.title = 'Tournaments | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

  const fetchTournaments = () => {
    getTournaments()
      .then((data) => { setTournaments(data); setError('') })
      .catch(() => setError('Could not load tournaments. Please refresh to try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTournaments()
    intervalRef.current = setInterval(fetchTournaments, POLL_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Active = anything that is not finished or cancelled
  const activeTournaments = tournaments.filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED',
  )
  // Past = completed only (cancelled are hidden entirely from the public view)
  const pastTournaments = tournaments.filter((t) => t.status === 'COMPLETED')

  const activeStatuses = [...new Set(activeTournaments.map((t) => t.status))]

  const filteredActive = (
    filterStatus ? activeTournaments.filter((t) => t.status === filterStatus) : activeTournaments
  ).sort((a, b) => a.startDate.localeCompare(b.startDate))

  const closingSoon = activeTournaments.filter((t) => {
    if (!t.registrationDeadline || !getTournamentRegistrationState(t).canRegister) return false
    const today = new Date()
    const deadline = new Date(`${t.registrationDeadline}T23:59:59`)
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  })

  return (
    <div className="min-h-screen bg-black px-4 py-20">
      <div className="page-shell max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Competition
          </div>
          <h1 className="mb-4 text-3xl font-black text-white sm:text-4xl md:text-5xl">Tournaments</h1>
          <p className="mx-auto max-w-2xl text-base text-gray-400 sm:text-lg">
            Public registration is open. Review the details, choose your tournament, and register your team in a few minutes.
          </p>
          {!loading && activeTournaments.length > 0 ? (
            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                <p className="text-gray-400 text-sm mb-2">Available Now</p>
                <p className="text-3xl font-black text-green-400">{activeTournaments.length}</p>
              </div>
              <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                <p className="text-gray-400 text-sm mb-2">Closing Soon</p>
                <p className="text-3xl font-black text-amber-400">{closingSoon.length}</p>
              </div>
              <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                <p className="text-gray-400 text-sm mb-2">Total Listings</p>
                <p className="text-3xl font-black text-white">{activeTournaments.length}</p>
              </div>
            </div>
          ) : null}
        </div>

        {error && (
          <div className="mb-6">
            <ErrorBanner message={error} onDismiss={() => setError('')} />
          </div>
        )}

        {!loading && activeTournaments.length > 0 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setFilterStatus('')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${!filterStatus ? 'bg-amber-500 text-black border-amber-500' : 'border-[#333] text-gray-400 hover:border-[#555] hover:text-gray-300'}`}
            >
              All
            </button>
            {activeStatuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${filterStatus === s ? 'bg-amber-500 text-black border-amber-500' : 'border-[#333] text-gray-400 hover:border-[#555] hover:text-gray-300'}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-center">Loading tournaments…</p>
        ) : filteredActive.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-white mb-2">
              {filterStatus ? `No ${filterStatus.toLowerCase()} tournaments` : 'No upcoming tournaments'}
            </p>
            <p className="text-sm">New tournament listings will appear here as registration opens.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredActive.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}

        {/* Past tournaments | collapsed by default */}
        {!loading && pastTournaments.length > 0 && (
          <div className="mt-16">
            <button
              onClick={() => setShowPast((v) => !v)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm font-semibold transition-colors mx-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 transition-transform ${showPast ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              {showPast ? 'Hide' : 'Show'} Past Tournaments ({pastTournaments.length})
            </button>

            {showPast && (
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 opacity-60">
                {pastTournaments
                  .sort((a, b) => b.startDate.localeCompare(a.startDate))
                  .map((t) => (
                    <TournamentCard key={t.id} tournament={t} />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
      <CTASection
        eyebrow="Stay Sharp"
        title="Train With the Best, Compete With Confidence"
        subtitle="Kante Elite Training prepares players for competitive environments. Join a program and step onto the pitch ready."
        primaryLabel="Book a Session"
        primaryHref="/book"
        secondaryLabel="View Programs"
        secondaryHref="/training"
        urgencyLine="Now Enrolling"
        proofPoints={[
          'Competitive environment prep',
          'Private and small group options',
          'Direct online booking',
        ]}
      />
    </div>
  )
}

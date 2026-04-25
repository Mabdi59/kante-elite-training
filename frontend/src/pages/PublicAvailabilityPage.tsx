import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAvailability, getPrograms } from '../services/api'
import type { AvailabilityData, Program } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWeekDates(offset: number): string[] {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function formatMonthYear(dateStr: string) {
  // Parse as UTC date to avoid timezone-driven day shifts
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function formatDayNum(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDate()
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().split('T')[0]
}

function isFutureOrToday(dateStr: string) {
  return dateStr >= new Date().toISOString().split('T')[0]
}

export default function PublicAvailabilityPage() {
  const navigate = useNavigate()
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekDates, setWeekDates] = useState<string[]>([])
  const [availability, setAvailability] = useState<Record<string, AvailabilityData>>({})
  const [loadingPrograms, setLoadingPrograms] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    getPrograms()
      .then((data) => {
        setPrograms(data)
        if (data.length > 0) setSelectedProgramId(data[0].id)
      })
      .catch(() => {})
      .finally(() => setLoadingPrograms(false))
  }, [])

  useEffect(() => {
    setWeekDates(getWeekDates(weekOffset))
  }, [weekOffset])

  const fetchWeek = useCallback(
    (programId: number, dates: string[]) => {
      const futureDates = dates.filter(isFutureOrToday)
      if (futureDates.length === 0) return

      setLoadingSlots(true)
      Promise.allSettled(
        futureDates.map((date) =>
          getAvailability(programId, date).then((data) => ({ date, data })),
        ),
      )
        .then((results) => {
          const newAvail: Record<string, AvailabilityData> = {}
          results.forEach((r) => {
            if (r.status === 'fulfilled') {
              newAvail[r.value.date] = r.value.data
            }
          })
          setAvailability(newAvail)
        })
        .finally(() => setLoadingSlots(false))
    },
    [],
  )

  useEffect(() => {
    if (selectedProgramId && weekDates.length > 0) {
      setAvailability({})
      fetchWeek(selectedProgramId, weekDates)
    }
  }, [selectedProgramId, weekDates, fetchWeek])

  const handleSlotClick = (date: string, time: string) => {
    if (!selectedProgramId) return
    navigate(`/book?programId=${selectedProgramId}&date=${date}&time=${encodeURIComponent(time)}`)
  }

  const selectedProgram = programs.find((p) => p.id === selectedProgramId)

  const headerMonth = weekDates.length > 0 ? formatMonthYear(weekDates[0]) : ''
  const endMonth =
    weekDates.length > 0 && formatMonthYear(weekDates[6]) !== headerMonth
      ? ` – ${formatMonthYear(weekDates[6])}`
      : ''

  if (loadingPrograms) return <LoadingSpinner label="Loading programs…" />

  return (
    <div className="min-h-screen bg-black pt-20 py-12 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-white text-4xl font-black">Session Availability</h1>
          <p className="text-gray-400">Browse open training slots and book directly.</p>
        </div>

        {/* Program selector */}
        {programs.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {programs.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProgramId(p.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  selectedProgramId === p.id
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#111] text-gray-300 hover:bg-[#1a1a1a] border border-[#333]'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* Week navigator */}
        <div className="flex items-center justify-between gap-4 bg-[#111] border border-[#222] rounded-xl p-4">
          <button
            type="button"
            disabled={weekOffset <= 0}
            onClick={() => setWeekOffset((o) => o - 1)}
            className="text-gray-400 hover:text-white disabled:opacity-30 text-lg font-bold px-3 py-1 rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            ‹
          </button>
          <div className="text-center">
            <p className="text-white font-semibold">
              {headerMonth}
              {endMonth}
            </p>
            {weekDates.length > 0 && (
              <p className="text-gray-500 text-sm">
                {(() => {
                  const [y1, m1, d1] = weekDates[0].split('-').map(Number)
                  const [y2, m2, d2] = weekDates[6].split('-').map(Number)
                  const fmt = { month: 'short' as const, day: 'numeric' as const, timeZone: 'UTC' }
                  return (
                    new Date(Date.UTC(y1, m1 - 1, d1)).toLocaleDateString('en-US', fmt) +
                    ' – ' +
                    new Date(Date.UTC(y2, m2 - 1, d2)).toLocaleDateString('en-US', fmt)
                  )
                })()}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={weekOffset >= 11}
            onClick={() => setWeekOffset((o) => o + 1)}
            className="text-gray-400 hover:text-white disabled:opacity-30 text-lg font-bold px-3 py-1 rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            ›
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-400 justify-center">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-600 inline-block" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-800/60 inline-block" /> Fully booked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-700 inline-block" /> Past / no data
          </span>
        </div>

        {/* Grid */}
        {loadingSlots ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner label="Loading availability…" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, i) => {
              const past = !isFutureOrToday(date) && !isToday(date)
              const avail = availability[date]
              const openSlots = avail?.availableSlots ?? []
              const bookedSlots = avail?.bookedSlots ?? []

              return (
                <div
                  key={date}
                  className={`rounded-xl border p-2 min-h-[8rem] ${
                    isToday(date)
                      ? 'border-amber-500/50 bg-amber-500/5'
                      : past
                        ? 'border-gray-800/40 bg-[#111]/30 opacity-40'
                        : 'border-[#222] bg-[#111]'
                  }`}
                >
                  <div className="text-center mb-2">
                    <p className="text-gray-500 text-xs uppercase tracking-wider">{DAYS[i]}</p>
                    <p
                      className={`text-sm font-bold ${
                        isToday(date) ? 'text-amber-400' : past ? 'text-gray-600' : 'text-white'
                      }`}
                    >
                      {formatDayNum(date)}
                    </p>
                  </div>

                  {!past && (                    <div className="space-y-1">
                      {openSlots.length === 0 && bookedSlots.length === 0 ? (
                        <p className="text-gray-600 text-xs text-center">No slots</p>
                      ) : null}
                      {openSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleSlotClick(date, slot)}
                          className="w-full text-xs rounded px-1 py-1 bg-green-700/40 hover:bg-green-600/60 text-green-300 border border-green-700/50 transition-colors leading-tight"
                          title={`Book ${slot} on ${date}`}
                        >
                          {slot}
                        </button>
                      ))}
                      {bookedSlots.map((slot) => (
                        <div
                          key={slot}
                          className="w-full text-xs rounded px-1 py-1 bg-red-900/30 text-red-400/60 border border-red-900/30 leading-tight text-center cursor-default"
                        >
                          {slot}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* CTA */}
        {selectedProgram && (
          <div className="text-center pt-4 space-y-2">
            <p className="text-gray-400 text-sm">
              Viewing slots for <span className="text-white font-semibold">{selectedProgram.name}</span>.
              Click any green slot to book instantly.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

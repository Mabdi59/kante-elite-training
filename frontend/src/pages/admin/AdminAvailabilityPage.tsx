import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  checkAvailabilityConflicts,
  createAvailabilityRule,
  createBlockedTime,
  deleteAvailabilityRule,
  deleteBlockedTime,
  getAdminUsers,
  getAvailabilityRules,
  getBlockedTimes,
  updateAvailabilityRule,
  updateBlockedTime,
} from '../../services/api'
import type { AdminUser, AvailabilityRule, BlockedTime } from '../../types'
import ErrorBanner from '../../components/ErrorBanner'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AdminAvailabilityPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [rules, setRules] = useState<AvailabilityRule[]>([])
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [ruleId, setRuleId] = useState<number | null>(null)
  const [coachId, setCoachId] = useState<number>(0)
  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('18:00')
  const [timezone, setTimezone] = useState('America/New_York')
  const [active, setActive] = useState(true)

  const [blockedId, setBlockedId] = useState<number | null>(null)
  const [blockedCoachId, setBlockedCoachId] = useState<number>(0)
  const [blockedStart, setBlockedStart] = useState('')
  const [blockedEnd, setBlockedEnd] = useState('')
  const [blockedReason, setBlockedReason] = useState('')

  const [conflict, setConflict] = useState<string[]>([])

  const coaches = useMemo(
    () => users.filter((user) => user.role === 'COACH' || user.role === 'ADMIN'),
    [users],
  )

  useEffect(() => {
    document.title = 'Availability | Kante Elite Training'
    return () => {
      document.title = 'Kante Elite Training'
    }
  }, [])

  useEffect(() => {
    Promise.all([getAdminUsers(), getAvailabilityRules(), getBlockedTimes()])
      .then(([usersData, rulesData, blockedData]) => {
        setUsers(usersData)
        setRules(rulesData)
        setBlockedTimes(blockedData)
        const defaultCoachId =
          usersData.find((user) => user.role === 'COACH')?.id ??
          usersData.find((user) => user.role === 'ADMIN')?.id ??
          0
        setCoachId(defaultCoachId)
        setBlockedCoachId(defaultCoachId)
      })
      .catch(() => setError('Failed to load availability data.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!blockedCoachId || !blockedStart || !blockedEnd) {
      setConflict([])
      return
    }
    checkAvailabilityConflicts(blockedCoachId, blockedStart, blockedEnd)
      .then((report) => setConflict(report.hasConflict ? report.reasons : []))
      .catch(() => setConflict([]))
  }, [blockedCoachId, blockedStart, blockedEnd])

  const resetRuleForm = () => {
    setRuleId(null)
    setDayOfWeek(1)
    setStartTime('08:00')
    setEndTime('18:00')
    setTimezone('America/New_York')
    setActive(true)
  }

  const resetBlockedForm = () => {
    setBlockedId(null)
    setBlockedStart('')
    setBlockedEnd('')
    setBlockedReason('')
  }

  const submitRule = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      const payload = { coachId, dayOfWeek, startTime, endTime, timezone, active }
      if (ruleId) {
        const updated = await updateAvailabilityRule(ruleId, payload)
        setRules((prev) => prev.map((rule) => (rule.id === ruleId ? updated : rule)))
      } else {
        const created = await createAvailabilityRule(payload)
        setRules((prev) => [...prev, created])
      }
      resetRuleForm()
    } catch {
      setError('Failed to save availability rule.')
    }
  }

  const submitBlocked = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      const payload = {
        coachId: blockedCoachId,
        startDatetime: blockedStart,
        endDatetime: blockedEnd,
        reason: blockedReason || undefined,
      }
      if (blockedId) {
        const updated = await updateBlockedTime(blockedId, payload)
        setBlockedTimes((prev) => prev.map((item) => (item.id === blockedId ? updated : item)))
      } else {
        const created = await createBlockedTime(payload)
        setBlockedTimes((prev) => [created, ...prev])
      }
      resetBlockedForm()
    } catch {
      setError('Failed to save blocked time.')
    }
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Loading availability...</p>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-white text-3xl font-black">Availability & Scheduling Boundaries</h1>
        <p className="text-gray-400 text-sm mt-2">
          Coach availability validates generated program and event sessions.
        </p>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-white text-xl font-bold">Coach Working Hours</h2>
        <form onSubmit={submitRule} className="grid grid-cols-1 md:grid-cols-7 gap-3">
          <select
            value={coachId}
            onChange={(e) => setCoachId(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {coaches.map((coach) => (
              <option key={coach.id} value={coach.id}>
                {coach.name}
              </option>
            ))}
          </select>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {DAYS.map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </select>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="Timezone"
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-gray-300 px-1">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 accent-green-500" />
            Active
          </label>
          <button type="submit" className="bg-green-600 hover:bg-green-500 text-white rounded-lg px-4 py-2 text-sm font-semibold">
            {ruleId ? 'Save Rule' : 'Add Rule'}
          </button>
        </form>
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 text-sm">
              <span className="text-gray-300">
                {(rule.coachName ?? 'Coach')} · {DAYS[rule.dayOfWeek]} · {rule.startTime} - {rule.endTime}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRuleId(rule.id)
                    setCoachId(rule.coachId ?? coachId)
                    setDayOfWeek(rule.dayOfWeek)
                    setStartTime(rule.startTime.slice(0, 5))
                    setEndTime(rule.endTime.slice(0, 5))
                    setTimezone(rule.timezone ?? 'America/New_York')
                    setActive(rule.active)
                  }}
                  className="text-amber-400"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    await deleteAvailabilityRule(rule.id)
                    setRules((prev) => prev.filter((item) => item.id !== rule.id))
                  }}
                  className="text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-white text-xl font-bold">Blocked Times</h2>
        <form onSubmit={submitBlocked} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            value={blockedCoachId}
            onChange={(e) => setBlockedCoachId(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {coaches.map((coach) => (
              <option key={coach.id} value={coach.id}>
                {coach.name}
              </option>
            ))}
          </select>
          <input type="datetime-local" value={blockedStart} onChange={(e) => setBlockedStart(e.target.value)} required className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="datetime-local" value={blockedEnd} onChange={(e) => setBlockedEnd(e.target.value)} required className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input value={blockedReason} onChange={(e) => setBlockedReason(e.target.value)} placeholder="Reason" className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button type="submit" className="bg-red-700 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold">
            {blockedId ? 'Save Block' : 'Add Block'}
          </button>
        </form>

        {conflict.length > 0 ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-300 text-sm">
            Potential scheduling conflict: {conflict.join(' ')}
          </div>
        ) : null}

        <div className="space-y-2">
          {blockedTimes.map((blocked) => (
            <div key={blocked.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 text-sm">
              <span className="text-gray-300">
                {(blocked.coachName ?? 'Coach')} · {new Date(blocked.startDatetime).toLocaleString()} -{' '}
                {new Date(blocked.endDatetime).toLocaleString()}
                {blocked.reason ? ` · ${blocked.reason}` : ''}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setBlockedId(blocked.id)
                    setBlockedCoachId(blocked.coachId)
                    setBlockedStart(blocked.startDatetime.slice(0, 16))
                    setBlockedEnd(blocked.endDatetime.slice(0, 16))
                    setBlockedReason(blocked.reason ?? '')
                  }}
                  className="text-amber-400"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    await deleteBlockedTime(blocked.id)
                    setBlockedTimes((prev) => prev.filter((item) => item.id !== blocked.id))
                  }}
                  className="text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

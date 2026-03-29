import { useEffect, useState, type FormEvent } from 'react'
import {
  getAvailabilityRules,
  createAvailabilityRule,
  deleteAvailabilityRule,
  getBlockedSlots,
  createBlockedSlot,
  deleteBlockedSlot,
} from '../../services/api'
import type { AvailabilityRule, BlockedSlot } from '../../types'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AdminAvailabilityPage() {
  const [rules, setRules] = useState<AvailabilityRule[]>([])
  const [blocked, setBlocked] = useState<BlockedSlot[]>([])
  const [loadingRules, setLoadingRules] = useState(true)
  const [loadingBlocked, setLoadingBlocked] = useState(true)

  // New rule form
  const [ruleDay, setRuleDay] = useState('1')
  const [ruleStart, setRuleStart] = useState('08:00')
  const [ruleEnd, setRuleEnd] = useState('18:00')
  const [savingRule, setSavingRule] = useState(false)

  // New blocked slot form
  const [blockDate, setBlockDate] = useState('')
  const [blockTime, setBlockTime] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [savingBlock, setSavingBlock] = useState(false)

  useEffect(() => {
    getAvailabilityRules()
      .then(setRules)
      .finally(() => setLoadingRules(false))
    getBlockedSlots()
      .then(setBlocked)
      .finally(() => setLoadingBlocked(false))
  }, [])

  const handleAddRule = async (e: FormEvent) => {
    e.preventDefault()
    setSavingRule(true)
    try {
      const created = await createAvailabilityRule({
        dayOfWeek: Number(ruleDay),
        startTime: ruleStart,
        endTime: ruleEnd,
        active: true,
      })
      setRules((prev) => [...prev, created])
    } catch {
      alert('Failed to create rule.')
    } finally {
      setSavingRule(false)
    }
  }

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Delete this rule?')) return
    try {
      await deleteAvailabilityRule(id)
      setRules((prev) => prev.filter((r) => r.id !== id))
    } catch {
      alert('Failed to delete rule.')
    }
  }

  const handleAddBlock = async (e: FormEvent) => {
    e.preventDefault()
    setSavingBlock(true)
    try {
      const created = await createBlockedSlot({
        slotDate: blockDate,
        slotTime: blockTime || undefined,
        reason: blockReason || undefined,
      })
      setBlocked((prev) => [created, ...prev])
      setBlockDate('')
      setBlockTime('')
      setBlockReason('')
    } catch {
      alert('Failed to block slot.')
    } finally {
      setSavingBlock(false)
    }
  }

  const handleDeleteBlock = async (id: number) => {
    try {
      await deleteBlockedSlot(id)
      setBlocked((prev) => prev.filter((b) => b.id !== id))
    } catch {
      alert('Failed to remove blocked slot.')
    }
  }

  return (
    <div className="space-y-10">
      <h1 className="text-white text-3xl font-black">Availability Management</h1>

      {/* Availability Rules */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white text-xl font-bold mb-4">📋 Weekly Availability Rules</h2>
        <p className="text-gray-500 text-sm mb-6">
          Define which hours are available on each day of the week. If no rules exist, defaults to
          8:00 AM – 6:00 PM daily.
        </p>

        <form onSubmit={handleAddRule} className="flex flex-wrap gap-3 mb-6">
          <select
            value={ruleDay}
            onChange={(e) => setRuleDay(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {DAYS.map((d, i) => (
              <option key={i} value={i}>{d}</option>
            ))}
          </select>
          <input
            type="time"
            value={ruleStart}
            onChange={(e) => setRuleStart(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <span className="text-gray-500 self-center">to</span>
          <input
            type="time"
            value={ruleEnd}
            onChange={(e) => setRuleEnd(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={savingRule}
            className="bg-green-600 hover:bg-green-500 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {savingRule ? 'Adding…' : '+ Add Rule'}
          </button>
        </form>

        {loadingRules ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : rules.length === 0 ? (
          <p className="text-gray-500 text-sm">No custom rules. Default hours apply (8 AM – 6 PM).</p>
        ) : (
          <div className="space-y-2">
            {rules.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <span className="text-white font-medium w-24">{DAYS[r.dayOfWeek]}</span>
                  <span className="text-gray-400 text-sm">
                    {r.startTime} – {r.endTime}
                  </span>
                  {!r.active && (
                    <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteRule(r.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Blocked Slots */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white text-xl font-bold mb-4">🚫 Blocked Dates & Times</h2>
        <p className="text-gray-500 text-sm mb-6">
          Block specific dates or time slots. Leave time empty to block the entire day.
        </p>

        <form onSubmit={handleAddBlock} className="flex flex-wrap gap-3 mb-6">
          <input
            type="date"
            value={blockDate}
            onChange={(e) => setBlockDate(e.target.value)}
            required
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={blockTime}
            onChange={(e) => setBlockTime(e.target.value)}
            placeholder="Time (optional, e.g. 10:00 AM)"
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm w-56"
          />
          <input
            type="text"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="Reason (optional)"
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-40"
          />
          <button
            type="submit"
            disabled={savingBlock}
            className="bg-red-700 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {savingBlock ? 'Blocking…' : '🚫 Block'}
          </button>
        </form>

        {loadingBlocked ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : blocked.length === 0 ? (
          <p className="text-gray-500 text-sm">No blocked slots.</p>
        ) : (
          <div className="space-y-2">
            {blocked.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-white font-medium">{b.slotDate}</span>
                  {b.slotTime ? (
                    <span className="text-gray-400 text-sm">@ {b.slotTime}</span>
                  ) : (
                    <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                      Full day
                    </span>
                  )}
                  {b.reason && <span className="text-gray-500 text-sm italic">{b.reason}</span>}
                </div>
                <button
                  onClick={() => handleDeleteBlock(b.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

import { useEffect, useState, type FormEvent } from 'react'
import {
  createStaffAvailabilityRule,
  createStaffBlockedSlot,
  deleteStaffAvailabilityRule,
  deleteStaffBlockedSlot,
  getStaffAvailabilityRules,
  getStaffBlockedSlots,
  updateStaffAvailabilityRule,
  updateStaffBlockedSlot,
} from '../../services/api'
import type { AvailabilityRule, BlockedSlot } from '../../types'
import ErrorBanner from '../../components/ErrorBanner'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function normalizeTimeInput(value: string) {
  return value.length >= 5 ? value.slice(0, 5) : value
}

export default function StaffAvailabilityPage() {
  const [rules, setRules] = useState<AvailabilityRule[]>([])
  const [blocked, setBlocked] = useState<BlockedSlot[]>([])
  const [loadingRules, setLoadingRules] = useState(true)
  const [loadingBlocked, setLoadingBlocked] = useState(true)
  const [error, setError] = useState('')

  const [editingRuleId, setEditingRuleId] = useState<number | null>(null)
  const [ruleDay, setRuleDay] = useState('1')
  const [ruleStart, setRuleStart] = useState('08:00')
  const [ruleEnd, setRuleEnd] = useState('18:00')
  const [ruleActive, setRuleActive] = useState(true)
  const [savingRule, setSavingRule] = useState(false)

  const [editingBlockedId, setEditingBlockedId] = useState<number | null>(null)
  const [blockDate, setBlockDate] = useState('')
  const [blockTime, setBlockTime] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [savingBlock, setSavingBlock] = useState(false)

  useEffect(() => {
    getStaffAvailabilityRules()
      .then(setRules)
      .catch(() => setError('Could not load availability rules.'))
      .finally(() => setLoadingRules(false))

    getStaffBlockedSlots()
      .then(setBlocked)
      .catch(() => setError('Could not load blocked slots.'))
      .finally(() => setLoadingBlocked(false))
  }, [])

  const resetRuleForm = () => {
    setEditingRuleId(null)
    setRuleDay('1')
    setRuleStart('08:00')
    setRuleEnd('18:00')
    setRuleActive(true)
  }

  const resetBlockedForm = () => {
    setEditingBlockedId(null)
    setBlockDate('')
    setBlockTime('')
    setBlockReason('')
  }

  const handleRuleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSavingRule(true)
    setError('')

    try {
      const payload = {
        dayOfWeek: Number(ruleDay),
        startTime: ruleStart,
        endTime: ruleEnd,
        active: ruleActive,
      }

      if (editingRuleId) {
        const updated = await updateStaffAvailabilityRule(editingRuleId, payload)
        setRules((current) => current.map((item) => (item.id === editingRuleId ? updated : item)))
      } else {
        const created = await createStaffAvailabilityRule(payload)
        setRules((current) => [...current, created])
      }
      resetRuleForm()
    } catch {
      setError('Could not save the availability rule.')
    } finally {
      setSavingRule(false)
    }
  }

  const handleBlockedSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSavingBlock(true)
    setError('')

    try {
      const payload = {
        slotDate: blockDate,
        slotTime: blockTime || undefined,
        reason: blockReason || undefined,
      }

      if (editingBlockedId) {
        const updated = await updateStaffBlockedSlot(editingBlockedId, payload)
        setBlocked((current) => current.map((item) => (item.id === editingBlockedId ? updated : item)))
      } else {
        const created = await createStaffBlockedSlot(payload)
        setBlocked((current) => [created, ...current])
      }
      resetBlockedForm()
    } catch {
      setError('Could not save the blocked slot.')
    } finally {
      setSavingBlock(false)
    }
  }

  const openRuleEdit = (rule: AvailabilityRule) => {
    setEditingRuleId(rule.id)
    setRuleDay(String(rule.dayOfWeek))
    setRuleStart(normalizeTimeInput(rule.startTime))
    setRuleEnd(normalizeTimeInput(rule.endTime))
    setRuleActive(rule.active)
  }

  const openBlockedEdit = (slot: BlockedSlot) => {
    setEditingBlockedId(slot.id)
    setBlockDate(slot.slotDate)
    setBlockTime(slot.slotTime ?? '')
    setBlockReason(slot.reason ?? '')
  }

  const handleDeleteRule = async (id: number) => {
    if (!window.confirm('Delete this rule?')) return

    try {
      await deleteStaffAvailabilityRule(id)
      setRules((current) => current.filter((item) => item.id !== id))
      if (editingRuleId === id) {
        resetRuleForm()
      }
    } catch {
      setError('Could not delete the rule.')
    }
  }

  const handleDeleteBlock = async (id: number) => {
    if (!window.confirm('Delete this blocked slot?')) return

    try {
      await deleteStaffBlockedSlot(id)
      setBlocked((current) => current.filter((item) => item.id !== id))
      if (editingBlockedId === id) {
        resetBlockedForm()
      }
    } catch {
      setError('Could not delete the blocked slot.')
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-white text-3xl font-black">Availability</h1>
        <p className="text-gray-400 text-sm mt-2">
          Manage weekly availability rules and blocked dates from one place.
        </p>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError('')} /> : null}

      <section className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-white text-xl font-bold">Weekly Availability Rules</h2>
            <p className="text-gray-500 text-sm mt-1">Create, edit, or remove weekly time windows.</p>
          </div>
          {editingRuleId ? (
            <button
              onClick={resetRuleForm}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>

        <form onSubmit={handleRuleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
          <select
            value={ruleDay}
            onChange={(event) => setRuleDay(event.target.value)}
            className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {DAYS.map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={ruleStart}
            onChange={(event) => setRuleStart(event.target.value)}
            className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="time"
            value={ruleEnd}
            onChange={(event) => setRuleEnd(event.target.value)}
            className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-gray-300 px-1">
            <input
              type="checkbox"
              checked={ruleActive}
              onChange={(event) => setRuleActive(event.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            Active
          </label>
          <button
            type="submit"
            disabled={savingRule}
            className="bg-amber-500 hover:bg-amber-400 text-black rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {savingRule ? 'Saving...' : editingRuleId ? 'Save Rule' : 'Add Rule'}
          </button>
        </form>

        {loadingRules ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : rules.length === 0 ? (
          <p className="text-gray-500 text-sm">No custom rules yet.</p>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between bg-[#1a1a1a] rounded-lg px-4 py-3 gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-white font-medium w-24">{DAYS[rule.dayOfWeek]}</span>
                  <span className="text-gray-400 text-sm">
                    {normalizeTimeInput(rule.startTime)} to {normalizeTimeInput(rule.endTime)}
                  </span>
                  {!rule.active ? (
                    <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  ) : null}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openRuleEdit(rule)} className="text-amber-500 hover:text-amber-400 text-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteRule(rule.id)} className="text-red-400 hover:text-red-300 text-sm">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-white text-xl font-bold">Blocked Dates and Times</h2>
            <p className="text-gray-500 text-sm mt-1">Create, edit, or remove one off blocks.</p>
          </div>
          {editingBlockedId ? (
            <button
              onClick={resetBlockedForm}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>

        <form onSubmit={handleBlockedSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <input
            type="date"
            value={blockDate}
            onChange={(event) => setBlockDate(event.target.value)}
            required
            className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={blockTime}
            onChange={(event) => setBlockTime(event.target.value)}
            placeholder="Time, optional"
            className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={blockReason}
            onChange={(event) => setBlockReason(event.target.value)}
            placeholder="Reason, optional"
            className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={savingBlock}
            className="bg-red-700 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {savingBlock ? 'Saving...' : editingBlockedId ? 'Save Block' : 'Add Block'}
          </button>
        </form>

        {loadingBlocked ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : blocked.length === 0 ? (
          <p className="text-gray-500 text-sm">No blocked slots.</p>
        ) : (
          <div className="space-y-2">
            {blocked.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between bg-[#1a1a1a] rounded-lg px-4 py-3 gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-white font-medium">{slot.slotDate}</span>
                  {slot.slotTime ? (
                    <span className="text-gray-400 text-sm">{slot.slotTime}</span>
                  ) : (
                    <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                      Full day
                    </span>
                  )}
                  {slot.reason ? <span className="text-gray-500 text-sm italic">{slot.reason}</span> : null}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openBlockedEdit(slot)} className="text-amber-500 hover:text-amber-400 text-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteBlock(slot.id)} className="text-red-400 hover:text-red-300 text-sm">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

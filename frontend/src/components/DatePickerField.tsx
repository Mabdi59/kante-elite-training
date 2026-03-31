import { useEffect, useRef, useState } from 'react'

function formatIsoDateForDisplay(value: string) {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return ''
  return `${month}/${day}/${year}`
}

function formatDateDigitsInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function parseDisplayDateToIso(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed)
  if (!match) return null

  const month = Number(match[1])
  const day = Number(match[2])
  const year = Number(match[3])

  if (!Number.isInteger(month) || !Number.isInteger(day) || !Number.isInteger(year)) return null
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null

  const parsed = new Date(Date.UTC(year, month - 1, day))
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null
  }

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  )
}

type DatePickerFieldProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function DatePickerField({
  value,
  onChange,
  className = 'w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 pr-11 text-white text-sm placeholder:text-gray-500',
}: DatePickerFieldProps) {
  const pickerRef = useRef<HTMLInputElement | null>(null)
  const [displayValue, setDisplayValue] = useState(() => formatIsoDateForDisplay(value))

  useEffect(() => {
    setDisplayValue(formatIsoDateForDisplay(value))
  }, [value])

  const openPicker = () => {
    const picker = pickerRef.current as (HTMLInputElement & { showPicker?: () => void }) | null
    if (!picker) return
    if (typeof picker.showPicker === 'function') {
      picker.showPicker()
      return
    }
    picker.focus()
    picker.click()
  }

  const handleTextChange = (nextValue: string) => {
    const formatted = formatDateDigitsInput(nextValue)
    setDisplayValue(formatted)

    const parsed = parseDisplayDateToIso(formatted)
    if (parsed) {
      onChange(parsed)
    } else if (!formatted) {
      onChange('')
    }
  }

  const handleBlur = () => {
    const parsed = parseDisplayDateToIso(displayValue)
    if (parsed === null) {
      setDisplayValue(formatIsoDateForDisplay(value))
      return
    }
    onChange(parsed)
    setDisplayValue(formatIsoDateForDisplay(parsed))
  }

  return (
    <div className="relative">
      <input
        className={className}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="mm/dd/yyyy"
        value={displayValue}
        onChange={(e) => handleTextChange(e.target.value)}
        onBlur={handleBlur}
        onClick={openPicker}
      />
      <button
        type="button"
        onClick={openPicker}
        className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-400 hover:text-cyan-300"
        aria-label="Open date picker"
      >
        <CalendarIcon />
      </button>
      <input
        ref={pickerRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setDisplayValue(formatIsoDateForDisplay(e.target.value))
        }}
      />
    </div>
  )
}

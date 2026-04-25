import React from 'react'

interface FormatOption {
  value: string
  label: string
  sublabel: string
  icon: React.ReactNode
}

interface FormatSelectorProps {
  value: string
  onChange: (value: string) => void
}

function GroupOnlyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="10" width="40" height="6" rx="2" fill="currentColor" opacity="0.25" />
      <rect x="4" y="20" width="40" height="6" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="4" y="30" width="40" height="6" rx="2" fill="currentColor" opacity="0.75" />
      <line x1="4" y1="10" x2="4" y2="36" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <line x1="20" y1="10" x2="20" y2="36" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <line x1="36" y1="10" x2="36" y2="36" stroke="currentColor" strokeWidth="2" opacity="0.3" />
    </svg>
  )
}

function GroupKnockoutIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Group side */}
      <rect x="2" y="10" width="16" height="4" rx="1.5" fill="currentColor" opacity="0.35" />
      <rect x="2" y="18" width="16" height="4" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="2" y="26" width="16" height="4" rx="1.5" fill="currentColor" opacity="0.75" />
      {/* Arrow / connector */}
      <line x1="18" y1="12" x2="26" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="18" y1="28" x2="26" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {/* Knockout bracket */}
      <rect x="26" y="16" width="10" height="4" rx="1.5" fill="currentColor" opacity="0.6" />
      <rect x="26" y="24" width="10" height="4" rx="1.5" fill="currentColor" opacity="0.6" />
      <line x1="36" y1="18" x2="40" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="36" y1="26" x2="40" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <rect x="40" y="20" width="6" height="4" rx="1.5" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

function KnockoutOnlyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Round 1 */}
      <rect x="2" y="8" width="10" height="4" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="2" y="16" width="10" height="4" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="2" y="26" width="10" height="4" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="2" y="34" width="10" height="4" rx="1.5" fill="currentColor" opacity="0.5" />
      {/* Connectors R1 -> R2 */}
      <line x1="12" y1="10" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="12" y1="18" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="12" y1="28" x2="18" y2="36" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="12" y1="36" x2="18" y2="36" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      {/* Round 2 */}
      <rect x="18" y="15" width="10" height="4" rx="1.5" fill="currentColor" opacity="0.65" />
      <rect x="18" y="33" width="10" height="4" rx="1.5" fill="currentColor" opacity="0.65" />
      {/* Connectors R2 -> Final */}
      <line x1="28" y1="17" x2="34" y2="25" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="28" y1="35" x2="34" y2="25" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {/* Final */}
      <rect x="34" y="22" width="12" height="6" rx="1.5" fill="currentColor" opacity="0.95" />
    </svg>
  )
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: 'ROUND_ROBIN',
    label: 'Group phase only',
    sublabel: 'Every team plays each other in groups',
    icon: <GroupOnlyIcon />,
  },
  {
    value: 'GROUP_STAGE',
    label: 'Group phase and knockout phase',
    sublabel: 'Groups followed by a knockout bracket',
    icon: <GroupKnockoutIcon />,
  },
  {
    value: 'KNOCKOUT',
    label: 'Knockout phase only',
    sublabel: 'Single elimination bracket',
    icon: <KnockoutOnlyIcon />,
  },
]

export default function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <div className="col-span-full">
      <p className="text-center text-gray-300 text-sm font-semibold uppercase tracking-widest mb-5">
        Choose a tournament format
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FORMAT_OPTIONS.map((option) => {
          const selected = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={[
                'flex flex-col items-center gap-3 rounded-xl border-2 px-5 py-6 text-center transition-all duration-150 cursor-pointer',
                selected
                  ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_16px_rgba(245,158,11,0.2)] text-amber-300'
                  : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500 hover:bg-gray-800 hover:-translate-y-0.5',
              ].join(' ')}
              aria-pressed={selected}
            >
              <span className={selected ? 'text-amber-500' : 'text-gray-500'}>
                {option.icon}
              </span>
              <span className={`font-bold text-sm leading-snug ${selected ? 'text-white' : 'text-gray-300'}`}>
                {option.label}
              </span>
              <span className="text-xs text-gray-500 leading-snug">{option.sublabel}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

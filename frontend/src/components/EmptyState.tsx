import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: Props) {
  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  )

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0f0f0f] px-5 py-12 text-center sm:px-8">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10">
        {icon ?? defaultIcon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white sm:text-xl">{title}</h3>
      {description ? <p className="mb-6 max-w-md text-sm leading-relaxed text-gray-400">{description}</p> : null}
      {action ? <div className="w-full sm:w-auto">{action}</div> : null}
    </div>
  )
}

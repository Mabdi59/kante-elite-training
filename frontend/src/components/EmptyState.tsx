interface Props {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon = '📭', title, description, action }: Props) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0f0f0f] px-5 py-12 text-center sm:px-8">
      <div className="mb-4 inline-flex min-h-11 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 px-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white sm:text-xl">{title}</h3>
      {description ? <p className="mb-6 max-w-md text-sm leading-relaxed text-gray-400">{description}</p> : null}
      {action ? <div className="w-full sm:w-auto">{action}</div> : null}
    </div>
  )
}

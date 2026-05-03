import type { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
  shellClassName?: string
  tone?: 'black' | 'raised'
  divider?: boolean
}

interface SectionHeaderProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'center' | 'left'
  className?: string
}

export function Section({
  children,
  className = '',
  shellClassName = '',
  tone = 'black',
  divider = true,
}: SectionProps) {
  const toneClass = tone === 'raised' ? 'bg-[#0a0a0a]' : 'bg-black'

  return (
    <section className={`${divider ? 'border-t border-[#1a1a1a]' : ''} ${toneClass} px-4 py-16 sm:py-20 ${className}`}>
      <div className={`page-shell ${shellClassName}`}>
        {children}
      </div>
    </section>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
}: SectionHeaderProps) {
  const centered = align === 'center'

  return (
    <div className={`${centered ? 'mx-auto text-center' : ''} mb-10 max-w-3xl ${className}`}>
      {eyebrow && <span className="section-label">{eyebrow}</span>}
      <h2 className="text-balance text-3xl font-black text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className={`${centered ? 'mx-auto' : ''} mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base`}>
          {description}
        </p>
      )}
    </div>
  )
}

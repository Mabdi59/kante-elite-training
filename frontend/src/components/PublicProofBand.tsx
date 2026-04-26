import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface PublicProofItem {
  label: string
  icon: ReactNode
  href?: string
}

interface PublicProofBandProps {
  items: PublicProofItem[]
}

function isExternalHref(href: string) {
  return href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')
}

export default function PublicProofBand({ items }: PublicProofBandProps) {
  return (
    <section className="border-t border-[#1a1a1a] bg-[#0a0a0a] px-4 py-5">
      <div className="page-shell">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-medium text-gray-500">
          {items.map((item, index) => {
            const content = (
              <span className="flex items-center gap-2">
                <span className="text-amber-500">{item.icon}</span>
                <span>{item.label}</span>
              </span>
            )

            return (
              <Fragment key={item.label}>
                {item.href ? (
                  isExternalHref(item.href) ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="transition-colors hover:text-amber-400"
                    >
                      {content}
                    </a>
                  ) : (
                    <Link to={item.href} className="transition-colors hover:text-amber-400">
                      {content}
                    </Link>
                  )
                ) : (
                  content
                )}
                {index < items.length - 1 ? (
                  <span className="hidden text-[#2a2a2a] sm:block" aria-hidden>
                    |
                  </span>
                ) : null}
              </Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://kanteelitetraining.com'

function upsertHeadTag<T extends HTMLElement>(
  selector: string,
  createTag: () => T,
  apply: (element: T) => void,
) {
  const existing = document.head.querySelector<T>(selector) ?? createTag()
  if (!existing.parentElement) document.head.appendChild(existing)
  apply(existing)
}

export default function CanonicalMeta() {
  const location = useLocation()

  useEffect(() => {
    const canonicalPath = location.pathname === '/' ? '/' : location.pathname
    const canonicalUrl = new URL(canonicalPath, SITE_URL).toString()

    upsertHeadTag<HTMLLinkElement>(
      'link[rel="canonical"]',
      () => {
        const link = document.createElement('link')
        link.rel = 'canonical'
        return link
      },
      (link) => {
        link.href = canonicalUrl
      },
    )

    upsertHeadTag<HTMLMetaElement>(
      'meta[property="og:url"]',
      () => {
        const meta = document.createElement('meta')
        meta.setAttribute('property', 'og:url')
        return meta
      },
      (meta) => {
        meta.setAttribute('content', canonicalUrl)
      },
    )
  }, [location.pathname])

  return null
}

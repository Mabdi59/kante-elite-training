import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { BRAND_APPLE_TOUCH_ICON_SRC, BRAND_LOGO_ALT } from '../constants/brand'

const SITE_URL = 'https://kanteelitetraining.com'
const DEFAULT_IMAGE = `${SITE_URL}${BRAND_APPLE_TOUCH_ICON_SRC}`
const DEFAULT_TITLE = 'Kante Elite Training | Youth Soccer Academy, Columbus Ohio'
const DEFAULT_DESCRIPTION =
  'Kante Elite Training offers Columbus youth soccer training, events, tournament registration, and direct online booking.'

interface MetaConfig {
  title: string
  description: string
  robots?: string
  ogType?: 'website' | 'article'
  image?: string
}

function upsertHeadTag<T extends HTMLElement>(
  selector: string,
  createTag: () => T,
  apply: (element: T) => void,
) {
  const existing = document.head.querySelector<T>(selector) ?? createTag()
  if (!existing.parentElement) document.head.appendChild(existing)
  apply(existing)
}

function getMetaConfig(pathname: string): MetaConfig {
  if (pathname === '/') {
    return {
      title: DEFAULT_TITLE,
      description:
        'Book Columbus soccer training, explore events, and register for tournaments with Kante Elite Training.',
    }
  }

  if (pathname === '/training') {
    return {
      title: 'Training Programs | Kante Elite Training',
      description:
        'Explore the current Kante Elite training programs, including private training, small group training, and speed and agility sessions.',
    }
  }

  if (pathname === '/events') {
    return {
      title: 'Events | Kante Elite Training',
      description:
        'Browse currently published Kante Elite events, camps, and clinics and register online when spots are open.',
    }
  }

  if (/^\/events\/\d+\/register$/.test(pathname)) {
    return {
      title: 'Event Registration | Kante Elite Training',
      description:
        'Register for a Kante Elite event using the live event details published on the site.',
    }
  }

  if (pathname === '/results') {
    return {
      title: 'Player Results | Kante Elite Training',
      description:
        'Read published family feedback and player success stories from Kante Elite Training in Columbus, Ohio.',
    }
  }

  if (pathname === '/media') {
    return {
      title: 'Media | Kante Elite Training',
      description:
        'View photos and videos from Kante Elite training sessions, events, and tournaments.',
    }
  }

  if (pathname === '/about') {
    return {
      title: 'About | Kante Elite Training',
      description:
        'Learn about Coach Kante, the Kante Elite coaching philosophy, and the standards behind the training environment.',
    }
  }

  if (pathname === '/contact') {
    return {
      title: 'Contact | Kante Elite Training',
      description:
        'Contact Kante Elite Training for booking help, program questions, or tournament registration support.',
    }
  }

  if (pathname === '/book') {
    return {
      title: 'Book Training | Kante Elite Training',
      description:
        'Book a Kante Elite training session by choosing a program, date, and available time online.',
    }
  }

  if (pathname === '/book/success') {
    return {
      title: 'Booking Confirmed | Kante Elite Training',
      description: 'Review your recent Kante Elite booking confirmation details.',
    }
  }

  if (pathname === '/tournaments') {
    return {
      title: 'Tournaments | Kante Elite Training',
      description:
        'Review live tournament listings, registration deadlines, and team openings for Kante Elite tournaments.',
    }
  }

  if (/^\/tournaments\/\d+$/.test(pathname)) {
    return {
      title: 'Tournament Details | Kante Elite Training',
      description:
        'View the public tournament details, schedule information, and registration status for this Kante Elite event.',
      ogType: 'article',
    }
  }

  if (/^\/tournaments\/\d+\/register$/.test(pathname)) {
    return {
      title: 'Tournament Registration | Kante Elite Training',
      description: 'Register a team for this Kante Elite tournament online.',
    }
  }

  if (/^\/tournaments\/registration\/[^/]+$/.test(pathname)) {
    return {
      title: 'Team Portal | Kante Elite Training',
      description: 'Manage a tournament registration, roster, and payment status for your team.',
      robots: 'noindex,nofollow',
    }
  }

  if (pathname === '/faq') {
    return {
      title: 'FAQ | Kante Elite Training',
      description:
        'Find answers about Kante Elite booking, training programs, events, tournaments, and account access.',
    }
  }

  if (pathname === '/privacy') {
    return {
      title: 'Privacy Policy | Kante Elite Training',
      description:
        'Review how Kante Elite Training collects, uses, and protects information submitted through the website.',
    }
  }

  if (pathname === '/terms') {
    return {
      title: 'Terms of Service | Kante Elite Training',
      description:
        'Review the terms that govern use of Kante Elite Training services, bookings, events, and website access.',
    }
  }

  if (pathname === '/cancellation-policy') {
    return {
      title: 'Cancellation & Refund Policy | Kante Elite Training',
      description:
        'Review the Kante Elite Training cancellation, rescheduling, and refund policy for bookings and events.',
    }
  }

  if (pathname === '/cookie-policy') {
    return {
      title: 'Cookie Policy | Kante Elite Training',
      description:
        'Review how Kante Elite Training uses cookies and similar technologies on the website.',
    }
  }

  if (pathname === '/accessibility') {
    return {
      title: 'Accessibility Statement | Kante Elite Training',
      description:
        'Read the Kante Elite Training accessibility statement and contact the team about website accessibility needs.',
    }
  }

  if (pathname === '/login') {
    return {
      title: 'Login | Kante Elite Training',
      description: DEFAULT_DESCRIPTION,
      robots: 'noindex,nofollow',
    }
  }

  if (pathname === '/register') {
    return {
      title: 'Register | Kante Elite Training',
      description: DEFAULT_DESCRIPTION,
      robots: 'noindex,nofollow',
    }
  }

  if (pathname === '/forgot-password') {
    return {
      title: 'Forgot Password | Kante Elite Training',
      description: DEFAULT_DESCRIPTION,
      robots: 'noindex,nofollow',
    }
  }

  if (pathname === '/reset-password') {
    return {
      title: 'Reset Password | Kante Elite Training',
      description: DEFAULT_DESCRIPTION,
      robots: 'noindex,nofollow',
    }
  }

  if (pathname === '/account') {
    return {
      title: 'My Account | Kante Elite Training',
      description: DEFAULT_DESCRIPTION,
      robots: 'noindex,nofollow',
    }
  }

  if (/^\/captain(\/|$)/.test(pathname)) {
    return {
      title: 'Team Portal | Kante Elite Training',
      description: DEFAULT_DESCRIPTION,
      robots: 'noindex,nofollow',
    }
  }

  if (/^\/admin(\/|$)/.test(pathname)) {
    return {
      title: 'Admin | Kante Elite Training',
      description: DEFAULT_DESCRIPTION,
      robots: 'noindex,nofollow',
    }
  }

  return {
    title: document.title || DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  }
}

export default function CanonicalMeta() {
  const location = useLocation()

  useEffect(() => {
    const canonicalPath = location.pathname === '/' ? '/' : location.pathname
    const canonicalUrl = new URL(canonicalPath, SITE_URL).toString()
    const meta = getMetaConfig(location.pathname)

    document.title = meta.title

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

    upsertHeadTag<HTMLMetaElement>(
      'meta[name="description"]',
      () => {
        const metaTag = document.createElement('meta')
        metaTag.setAttribute('name', 'description')
        return metaTag
      },
      (metaTag) => {
        metaTag.setAttribute('content', meta.description)
      },
    )

    upsertHeadTag<HTMLMetaElement>(
      'meta[name="robots"]',
      () => {
        const metaTag = document.createElement('meta')
        metaTag.setAttribute('name', 'robots')
        return metaTag
      },
      (metaTag) => {
        metaTag.setAttribute('content', meta.robots ?? 'index,follow')
      },
    )

    ;[
      ['og:title', meta.title],
      ['og:description', meta.description],
      ['og:type', meta.ogType ?? 'website'],
      ['og:image', meta.image ?? DEFAULT_IMAGE],
      ['og:image:alt', BRAND_LOGO_ALT],
      ['twitter:title', meta.title],
      ['twitter:description', meta.description],
      ['twitter:image', meta.image ?? DEFAULT_IMAGE],
    ].forEach(([property, content]) => {
      const attribute = property.startsWith('twitter:') ? 'name' : 'property'
      upsertHeadTag<HTMLMetaElement>(
        `meta[${attribute}="${property}"]`,
        () => {
          const metaTag = document.createElement('meta')
          metaTag.setAttribute(attribute, property)
          return metaTag
        },
        (metaTag) => {
          metaTag.setAttribute('content', content)
        },
      )
    })
  }, [location.pathname])

  return null
}

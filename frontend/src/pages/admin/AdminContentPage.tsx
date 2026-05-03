import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorBanner from '../../components/ErrorBanner'
import PageSkeleton from '../../components/PageSkeleton'
import { defaultWebsiteContent } from '../../content/defaultWebsiteContent'
import { getAdminWebsiteContent, updateWebsiteContent } from '../../services/api'
import type { WebsiteContent } from '../../types'

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-300">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white"
      />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  helper,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  helper?: string
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        {helper ? <span className="text-xs text-gray-500">{helper}</span> : null}
      </div>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white"
      />
    </label>
  )
}

type EditableContentField =
  | 'homeBadge'
  | 'homeHeadline'
  | 'homeDescription'
  | 'homeHighlightsTitle'
  | 'homeHighlightsDescription'
  | 'aboutBadge'
  | 'aboutHeroTitle'
  | 'aboutHeroDescription'
  | 'aboutHeadline'
  | 'aboutIntro'
  | 'aboutBody'
  | 'aboutTrustStatement'
  | 'aboutGalleryTitle'
  | 'aboutGalleryDescription'
  | 'aboutExperienceTitle'
  | 'aboutExperienceDescription'

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent)
  const [experiencePointsText, setExperiencePointsText] = useState(
    defaultWebsiteContent.aboutExperiencePoints.join('\n'),
  )

  useEffect(() => {
    document.title = 'Content | Kante Elite Training'
    return () => {
      document.title = 'Kante Elite Training'
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    getAdminWebsiteContent()
      .then((websiteContent) => {
        const mergedContent = {
          ...defaultWebsiteContent,
          ...websiteContent,
          aboutExperiencePoints:
            websiteContent.aboutExperiencePoints?.length > 0
              ? websiteContent.aboutExperiencePoints
              : defaultWebsiteContent.aboutExperiencePoints,
        }
        setContent(mergedContent)
        setExperiencePointsText(mergedContent.aboutExperiencePoints.join('\n'))
      })
      .catch(() => setError('Could not load website content.'))
      .finally(() => setLoading(false))
  }, [])

  const updateContentField = (key: EditableContentField, value: string) => {
    setStatus('')
    setContent((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const saveContent = async () => {
    setSaving(true)
    setError('')
    setStatus('')

    try {
      const updated = await updateWebsiteContent({
        homeBadge: content.homeBadge,
        homeHeadline: content.homeHeadline,
        homeDescription: content.homeDescription,
        homeHighlightsTitle: content.homeHighlightsTitle,
        homeHighlightsDescription: content.homeHighlightsDescription,
        aboutBadge: content.aboutBadge,
        aboutHeroTitle: content.aboutHeroTitle,
        aboutHeroDescription: content.aboutHeroDescription,
        aboutHeadline: content.aboutHeadline,
        aboutIntro: content.aboutIntro,
        aboutBody: content.aboutBody,
        aboutTrustStatement: content.aboutTrustStatement,
        aboutGalleryTitle: content.aboutGalleryTitle,
        aboutGalleryDescription: content.aboutGalleryDescription,
        aboutExperienceTitle: content.aboutExperienceTitle,
        aboutExperienceDescription: content.aboutExperienceDescription,
        aboutExperiencePoints: experiencePointsText
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean),
      })

      const mergedContent = {
        ...defaultWebsiteContent,
        ...updated,
        aboutExperiencePoints:
          updated.aboutExperiencePoints?.length > 0
            ? updated.aboutExperiencePoints
            : defaultWebsiteContent.aboutExperiencePoints,
      }

      setContent(mergedContent)
      setExperiencePointsText(mergedContent.aboutExperiencePoints.join('\n'))
      setStatus('Website content saved.')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save website content.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageSkeleton titleWidthClassName="w-56" count={4} />
  }

  return (
    <div>
      <div className="panel-header">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">Content</h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage public homepage and about page copy. Visual placement is handled in Media.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to="/admin/media"
              className="w-full rounded-lg bg-gray-800 px-4 py-3 text-center text-sm font-semibold text-gray-200 hover:bg-gray-700 sm:w-auto"
            >
              Open Media
            </Link>
            <button
              type="button"
              onClick={saveContent}
              disabled={saving}
              className="w-full rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50 sm:w-auto"
            >
              {saving ? 'Saving...' : 'Save Content'}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      ) : null}

      {status ? (
        <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-300">
          {status}
        </div>
      ) : null}

      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <div className="mb-6">
            <span className="section-label">Homepage</span>
            <h2 className="text-2xl font-black text-white">Hero and highlights copy</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TextField
              label="Home badge"
              value={content.homeBadge ?? ''}
              onChange={(value) => updateContentField('homeBadge', value)}
            />
            <TextField
              label="Home headline"
              value={content.homeHeadline ?? ''}
              onChange={(value) => updateContentField('homeHeadline', value)}
            />
            <div className="lg:col-span-2">
              <TextAreaField
                label="Home description"
                value={content.homeDescription ?? ''}
                onChange={(value) => updateContentField('homeDescription', value)}
                rows={4}
              />
            </div>
            <TextField
              label="Highlights section title"
              value={content.homeHighlightsTitle ?? ''}
              onChange={(value) => updateContentField('homeHighlightsTitle', value)}
            />
            <div className="lg:col-span-2">
              <TextAreaField
                label="Highlights section description"
                value={content.homeHighlightsDescription ?? ''}
                onChange={(value) => updateContentField('homeHighlightsDescription', value)}
                rows={3}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <div className="mb-6">
            <span className="section-label">About Page</span>
            <h2 className="text-2xl font-black text-white">Story, trust, and credentials</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TextField
              label="About badge"
              value={content.aboutBadge ?? ''}
              onChange={(value) => updateContentField('aboutBadge', value)}
            />
            <TextField
              label="About hero title"
              value={content.aboutHeroTitle ?? ''}
              onChange={(value) => updateContentField('aboutHeroTitle', value)}
            />
            <div className="lg:col-span-2">
              <TextAreaField
                label="About hero description"
                value={content.aboutHeroDescription ?? ''}
                onChange={(value) => updateContentField('aboutHeroDescription', value)}
                rows={3}
              />
            </div>
            <TextField
              label="About headline"
              value={content.aboutHeadline ?? ''}
              onChange={(value) => updateContentField('aboutHeadline', value)}
            />
            <TextField
              label="Trust statement"
              value={content.aboutTrustStatement ?? ''}
              onChange={(value) => updateContentField('aboutTrustStatement', value)}
            />
            <div className="lg:col-span-2">
              <TextAreaField
                label="About intro"
                value={content.aboutIntro ?? ''}
                onChange={(value) => updateContentField('aboutIntro', value)}
                rows={3}
              />
            </div>
            <div className="lg:col-span-2">
              <TextAreaField
                label="About body"
                value={content.aboutBody ?? ''}
                onChange={(value) => updateContentField('aboutBody', value)}
                rows={4}
              />
            </div>
            <TextField
              label="Gallery title"
              value={content.aboutGalleryTitle ?? ''}
              onChange={(value) => updateContentField('aboutGalleryTitle', value)}
            />
            <div className="lg:col-span-2">
              <TextAreaField
                label="Gallery description"
                value={content.aboutGalleryDescription ?? ''}
                onChange={(value) => updateContentField('aboutGalleryDescription', value)}
                rows={3}
              />
            </div>
            <TextField
              label="Experience title"
              value={content.aboutExperienceTitle ?? ''}
              onChange={(value) => updateContentField('aboutExperienceTitle', value)}
            />
            <div className="lg:col-span-2">
              <TextAreaField
                label="Experience description"
                value={content.aboutExperienceDescription ?? ''}
                onChange={(value) => updateContentField('aboutExperienceDescription', value)}
                rows={3}
              />
            </div>
            <div className="lg:col-span-2">
              <TextAreaField
                label="Experience bullet points"
                value={experiencePointsText}
                onChange={setExperiencePointsText}
                rows={6}
                helper="One line per point"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="section-label">Media</span>
              <h2 className="text-2xl font-black text-white">Manage visuals in the media library</h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Uploads, hero/profile/gallery assignments, and display order live in the media workspace.
              </p>
            </div>
            <Link
              to="/admin/media"
              className="w-full rounded-lg bg-amber-500 px-4 py-3 text-center text-sm font-bold text-black hover:bg-amber-400 md:w-auto"
            >
              Open Media Library
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

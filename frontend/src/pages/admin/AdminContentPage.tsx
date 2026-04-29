import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryBadge, { CATEGORY_OPTIONS, getCategoryLabel } from '../../components/CategoryBadge'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'
import MediaPostCard from '../../components/MediaPostCard'
import PageSkeleton from '../../components/PageSkeleton'
import { defaultWebsiteContent } from '../../content/defaultWebsiteContent'
import {
  getAdminWebsiteContent,
  getMediaPosts,
  updateMediaPost,
  updateWebsiteContent,
} from '../../services/api'
import type { MediaCategory, MediaPost, WebsiteContent } from '../../types'
import { sortMediaPosts } from '../../utils/media'

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
  placeholder,
  helper,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
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
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white"
      />
    </label>
  )
}

function ToggleButton({
  badge,
  label,
  active,
  disabled,
  onClick,
}: {
  badge: string
  label: string
  active: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-2xl px-3 py-2 text-left text-xs font-semibold transition-colors sm:w-auto sm:rounded-full ${
        active
          ? 'bg-amber-500 text-black'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      } disabled:opacity-50`}
    >
      <span className={`mr-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] ${
        active ? 'bg-black/15 text-black' : 'bg-black text-gray-200'
      }`}>
        {badge}
      </span>
      {label}
    </button>
  )
}

function MediaOrderField({
  label,
  value,
  disabled,
  onCommit,
}: {
  label: string
  value: number
  disabled?: boolean
  onCommit: (value: number) => void
}) {
  const [draft, setDraft] = useState(String(value ?? 0))

  useEffect(() => {
    setDraft(String(value ?? 0))
  }, [value])

  const commit = () => {
    const parsed = Number.parseInt(draft, 10)
    const normalized = Number.isFinite(parsed) && parsed > 0 ? parsed : 0
    setDraft(String(normalized))
    if (normalized !== value) {
      onCommit(normalized)
    }
  }

  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
        {label}
      </span>
      <input
        type="number"
        min={0}
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur()
          }
        }}
        className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
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
  const [savingPostIds, setSavingPostIds] = useState<number[]>([])
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent)
  const [experiencePointsText, setExperiencePointsText] = useState(
    defaultWebsiteContent.aboutExperiencePoints.join('\n'),
  )
  const [posts, setPosts] = useState<MediaPost[]>([])
  const [filterCategory, setFilterCategory] = useState<MediaCategory | 'ALL'>('ALL')
  const [editingCategoryPostId, setEditingCategoryPostId] = useState<number | null>(null)


  useEffect(() => {
    document.title = 'Content | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([getAdminWebsiteContent(), getMediaPosts()])
      .then(([websiteContent, mediaPosts]) => {
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
        setPosts(mediaPosts)
      })
      .catch(() => setError('Could not load website content.'))
      .finally(() => setLoading(false))
  }, [])

  const featuredPostCount = useMemo(
    () => posts.filter((post) => post.featured).length,
    [posts],
  )

  const filteredPosts = useMemo(() => {
    const orderedPosts = sortMediaPosts(posts, 'feed')
    if (filterCategory === 'ALL') return orderedPosts
    return orderedPosts.filter((post) => post.mediaCategory === filterCategory)
  }, [posts, filterCategory])

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

  const togglePost = async (postId: number, patch: Partial<MediaPost>) => {
    setSavingPostIds((current) => [...current, postId])
    setError('')
    setStatus('')

    try {
      await updateMediaPost(postId, {
        altText: patch.altText,
        featured: patch.featured,
        showOnHome: patch.showOnHome,
        showOnAbout: patch.showOnAbout,
        mediaCategory: patch.mediaCategory,
        displayOrder: patch.displayOrder,
        homeDisplayOrder: patch.homeDisplayOrder,
        aboutDisplayOrder: patch.aboutDisplayOrder,
      })
      const refreshedPosts = await getMediaPosts()
      setPosts(refreshedPosts)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not update media placement.'
      setError(message)
    } finally {
      setSavingPostIds((current) => current.filter((id) => id !== postId))
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
              Control homepage copy, about page content, and where each media post appears.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link to="/admin/media" className="w-full rounded-lg bg-gray-800 px-4 py-3 text-center text-sm font-semibold text-gray-200 hover:bg-gray-700 sm:w-auto">
              Upload Media
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
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end md:justify-between">
            <div>
              <span className="section-label">Media Placement</span>
              <h2 className="text-2xl font-black text-white">Choose what appears on each page</h2>
              <p className="mt-2 text-sm text-gray-400">
                Featured media becomes the hero background on Home and About. If nothing is featured, the site keeps the default hero instead of switching to the newest upload.
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-amber-400">
                Only one featured hero is active at a time.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                Set any order field to `0` to keep automatic newest-first sorting. Use positive numbers to pin an item higher on that surface.
              </p>
            </div>
            <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300">
              {featuredPostCount} featured
            </div>
          </div>

          {posts.length > 0 ? (
            <div className="mb-6 flex flex-wrap gap-2">
              {(['ALL', ...CATEGORY_OPTIONS.map((o) => o.value)] as (MediaCategory | 'ALL')[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filterCategory === cat
                      ? 'bg-amber-500 text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {cat === 'ALL' ? `All (${posts.length})` : `${getCategoryLabel(cat)} (${posts.filter((p) => p.mediaCategory === cat).length})`}
                </button>
              ))}
            </div>
          ) : null}

          {posts.length === 0 ? (
            <EmptyState
              icon="Media"
              title="No media posts yet"
              description="Upload your first image or video before placing content on the homepage and about page."
              action={
                <Link
                  to="/admin/media"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400"
                >
                  Go to Media Uploads
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredPosts.map((post, index) => {
                const isSavingPost = savingPostIds.includes(post.id)
                const isEditingCategory = editingCategoryPostId === post.id

                return (
                  <div key={post.id} className="rounded-2xl border border-gray-800 bg-black/40 p-4">
                    <MediaPostCard
                      post={post}
                      imageLoading={index < 4 ? 'eager' : 'lazy'}
                      imageFetchPriority={index < 2 ? 'high' : 'auto'}
                    />
                    <div className="mt-3 flex items-center justify-between gap-2">
                      {post.mediaCategory ? (
                        <CategoryBadge category={post.mediaCategory} size="sm" />
                      ) : (
                        <span className="text-xs text-gray-500">No category</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingCategoryPostId(isEditingCategory ? null : post.id)}
                        className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700"
                      >
                        {isEditingCategory ? 'Cancel' : 'Edit Category'}
                      </button>
                    </div>
                    {isEditingCategory ? (
                      <div className="mt-3">
                        <select
                          defaultValue={post.mediaCategory ?? ''}
                          disabled={isSavingPost}
                          onChange={async (e) => {
                            const val = e.target.value as MediaCategory
                            if (val) {
                              await togglePost(post.id, { mediaCategory: val })
                              setEditingCategoryPostId(null)
                            }
                          }}
                          className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm text-white"
                        >
                          <option value="">Select category…</option>
                          {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <ToggleButton
                        badge="Home"
                        label={post.showOnHome ? 'Showing on Home Page' : 'Show on Home Page'}
                        active={post.showOnHome}
                        disabled={isSavingPost}
                        onClick={() => togglePost(post.id, { showOnHome: !post.showOnHome })}
                      />
                      <ToggleButton
                        badge="About"
                        label={post.showOnAbout ? 'Showing on About Page' : 'Show on About Page'}
                        active={post.showOnAbout}
                        disabled={isSavingPost}
                        onClick={() => togglePost(post.id, { showOnAbout: !post.showOnAbout })}
                      />
                      <ToggleButton
                        badge="Hero"
                        label={post.featured ? 'Featured for Hero' : 'Feature for Hero'}
                        active={post.featured}
                        disabled={isSavingPost}
                        onClick={() => togglePost(post.id, { featured: !post.featured })}
                      />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <MediaOrderField
                        label="Feed order"
                        value={post.displayOrder}
                        disabled={isSavingPost}
                        onCommit={(value) => togglePost(post.id, { displayOrder: value })}
                      />
                      <MediaOrderField
                        label="Home order"
                        value={post.homeDisplayOrder}
                        disabled={isSavingPost || !post.showOnHome}
                        onCommit={(value) => togglePost(post.id, { homeDisplayOrder: value })}
                      />
                      <MediaOrderField
                        label="About order"
                        value={post.aboutDisplayOrder}
                        disabled={isSavingPost || !post.showOnAbout}
                        onCommit={(value) => togglePost(post.id, { aboutDisplayOrder: value })}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

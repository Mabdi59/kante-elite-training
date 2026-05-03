import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORY_OPTIONS } from '../components/CategoryBadge'
import CTASection from '../components/CTASection'
import MediaLightbox from '../components/MediaLightbox'
import MediaPostCard from '../components/MediaPostCard'
import PageSkeleton from '../components/PageSkeleton'
import { Section } from '../components/Section'
import { getMediaPosts } from '../services/api'
import type { MediaCategory, MediaPost } from '../types'
import { getPostsByPlacement, sortMediaPosts } from '../utils/media'

type FilterCategory = MediaCategory | 'ALL'

const CATEGORY_TABS: { value: FilterCategory; label: string }[] = [
  { value: 'ALL', label: 'All' },
  ...CATEGORY_OPTIONS,
]

export default function MediaPage() {
  const [posts, setPosts] = useState<MediaPost[]>([])
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(12)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('ALL')

  useEffect(() => {
    setLoading(true)
    getMediaPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const orderedPosts = useMemo(() => {
    const libraryPosts = getPostsByPlacement(posts, 'MEDIA_LIBRARY')
    return libraryPosts.length > 0 ? libraryPosts : sortMediaPosts(posts, 'feed')
  }, [posts])

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'ALL') return orderedPosts
    return orderedPosts.filter((post) => post.mediaCategory === activeCategory)
  }, [activeCategory, orderedPosts])

  const visiblePosts = filteredPosts.slice(0, visibleCount)
  const lightboxPosts = visiblePosts
  const photoCount = orderedPosts.filter((post) => post.mediaType === 'IMAGE').length
  const videoCount = orderedPosts.filter((post) => post.mediaType === 'VIDEO').length

  const handleCategoryChange = (category: FilterCategory) => {
    setActiveCategory(category)
    setVisibleCount(12)
    setActiveMediaIndex(null)
  }

  const leadPost = visiblePosts[0] ?? null
  const supportingPosts = visiblePosts.slice(1, 3)
  const remainingPosts = visiblePosts.slice(3)

  return (
    <div className="min-h-screen bg-black pt-20">
      <section className="relative overflow-hidden px-4 py-16 sm:py-20">
        <div className="absolute inset-0 bg-radial-hero opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#78350f_0%,_transparent_60%)] opacity-20" />
        <div className="page-shell relative">
          <div className="max-w-3xl animate-fade-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Highlights
            </div>
            <h1 className="text-3xl font-black text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Photos, Video, and Training Moments
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
              A closer look at the sessions, the standards, and the work behind each week of development.
            </p>
            <div className="button-stack-mobile mt-8">
              <Link to="/book" className="btn-primary w-full sm:w-auto">
                Book a Session
              </Link>
              <Link to="/about" className="btn-secondary w-full sm:w-auto">
                Meet Coach Kante
              </Link>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 text-sm text-gray-400 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Photos</p>
                <p className="mt-1 text-lg font-black text-white">{photoCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Videos</p>
                <p className="mt-1 text-lg font-black text-white">{videoCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Categories</p>
                <p className="mt-1 text-lg font-black text-white">{CATEGORY_OPTIONS.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section tone="raised">
          {posts.length > 1 ? (
            <div className="mb-8 flex flex-wrap gap-2">
              {CATEGORY_TABS.map((tab) => {
                const count =
                  tab.value === 'ALL'
                    ? orderedPosts.length
                    : orderedPosts.filter((post) => post.mediaCategory === tab.value).length

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => handleCategoryChange(tab.value)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      activeCategory === tab.value
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                        : 'border-gray-700 bg-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        activeCategory === tab.value
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-[#1a1a1a] text-gray-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : null}

          {loading ? (
            <PageSkeleton titleWidthClassName="w-64" count={6} />
          ) : posts.length > 0 && leadPost ? (
            <div className="space-y-8">
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <button
                  type="button"
                  onClick={() => setActiveMediaIndex(0)}
                  aria-label={`Open ${leadPost.caption || 'featured media'} in gallery`}
                  className="block h-full w-full text-left"
                >
                  <MediaPostCard
                    post={leadPost}
                    aspectClassName="aspect-[16/10]"
                    imageLoading="eager"
                  />
                </button>

                <div className="grid gap-6">
              <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
                    <p className="text-xs font-semibold uppercase text-amber-400">
                      Current view
                    </p>
                    <h2 className="mt-3 text-2xl font-black text-white">
                      {activeCategory === 'ALL'
                        ? 'The full Kante Elite media library'
                        : `${CATEGORY_TABS.find((tab) => tab.value === activeCategory)?.label ?? 'Selected'} highlights`}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-gray-400">
                      Open any card for a larger view, swipe through videos and photos, and explore how sessions look in real time.
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    {supportingPosts.map((post, index) => (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => setActiveMediaIndex(index + 1)}
                        aria-label={`Open ${post.caption || 'media item'} in gallery`}
                        className="block h-full w-full text-left"
                      >
                        <MediaPostCard
                          post={post}
                          aspectClassName="aspect-[4/3]"
                          imageLoading="eager"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {remainingPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {remainingPosts.map((post, index) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => setActiveMediaIndex(index + 3)}
                      aria-label={`Open ${post.caption || 'media item'} in gallery`}
                      className="block h-full w-full text-left"
                    >
                      <MediaPostCard
                        post={post}
                        imageLoading="eager"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
              <div className="rounded-2xl border border-[#222] bg-[#101010] px-6 py-12 text-center">
              <p className="text-lg font-semibold text-white">No media has been published yet.</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-400">
                Published photos and videos from Kante Elite sessions will appear here once the admin adds them to the media page.
              </p>
            </div>
          )}

          {!loading && filteredPosts.length > visiblePosts.length ? (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + 8)}
                className="btn-secondary w-full sm:w-auto"
              >
                Load More Highlights
              </button>
            </div>
          ) : null}
      </Section>

      <CTASection
        eyebrow="Step Into The Work"
        title="Ready to Build Your Own Highlights"
        subtitle="Book a session and train in an environment built for steady growth, confident play, and real progress."
        primaryLabel="Start Training"
        primaryHref="/book"
        secondaryLabel="View Programs"
        secondaryHref="/training"
        proofPoints={[
          'Real session footage',
          'Private and small group options',
          'Book online when ready',
        ]}
      />

      <MediaLightbox
        posts={lightboxPosts}
        activeIndex={activeMediaIndex}
        onClose={() => setActiveMediaIndex(null)}
        onSelect={setActiveMediaIndex}
      />
    </div>
  )
}

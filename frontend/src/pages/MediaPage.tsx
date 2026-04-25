import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORY_OPTIONS, getCategoryLabel } from '../components/CategoryBadge'
import CTASection from '../components/CTASection'
import EmptyState from '../components/EmptyState'
import MediaLightbox from '../components/MediaLightbox'
import MediaPostCard from '../components/MediaPostCard'
import PageSkeleton from '../components/PageSkeleton'
import { getMediaPosts } from '../services/api'
import type { MediaCategory, MediaPost } from '../types'

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
    document.title = 'Media & Highlights | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

  useEffect(() => {
    setLoading(true)
    getMediaPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'ALL') return posts
    return posts.filter((p) => p.mediaCategory === activeCategory)
  }, [posts, activeCategory])

  const visiblePosts = filteredPosts.slice(0, visibleCount)

  const handleCategoryChange = (cat: FilterCategory) => {
    setActiveCategory(cat)
    setVisibleCount(12)
    setActiveMediaIndex(null)
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <section className="relative overflow-hidden px-4 py-16 sm:py-20">
        <div className="absolute inset-0 bg-radial-hero opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#78350f_0%,_transparent_60%)] opacity-20" />
        <div className="page-shell relative">
          <div className="max-w-3xl animate-fade-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Highlights
            </div>
            <h1 className="text-3xl font-black text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Training Highlights and Event Moments
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
              A closer look at sessions, match day intensity, and the work players put in every week.
            </p>
            <div className="button-stack-mobile mt-8">
              <Link to="/book" className="btn-primary w-full sm:w-auto">
                Book a Session
              </Link>
              <Link to="/about" className="btn-secondary w-full sm:w-auto">
                Meet Coach Kante
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#1a1a1a] bg-[#0a0a0a] px-4 py-16">
        <div className="page-shell">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="section-label">Latest Highlights</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
                From Training Ground to Game Day
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-gray-400">
              Every post is part of the story, from technical work and small group sessions to events and tournament weekends.
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {CATEGORY_TABS.map((tab) => {
              const count =
                tab.value === 'ALL'
                  ? posts.length
                  : posts.filter((p) => p.mediaCategory === tab.value).length
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

          {loading ? (
            <PageSkeleton titleWidthClassName="w-64" count={6} />
          ) : visiblePosts.length === 0 ? (
            <EmptyState
              icon="Media"
              title={activeCategory === 'ALL' ? 'No highlights posted yet' : `No ${getCategoryLabel(activeCategory as MediaCategory)} yet`}
              description={
                activeCategory === 'ALL'
                  ? 'Fresh training clips, event moments, and player highlights will show up here once they are published.'
                  : 'Nothing in this category yet. Check back soon or explore another category.'
              }
              action={
                activeCategory !== 'ALL' ? (
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('ALL')}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400"
                  >
                    View all highlights
                  </button>
                ) : (
                  <Link to="/training" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400">
                    Explore programs while you check back
                  </Link>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {visiblePosts.map((post, index) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setActiveMediaIndex(index)}
                  className="block w-full text-left"
                >
                  <MediaPostCard
                    post={post}
                    imageLoading={index < 4 ? 'eager' : 'lazy'}
                    imageFetchPriority={index < 2 ? 'high' : 'auto'}
                  />
                </button>
              ))}
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
        </div>
      </section>

      <CTASection
        title="Ready to Build Your Own Highlights"
        subtitle="Book a session and train in an environment built for steady growth, confident play, and real progress."
        primaryLabel="Start Training"
        primaryHref="/book"
        secondaryLabel="View Programs"
        secondaryHref="/training"
      />

      <MediaLightbox
        posts={visiblePosts}
        activeIndex={activeMediaIndex}
        onClose={() => setActiveMediaIndex(null)}
        onSelect={setActiveMediaIndex}
      />
    </div>
  )
}

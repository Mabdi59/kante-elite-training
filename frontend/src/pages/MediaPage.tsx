import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CTASection from '../components/CTASection'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import MediaPostCard from '../components/MediaPostCard'
import { getMediaPosts } from '../services/api'
import type { MediaPost } from '../types'

export default function MediaPage() {
  const [posts, setPosts] = useState<MediaPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getMediaPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const featuredPosts = posts

  return (
    <div className="min-h-screen bg-black pt-20">
      <section className="relative overflow-hidden px-4 py-20">
        <div className="absolute inset-0 bg-radial-hero opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#78350f_0%,_transparent_60%)] opacity-20" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Media
            </div>
            <h1 className="text-4xl font-black text-white md:text-5xl lg:text-6xl">
              Training Highlights and Event Moments
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-300">
              A closer look at sessions, match day intensity, and the work players put in every week.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/book" className="btn-primary">
                Book a Session
              </Link>
              <Link to="/about" className="btn-secondary">
                Meet Coach Kante
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#1a1a1a] bg-[#0a0a0a] px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="section-label">Latest Highlights</span>
              <h2 className="text-4xl font-black text-white md:text-5xl">
                From Training Ground to Game Day
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-gray-400">
              Every post is part of the story, from technical work and small group sessions to events and tournament weekends.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading highlights..." />
          ) : featuredPosts.length === 0 ? (
            <EmptyState
              icon="Media"
              title="No highlights posted yet"
              description="New media will appear here as soon as fresh photos and videos are published."
              action={
                <Link to="/training" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400">
                  Explore programs while you check back
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {featuredPosts.map((post) => (
                <MediaPostCard
                  key={post.id}
                  post={post}
                />
              ))}
            </div>
          )}
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
    </div>
  )
}

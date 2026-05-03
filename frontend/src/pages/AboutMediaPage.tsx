import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MediaAsset from '../components/MediaAsset'
import MediaLightbox from '../components/MediaLightbox'
import MediaPostCard from '../components/MediaPostCard'
import PageSkeleton from '../components/PageSkeleton'
import CoachKanteProfile from '../components/CoachKanteProfile'
import { Section } from '../components/Section'
import { defaultWebsiteContent } from '../content/defaultWebsiteContent'
import { getMediaPosts, getPublicCoaches, getWebsiteContent } from '../services/api'
import type { CoachProfile, MediaPost, WebsiteContent } from '../types'
import { getMediaAlt, getPostsByPlacement } from '../utils/media'

export default function AboutMediaPage() {
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([])
  const [coaches, setCoaches] = useState<CoachProfile[]>([])
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent)
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([getMediaPosts(), getWebsiteContent(), getPublicCoaches()]).then(([mediaResult, contentResult, coachResult]) => {
      if (mediaResult.status === 'fulfilled') {
        setMediaPosts(mediaResult.value)
      } else {
        setMediaPosts([])
      }

      if (contentResult.status === 'fulfilled') {
        setContent({
          ...defaultWebsiteContent,
          ...contentResult.value,
          aboutExperiencePoints:
            contentResult.value.aboutExperiencePoints?.length > 0
              ? contentResult.value.aboutExperiencePoints
              : defaultWebsiteContent.aboutExperiencePoints,
        })
      }
      if (coachResult.status === 'fulfilled') {
        setCoaches(coachResult.value)
      }
    }).finally(() => setLoading(false))
  }, [])

  const aboutGalleryPosts = useMemo(
    () => getPostsByPlacement(mediaPosts, 'ABOUT_GALLERY'),
    [mediaPosts],
  )

  const heroPost = useMemo(
    () => getPostsByPlacement(mediaPosts, 'ABOUT_HERO')[0] ?? aboutGalleryPosts[0] ?? null,
    [aboutGalleryPosts, mediaPosts],
  )

  const coachProfilePost = useMemo(
    () => getPostsByPlacement(mediaPosts, 'ABOUT_PROFILE')[0] ?? null,
    [mediaPosts],
  )

  const galleryPosts = useMemo(
    () => aboutGalleryPosts.filter((post) => post.id !== heroPost?.id).slice(0, 5),
    [aboutGalleryPosts, heroPost],
  )

  const coachKante =
    coaches.find((coach) => coach.displayName.toLowerCase().includes('kante')) ??
    coaches.find((coach) => coach.featured) ??
    coaches[0] ??
    null

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="page-shell py-10">
          <PageSkeleton titleWidthClassName="w-72" count={4} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <section className="relative min-h-[72vh] overflow-hidden px-4 py-20 sm:min-h-[78vh] sm:py-24 lg:min-h-[calc(100vh-5rem)]">
        {heroPost ? (
          <div className="absolute inset-0 bg-[#050505]">
            <MediaAsset
              src={heroPost.mediaUrl}
              type={heroPost.mediaType}
              alt={getMediaAlt(heroPost, content.aboutHeroTitle || 'Kante Elite training banner')}
              loading="eager"
              fetchPriority="high"
              playbackMode="hero"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/25" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.32),_transparent_42%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/90" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-radial-hero opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#78350f_0%,_transparent_58%)] opacity-25" />
          </>
        )}

        <div className="page-shell relative flex min-h-[calc(72vh-10rem)] items-center sm:min-h-[calc(78vh-12rem)] lg:min-h-[calc(100vh-17rem)]">
          <div className="max-w-3xl animate-fade-up rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-sm sm:p-7 lg:bg-black/20">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {content.aboutBadge || defaultWebsiteContent.aboutBadge}
            </div>
            <h1 className="text-3xl font-black text-white sm:text-4xl md:text-5xl lg:text-6xl">
              {content.aboutHeroTitle || defaultWebsiteContent.aboutHeroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg">
              {content.aboutHeroDescription || defaultWebsiteContent.aboutHeroDescription}
            </p>
            <div className="mt-8 inline-flex rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              {content.aboutTrustStatement || defaultWebsiteContent.aboutTrustStatement}
            </div>
          </div>
        </div>
      </section>

      <CoachKanteProfile
        coach={coachKante}
        imagePost={coachProfilePost}
        compact
        secondaryCta={{ label: 'Contact Coach Kante', to: '/contact' }}
      />

      <Section tone="raised" shellClassName="max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <span className="section-label">Training Standard</span>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">What Players Can Expect</h2>
            <p className="mt-4 text-base leading-relaxed text-gray-400">
              The work stays practical: clear feedback, focused reps, and habits players can carry into their next match.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: 'Clear Plan',
                body: 'Each session starts with the player in front of him, not a generic workout.',
              },
              {
                title: 'Direct Correction',
                body: 'Technique, movement, and decision-making get coached in real time.',
              },
              {
                title: 'Game Speed',
                body: 'Drills build toward the moments players actually face on the field.',
              },
            ].map((item) => (
              <div key={item.title} className="border border-white/10 bg-black/35 p-5">
                <h3 className="text-lg font-black text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section divider={false} shellClassName="max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="section-label">{content.aboutGalleryTitle || defaultWebsiteContent.aboutGalleryTitle}</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl">
                Coach <span className="gradient-text">Kante</span> In Action
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">
                {content.aboutGalleryDescription || defaultWebsiteContent.aboutGalleryDescription}
              </p>
            </div>
            <Link to="/media" className="btn-secondary w-full text-sm md:w-auto">
              View Full Media Library
            </Link>
          </div>

          {galleryPosts.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <button
                type="button"
                onClick={() => setActiveMediaIndex(0)}
                aria-label={`Open ${galleryPosts[0].caption || 'featured coach media'} in gallery`}
                className="block h-full w-full text-left"
              >
                <MediaPostCard
                  post={galleryPosts[0]}
                  aspectClassName="aspect-[4/5] lg:aspect-[5/6]"
                  imageLoading="eager"
                />
              </button>

              <div className="grid grid-cols-2 gap-4">
                {galleryPosts.slice(1, 5).map((post, index) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setActiveMediaIndex(index + 1)}
                    aria-label={`Open ${post.caption || 'coach media'} in gallery`}
                    className="block h-full w-full text-left"
                  >
                    <MediaPostCard
                      post={post}
                      aspectClassName="aspect-[3/4]"
                      showDate={false}
                      imageLoading="eager"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
      </Section>

      <MediaLightbox
        posts={galleryPosts}
        activeIndex={activeMediaIndex}
        onClose={() => setActiveMediaIndex(null)}
        onSelect={setActiveMediaIndex}
      />
    </div>
  )
}

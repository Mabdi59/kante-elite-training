import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CTASection from '../components/CTASection'
import MediaAsset from '../components/MediaAsset'
import MediaLightbox from '../components/MediaLightbox'
import MediaPostCard from '../components/MediaPostCard'
import PageSkeleton from '../components/PageSkeleton'
import CoachKanteProfile from '../components/CoachKanteProfile'
import { Section, SectionHeader } from '../components/Section'
import { defaultWebsiteContent } from '../content/defaultWebsiteContent'
import { getMediaPosts, getPublicCoaches, getWebsiteContent } from '../services/api'
import type { CoachProfile, MediaPost, WebsiteContent } from '../types'
import { getMediaAlt, getPostsByPlacement } from '../utils/media'

const COACH_KANTE_PROFILE_IMAGE = '/images/coach-kante-profile.png'

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
      <section className="relative overflow-hidden px-4 py-16 sm:py-20">
        {heroPost ? (
          <div className="absolute inset-0 bg-[#050505]">
            <MediaAsset
              src={heroPost.mediaUrl}
              type={heroPost.mediaType}
              alt={getMediaAlt(heroPost, content.aboutHeroTitle || 'Kante Elite training banner')}
              loading="eager"
              fetchPriority="high"
              playbackMode="hero"
              className="absolute inset-y-0 right-0 h-full w-full object-contain object-right md:w-[72%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.32),_transparent_42%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-radial-hero opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#78350f_0%,_transparent_58%)] opacity-25" />
          </>
        )}

        <div className="page-shell relative">
          <div className="max-w-3xl animate-fade-up">
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

      <Section tone="raised" shellClassName="max-w-6xl">
          <SectionHeader
            eyebrow="Experience"
            title={content.aboutExperienceTitle || defaultWebsiteContent.aboutExperienceTitle}
            description={content.aboutExperienceDescription || defaultWebsiteContent.aboutExperienceDescription}
            className="mb-8"
          />

          <div className="grid items-start gap-8 lg:grid-cols-[auto_1fr]">
            <div className="mx-auto flex max-w-xs flex-col items-center gap-4 text-center lg:mx-0 lg:items-start lg:text-left">
              {coachKante?.headshotUrl ? (
                <div className="overflow-hidden rounded-2xl ring-2 ring-amber-500 shadow-xl">
                  <MediaAsset
                    src={coachKante.headshotUrl}
                    type={coachKante.headshotMediaType ?? 'IMAGE'}
                    alt={`${coachKante.displayName} headshot`}
                    loading="eager"
                    className="h-48 w-48 object-cover object-top"
                  />
                </div>
              ) : coachProfilePost ? (
                <div className="overflow-hidden rounded-2xl ring-2 ring-amber-500 shadow-xl">
                  <MediaAsset
                    src={coachProfilePost.mediaUrl}
                    type={coachProfilePost.mediaType}
                    alt={getMediaAlt(coachProfilePost)}
                    loading="eager"
                    className="h-48 w-48 object-cover object-top"
                  />
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl ring-2 ring-amber-500 shadow-xl">
                  <MediaAsset
                    src={COACH_KANTE_PROFILE_IMAGE}
                    type="IMAGE"
                    alt="Coach Kante headshot"
                    loading="eager"
                    className="h-48 w-48 object-cover object-top"
                  />
                </div>
              )}
              <div>
                <p className="text-xl font-black text-white">{coachKante?.displayName || 'Coach Kante'}</p>
                <p className="text-sm font-semibold uppercase text-amber-500">
                  {coachKante?.roleTitle || 'Founder & Elite Trainer'}
                </p>
                {coachKante?.certifications ? (
                  <p className="mt-1 text-xs text-gray-500">{coachKante.certifications}</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-[#222] bg-[#1a1a1a] p-5 sm:p-8">
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(content.aboutExperiencePoints?.length
                  ? content.aboutExperiencePoints
                  : defaultWebsiteContent.aboutExperiencePoints
                ).map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 rounded-xl border border-[#1f1f1f] bg-[#111] px-4 py-4"
                  >
                    <span className="mt-0.5 flex-shrink-0 text-amber-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold leading-relaxed text-white">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
      </Section>

      <CoachKanteProfile coach={coachKante} imagePost={coachProfilePost} compact />

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

      <CTASection
        eyebrow="Train With Intention"
        title="Train With Confidence"
        subtitle="Book a session with a coach who brings real playing experience and a clear plan for development."
        urgencyLine="Limited spots available each week"
        proofPoints={[
          'Coach-led sessions',
          'Real playing experience',
          'Book online when ready',
        ]}
      />

      <MediaLightbox
        posts={galleryPosts}
        activeIndex={activeMediaIndex}
        onClose={() => setActiveMediaIndex(null)}
        onSelect={setActiveMediaIndex}
      />
    </div>
  )
}

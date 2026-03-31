import { useEffect, useMemo, useState } from 'react'
import CTASection from '../components/CTASection'
import EmptyState from '../components/EmptyState'
import MediaPostCard from '../components/MediaPostCard'
import { defaultWebsiteContent } from '../content/defaultWebsiteContent'
import { getMediaPosts, getWebsiteContent } from '../services/api'
import type { MediaPost, WebsiteContent } from '../types'

export default function AboutMediaPage() {
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([])
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent)

  useEffect(() => {
    Promise.allSettled([getMediaPosts(), getWebsiteContent()]).then(([mediaResult, contentResult]) => {
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
    })
  }, [])

  const aboutMediaPosts = useMemo(
    () => mediaPosts.filter((post) => post.showOnAbout),
    [mediaPosts],
  )

  const aboutDisplayPosts = useMemo(
    () => aboutMediaPosts.slice(0, 12),
    [aboutMediaPosts],
  )

  const heroPost =
    aboutDisplayPosts.find((post) => post.featured) ??
    mediaPosts[0] ??
    null

  const galleryPosts = useMemo(
    () => aboutDisplayPosts.filter((post) => post.id !== heroPost?.id).slice(0, 11),
    [aboutDisplayPosts, heroPost],
  )

  return (
    <div className="bg-black pt-20">
      <section className="relative overflow-hidden px-4 py-20">
        {heroPost ? (
          <div className="absolute inset-0">
            {heroPost.mediaType === 'VIDEO' ? (
              <video
                src={heroPost.mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={heroPost.mediaUrl}
                alt={heroPost.caption?.trim() || content.aboutHeroTitle || 'Kante Elite training banner'}
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.32),_transparent_42%)]" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-radial-hero opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#78350f_0%,_transparent_58%)] opacity-25" />
          </>
        )}

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {content.aboutBadge || defaultWebsiteContent.aboutBadge}
            </div>
            <h1 className="text-4xl font-black text-white md:text-5xl lg:text-6xl">
              {content.aboutHeroTitle || defaultWebsiteContent.aboutHeroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-200">
              {content.aboutHeroDescription || defaultWebsiteContent.aboutHeroDescription}
            </p>
            <div className="mt-8 inline-flex rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              {content.aboutTrustStatement || defaultWebsiteContent.aboutTrustStatement}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="section-label">{content.aboutBadge || defaultWebsiteContent.aboutBadge}</span>
            <h2 className="mb-4 text-4xl font-black text-white">
              {content.aboutHeadline || defaultWebsiteContent.aboutHeadline}
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-gray-400">
              <p>{content.aboutIntro || defaultWebsiteContent.aboutIntro}</p>
              <p>{content.aboutBody || defaultWebsiteContent.aboutBody}</p>
            </div>
          </div>

          {galleryPosts[0] ? (
            <MediaPostCard
              post={galleryPosts[0]}
              aspectClassName="aspect-[5/4]"
              showDate={false}
            />
          ) : (
            <div className="rounded-2xl border border-[#222] bg-[#111] p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-400">
                Live Gallery
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Training photos and videos added in the admin panel will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-[#1a1a1a] bg-[#0a0a0a] px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <span className="section-label">
              {content.aboutExperienceTitle || defaultWebsiteContent.aboutExperienceTitle}
            </span>
            <h2 className="mb-4 text-4xl font-black text-white md:text-5xl">
              {content.aboutExperienceTitle || defaultWebsiteContent.aboutExperienceTitle}
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-400">
              {content.aboutExperienceDescription || defaultWebsiteContent.aboutExperienceDescription}
            </p>
          </div>

          <div className="rounded-2xl border border-[#222] bg-[#1a1a1a] p-8">
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(content.aboutExperiencePoints?.length
                ? content.aboutExperiencePoints
                : defaultWebsiteContent.aboutExperiencePoints
              ).map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 rounded-xl border border-[#1f1f1f] bg-[#111] px-4 py-4"
                >
                  <span className="mt-0.5 text-amber-500">*</span>
                  <span className="text-sm font-semibold leading-relaxed text-white">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="section-label">{content.aboutGalleryTitle || defaultWebsiteContent.aboutGalleryTitle}</span>
              <h2 className="text-4xl font-black text-white md:text-5xl">
                {content.aboutGalleryTitle || defaultWebsiteContent.aboutGalleryTitle}
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-gray-400">
              {content.aboutGalleryDescription || defaultWebsiteContent.aboutGalleryDescription}
            </p>
          </div>

          {galleryPosts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {galleryPosts.map((post) => (
                <MediaPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="Gallery"
              title="Gallery updates are on the way"
              description="Featured photos and videos will appear here as soon as they are published."
            />
          )}
        </div>
      </section>

      <CTASection
        title="Train With Confidence"
        subtitle="Book a session with a coach who brings real playing experience and a clear plan for development."
        urgencyLine="Limited spots available each week"
      />
    </div>
  )
}

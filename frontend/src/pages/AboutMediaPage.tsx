import { useEffect, useMemo, useState } from 'react'
import CTASection from '../components/CTASection'
import MediaLightbox from '../components/MediaLightbox'
import MediaPostCard from '../components/MediaPostCard'
import PageSkeleton from '../components/PageSkeleton'
import { defaultWebsiteContent } from '../content/defaultWebsiteContent'
import { getMediaPosts, getWebsiteContent } from '../services/api'
import type { MediaPost, WebsiteContent } from '../types'

export default function AboutMediaPage() {
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([])
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent)
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'About | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training, Columbus Youth Soccer Academy' }
  }, [])

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
    }).finally(() => setLoading(false))
  }, [])

  const aboutMediaPosts = useMemo(
    () => mediaPosts.filter((post) => post.showOnAbout),
    [mediaPosts],
  )

  const aboutDisplayPosts = useMemo(
    () => aboutMediaPosts.slice(0, 12),
    [aboutMediaPosts],
  )

  const heroPost = mediaPosts.find((post) => post.featured) ?? null

  const galleryPosts = useMemo(
    () => aboutDisplayPosts.filter((post) => post.id !== heroPost?.id).slice(0, 11),
    [aboutDisplayPosts, heroPost],
  )

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
                loading="eager"
                fetchPriority="high"
                className="h-full w-full object-cover animate-hero-zoom"
              />
            )}
            <div className="absolute inset-0 bg-black/60" />
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
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

      <section className="border-y border-[#1a1a1a] bg-[#0a0a0a] px-4 py-16">
        <div className="page-shell max-w-6xl">
          <div className="mb-8 text-center">
            <span className="section-label">Experience</span>
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl md:text-5xl">
              {content.aboutExperienceTitle || defaultWebsiteContent.aboutExperienceTitle}
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-400">
              {content.aboutExperienceDescription || defaultWebsiteContent.aboutExperienceDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-start">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-4 max-w-xs mx-auto lg:mx-0">
              <img
                src="/images/Coach.png"
                alt="Coach Mohamed Sheik Kante"
                className="w-48 h-48 rounded-2xl object-cover object-top ring-2 ring-amber-500 shadow-xl"
              />
              <div>
                <p className="text-white font-black text-xl">Mohamed Sheik</p>
                <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest">Coach Kante</p>
                <p className="text-gray-500 text-xs mt-1">Head Coach & Founder · Est. 2024</p>
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <span className="text-sm font-semibold leading-relaxed text-white">{point}</span>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-16">
        <div className="page-shell max-w-6xl">
          <div className="mb-8 text-center">
            <span className="section-label">In Action</span>
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Coach <span className="gradient-text">Kante</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: '/images/Coach.png', alt: 'Coach Kante' },
              { src: '/images/D26A0694.jpeg', alt: 'Coach Kante on the field' },
              { src: '/images/D26A0746.jpeg', alt: 'Coach Kante training' },
              { src: '/images/IMG_3599.jpeg', alt: 'Coach Kante in action' },
            ].map((photo) => (
              <div key={photo.src} className="rounded-2xl overflow-hidden aspect-[3/4] bg-[#111] border border-[#1e1e1e]">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Train With Confidence"
        subtitle="Book a session with a coach who brings real playing experience and a clear plan for development."
        urgencyLine="Limited spots available each week"
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

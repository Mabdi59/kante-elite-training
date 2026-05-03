import { useEffect, useRef } from 'react'
import CategoryBadge from './CategoryBadge'
import MediaAsset from './MediaAsset'
import type { MediaPost } from '../types'
import { formatMediaDate, getMediaAlt, getMediaCaption } from '../utils/media'

interface MediaLightboxProps {
  posts: MediaPost[]
  activeIndex: number | null
  onClose: () => void
  onSelect: (index: number) => void
}

export default function MediaLightbox({
  posts,
  activeIndex,
  onClose,
  onSelect,
}: MediaLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousFocusedElementRef = useRef<HTMLElement | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const post = activeIndex !== null ? posts[activeIndex] : null
  const canGoPrev = activeIndex !== null && activeIndex > 0
  const canGoNext = activeIndex !== null && activeIndex < posts.length - 1

  useEffect(() => {
    if (activeIndex === null) return

    previousFocusedElementRef.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && canGoPrev) onSelect(activeIndex - 1)
      if (event.key === 'ArrowRight' && canGoNext) onSelect(activeIndex + 1)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.requestAnimationFrame(() => closeButtonRef.current?.focus())

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previousFocusedElementRef.current?.focus?.()
    }
  }, [activeIndex, canGoNext, canGoPrev, onClose, onSelect])

  if (activeIndex === null || !post) return null

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null
    touchEndX.current = null
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = event.changedTouches[0]?.clientX ?? null
  }

  const handleTouchEnd = () => {
    const start = touchStartX.current
    const end = touchEndX.current
    if (start === null || end === null) return

    const delta = start - end
    if (Math.abs(delta) < 60) return

    if (delta > 0 && canGoNext) {
      onSelect(activeIndex + 1)
    } else if (delta < 0 && canGoPrev) {
      onSelect(activeIndex - 1)
    }
  }

  const caption = getMediaCaption(post)

  return (
    <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm animate-fade-in">
      <button
        type="button"
        aria-label="Close media viewer"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Media viewer"
        className="relative mx-auto flex h-full max-w-[96rem] flex-col px-4 py-4 sm:px-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs font-semibold uppercase text-white backdrop-blur">
            {activeIndex + 1} / {posts.length}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur"
            aria-label="Close media viewer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m6 6 12 12" />
              <path d="m18 6-12 12" />
            </svg>
          </button>
        </div>

          <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#050505] shadow-2xl">
          {canGoPrev ? (
            <button
              type="button"
              onClick={() => onSelect(activeIndex - 1)}
              className="absolute left-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur sm:inline-flex"
              aria-label="Previous media item"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          ) : null}

          {canGoNext ? (
            <button
              type="button"
              onClick={() => onSelect(activeIndex + 1)}
              className="absolute right-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur sm:inline-flex"
              aria-label="Next media item"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ) : null}

          <div
            className="flex h-full items-center justify-center bg-black p-3 sm:p-6"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <MediaAsset
              src={post.mediaUrl}
              type={post.mediaType}
              alt={getMediaAlt(post)}
              playbackMode="immersive"
              className="max-h-full w-full max-w-full object-contain"
            />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-4 pb-5 pt-14 sm:px-6">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase text-white backdrop-blur">
                {post.mediaType === 'VIDEO' ? 'Video' : 'Photo'}
              </span>
              {post.mediaCategory ? <CategoryBadge category={post.mediaCategory} size="sm" /> : null}
              <span className="text-xs font-semibold uppercase text-amber-400">
                {formatMediaDate(post.createdAt)}
              </span>
            </div>
            <p className="max-w-3xl whitespace-pre-line break-words text-sm leading-relaxed text-white sm:text-base">
              {caption}
            </p>
          </div>
        </div>

        {posts.length > 1 ? (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {posts.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(index)}
                className={`relative w-24 shrink-0 overflow-hidden rounded-2xl border transition-colors ${
                  index === activeIndex
                    ? 'border-amber-500/70 ring-1 ring-amber-500/30'
                    : 'border-white/10 hover:border-white/20'
                }`}
                aria-label={`View media item ${index + 1}`}
              >
                <div className="relative aspect-[4/3] bg-black">
                  <MediaAsset
                    src={item.mediaUrl}
                    type={item.mediaType}
                    alt={getMediaAlt(item)}
                    playbackMode="card"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  {item.mediaType === 'VIDEO' ? (
                    <span className="pointer-events-none absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
                      <svg className="h-3.5 w-3.5 translate-x-[1px]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.14v13.72c0 .78.84 1.26 1.5.86l10.5-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
                      </svg>
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

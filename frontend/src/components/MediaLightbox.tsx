import { useEffect, useRef, useState } from 'react'
import type { MediaPost } from '../types'

interface MediaLightboxProps {
  posts: MediaPost[]
  activeIndex: number | null
  onClose: () => void
  onSelect: (index: number) => void
}

function formatMediaDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Recently added'
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function MediaLightbox({
  posts,
  activeIndex,
  onClose,
  onSelect,
}: MediaLightboxProps) {
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const lastTapTime = useRef(0)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [showLikeBurst, setShowLikeBurst] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const post = activeIndex !== null ? posts[activeIndex] : null
  const canGoPrev = activeIndex !== null && activeIndex > 0
  const canGoNext = activeIndex !== null && activeIndex < posts.length - 1

  useEffect(() => {
    if (activeIndex === null) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && canGoPrev) onSelect(activeIndex - 1)
      if (event.key === 'ArrowRight' && canGoNext) onSelect(activeIndex + 1)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex, canGoNext, canGoPrev, onClose, onSelect])

  useEffect(() => {
    setSwipeOffset(0)
    setIsDragging(false)
  }, [activeIndex])

  if (activeIndex === null || !post) return null

  const triggerLikeBurst = () => {
    setShowLikeBurst(false)
    window.setTimeout(() => setShowLikeBurst(true), 10)
    window.setTimeout(() => setShowLikeBurst(false), 760)
  }

  const commitSwipe = (direction: 'next' | 'prev') => {
    setIsDragging(false)
    setSwipeOffset(direction === 'next' ? -120 : 120)
    window.setTimeout(() => {
      onSelect(direction === 'next' ? activeIndex + 1 : activeIndex - 1)
      setSwipeOffset(0)
    }, 110)
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null
    touchEndX.current = null
    setIsDragging(true)
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const currentX = event.changedTouches[0]?.clientX ?? null
    touchEndX.current = currentX
    if (touchStartX.current !== null && currentX !== null) {
      setSwipeOffset(currentX - touchStartX.current)
    }
  }

  const handleTouchEnd = () => {
    const start = touchStartX.current
    const end = touchEndX.current
    setIsDragging(false)

    if (start === null) return

    const delta = start - (end ?? start)
    if (Math.abs(delta) < 12) {
      const now = Date.now()
      if (now - lastTapTime.current < 280) {
        triggerLikeBurst()
      }
      lastTapTime.current = now
      setSwipeOffset(0)
      return
    }

    if (Math.abs(delta) < 60) {
      setSwipeOffset(0)
      return
    }

    if (delta > 0 && canGoNext) {
      commitSwipe('next')
    } else if (delta < 0 && canGoPrev) {
      commitSwipe('prev')
    } else {
      setSwipeOffset(0)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/95 animate-fade-in">
      <button
        type="button"
        aria-label="Close media viewer"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
          {activeIndex + 1} / {posts.length}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur"
          aria-label="Close"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m6 6 12 12" />
            <path d="m18 6-12 12" />
          </svg>
        </button>
      </div>

      <div className="flex h-full items-center justify-center p-4 sm:p-6">
        <div className="animate-lightbox-open relative flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#050505] shadow-2xl">
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center bg-black"
            onDoubleClick={triggerLikeBurst}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {canGoPrev ? (
              <button
                type="button"
                onClick={() => onSelect(activeIndex - 1)}
                className="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur sm:inline-flex"
                aria-label="Previous post"
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
                className="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur sm:inline-flex"
                aria-label="Next post"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            ) : null}

            <div
              className={`flex h-full w-full items-center justify-center transition-transform duration-300 ease-out ${
                isDragging ? '' : 'snap-center'
              }`}
              style={{
                transform: `translateX(${swipeOffset}px) scale(${isDragging ? 0.985 : 1})`,
              }}
            >
              {post.mediaType === 'VIDEO' ? (
                <video
                  src={post.mediaUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <img
                  src={post.mediaUrl}
                  alt={post.caption?.trim() || 'Kante Elite highlight'}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            {showLikeBurst ? (
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 animate-like-burst text-white">
                <svg className="h-20 w-20 drop-shadow-[0_10px_30px_rgba(245,158,11,0.35)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 0 1 6.5 4C8.24 4 9.91 4.81 11 6.09 12.09 4.81 13.76 4 15.5 4A4.5 4.5 0 0 1 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
                </svg>
              </div>
            ) : null}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-4 pb-5 pt-12 sm:px-6">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                  {post.mediaType}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                  {formatMediaDate(post.createdAt)}
                </span>
              </div>
              <p className="max-w-3xl whitespace-pre-line break-words text-sm leading-relaxed text-white sm:text-base">
                {post.caption?.trim() || 'Training highlight from Kante Elite.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

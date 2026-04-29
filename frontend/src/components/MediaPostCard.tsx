import CategoryBadge from './CategoryBadge'
import MediaAsset from './MediaAsset'
import type { MediaPost } from '../types'
import { formatMediaDate, getMediaAlt, getMediaCaption } from '../utils/media'

interface MediaPostCardProps {
  post: MediaPost
  className?: string
  aspectClassName?: string
  showCaption?: boolean
  showDate?: boolean
  imageLoading?: 'eager' | 'lazy'
  imageFetchPriority?: 'auto' | 'high' | 'low'
}

export default function MediaPostCard({
  post,
  className = '',
  aspectClassName = 'aspect-video',
  showCaption = true,
  showDate = true,
  imageLoading = 'lazy',
  imageFetchPriority = 'auto',
}: MediaPostCardProps) {
  const mediaLabel = post.mediaType === 'VIDEO' ? 'Video' : 'Photo'
  const caption = getMediaCaption(post)

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#222] bg-[#101010] shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 ${className}`}
    >
      <div className={`relative overflow-hidden bg-black ${aspectClassName}`}>
        <MediaAsset
          src={post.mediaUrl}
          type={post.mediaType}
          alt={getMediaAlt(post)}
          loading={imageLoading}
          fetchPriority={imageFetchPriority}
          playbackMode="card"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
            {mediaLabel}
          </span>
          {post.mediaCategory ? <CategoryBadge category={post.mediaCategory} /> : null}
        </div>

        {post.mediaType === 'VIDEO' ? (
          <div className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/65 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
              <svg className="h-3.5 w-3.5 translate-x-[1px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v13.72c0 .78.84 1.26 1.5.86l10.5-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
              </svg>
            </span>
            Tap to watch
          </div>
        ) : null}
      </div>

      {(showCaption || showDate) ? (
        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          {showDate ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                {formatMediaDate(post.createdAt)}
              </p>
              {(post.showOnHome || post.showOnAbout || post.featured) ? (
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-gray-500">
                  {post.featured ? <span>Hero</span> : null}
                  {post.showOnHome ? <span>Home</span> : null}
                  {post.showOnAbout ? <span>About</span> : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {showCaption ? (
            <p className="overflow-hidden whitespace-pre-line break-words text-sm leading-relaxed text-gray-300 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
              {caption}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

import type { MediaPost } from '../types'

interface MediaPostCardProps {
  post: MediaPost
  className?: string
  aspectClassName?: string
  showCaption?: boolean
  showDate?: boolean
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

export default function MediaPostCard({
  post,
  className = '',
  aspectClassName = 'aspect-video',
  showCaption = true,
  showDate = true,
}: MediaPostCardProps) {
  const hasCaption = Boolean(post.caption?.trim())

  return (
    <article className={`overflow-hidden rounded-2xl border border-[#222] bg-[#111] ${className}`}>
      <div className={`relative overflow-hidden bg-black ${aspectClassName}`}>
        {post.mediaType === 'VIDEO' ? (
          <video
            src={post.mediaUrl}
            controls
            playsInline
            preload="metadata"
            muted={false}
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.caption?.trim() || 'Kante Elite highlight'}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}

        <div className="pointer-events-none absolute left-4 top-4">
          <span className="rounded-full border border-white/15 bg-black/65 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
            {post.mediaType}
          </span>
        </div>
      </div>

      {(showCaption || showDate) && (
        <div className="space-y-3 p-4">
          {showDate ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
              {formatMediaDate(post.createdAt)}
            </p>
          ) : null}
          {showCaption ? (
            <p className="whitespace-pre-line break-words text-sm leading-relaxed text-gray-300 overflow-hidden">
              {hasCaption ? post.caption : 'Training highlight from Kante Elite.'}
            </p>
          ) : null}
        </div>
      )}
    </article>
  )
}

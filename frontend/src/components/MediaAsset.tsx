import type { MediaType } from '../types'

type MediaPlaybackMode = 'card' | 'hero' | 'immersive'

interface MediaAssetProps {
  src: string
  type: MediaType
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'auto' | 'high' | 'low'
  playbackMode?: MediaPlaybackMode
}

export default function MediaAsset({
  src,
  type,
  alt,
  className = '',
  loading = 'eager',
  fetchPriority = 'auto',
  playbackMode = 'card',
}: MediaAssetProps) {
  if (type === 'VIDEO') {
    const heroVideo = playbackMode === 'hero'
    const immersiveVideo = playbackMode === 'immersive'
    const videoPreload = heroVideo ? 'auto' : immersiveVideo ? 'metadata' : 'metadata'

    return (
      <video
        src={src}
        aria-label={alt}
        autoPlay={heroVideo}
        controls={immersiveVideo}
        disablePictureInPicture={!immersiveVideo}
        loop={heroVideo}
        muted={heroVideo || !immersiveVideo}
        playsInline
        preload={videoPreload}
        controlsList={immersiveVideo ? 'nodownload noplaybackrate' : undefined}
        className={className}
      />
    )
  }

  const imagePriorityProps =
    fetchPriority && fetchPriority !== 'auto'
      ? ({ fetchpriority: fetchPriority } as { fetchpriority: 'high' | 'low' })
      : {}

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      {...imagePriorityProps}
      className={className}
    />
  )
}

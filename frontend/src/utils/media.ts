import type { MediaPlacementKey, MediaPost } from '../types'

export type MediaSortSurface = 'feed' | MediaPlacementKey

export const MEDIA_PLACEMENT_LABELS: Record<MediaPlacementKey, string> = {
  HOME_HERO: 'Homepage hero',
  HOME_FEATURED: 'Homepage feature',
  HOME_GALLERY: 'Homepage highlights',
  TRAINING_HERO: 'Training page hero',
  EVENTS_HERO: 'Events page hero',
  TOURNAMENTS_HERO: 'Tournaments page hero',
  RESULTS_HERO: 'Results page hero',
  FAQ_HERO: 'FAQ page hero',
  CONTACT_HERO: 'Contact page hero',
  ABOUT_HERO: 'About hero',
  ABOUT_PROFILE: 'Coach profile',
  ABOUT_GALLERY: 'About gallery',
  MEDIA_PAGE: 'Media page',
  MEDIA_LIBRARY: 'Admin library',
}

export const MEDIA_PLACEMENT_OPTIONS = Object.entries(MEDIA_PLACEMENT_LABELS)
  .filter(([value]) => value !== 'MEDIA_LIBRARY')
  .map(([value, label]) => ({
    value: value as MediaPlacementKey,
    label,
  }))

export function getPlacement(post: MediaPost, key: MediaPlacementKey) {
  return post.placements?.find((placement) => placement.key === key)
}

export function hasPlacement(post: MediaPost, key: MediaPlacementKey) {
  return Boolean(getPlacement(post, key))
}

export function getPostsByPlacement(posts: MediaPost[], key: MediaPlacementKey) {
  return sortMediaPosts(posts.filter((post) => hasPlacement(post, key)), key)
}

function getMediaOrder(post: MediaPost, surface: MediaSortSurface) {
  if (surface !== 'feed') {
    const placementOrder = getPlacement(post, surface)?.displayOrder
    if (placementOrder !== undefined) return placementOrder
  }
  return 0
}

function getCreatedAtTimestamp(post: MediaPost) {
  const timestamp = new Date(post.createdAt).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export function sortMediaPosts(posts: MediaPost[], surface: MediaSortSurface = 'feed') {
  return [...posts].sort((left, right) => {
    const leftOrder = getMediaOrder(left, surface)
    const rightOrder = getMediaOrder(right, surface)
    const leftHasManualOrder = leftOrder > 0
    const rightHasManualOrder = rightOrder > 0

    if (leftHasManualOrder !== rightHasManualOrder) {
      return Number(rightHasManualOrder) - Number(leftHasManualOrder)
    }

    if (leftHasManualOrder && rightHasManualOrder && leftOrder !== rightOrder) {
      return leftOrder - rightOrder
    }

    return getCreatedAtTimestamp(right) - getCreatedAtTimestamp(left)
  })
}

export function formatMediaDate(value: string) {
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

export function getMediaAlt(post: Pick<MediaPost, 'altText' | 'caption' | 'mediaType'>, fallback?: string) {
  const defaultAlt = fallback ?? (post.mediaType === 'VIDEO' ? 'Kante Elite video highlight' : 'Kante Elite photo highlight')
  return post.altText?.trim() || post.caption?.trim() || defaultAlt
}

export function getMediaCaption(post: Pick<MediaPost, 'caption' | 'mediaType'>, fallback?: string) {
  const defaultCaption = fallback ?? (post.mediaType === 'VIDEO' ? 'Training video highlight from Kante Elite.' : 'Training highlight from Kante Elite.')
  return post.caption?.trim() || defaultCaption
}

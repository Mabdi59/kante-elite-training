import type { MediaPost } from '../types'

export type MediaSurface = 'feed' | 'home' | 'about'

function getMediaOrder(post: MediaPost, surface: MediaSurface) {
  if (surface === 'home') return post.homeDisplayOrder ?? 0
  if (surface === 'about') return post.aboutDisplayOrder ?? 0
  return post.displayOrder ?? 0
}

function getCreatedAtTimestamp(post: MediaPost) {
  const timestamp = new Date(post.createdAt).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export function sortMediaPosts(posts: MediaPost[], surface: MediaSurface = 'feed') {
  return [...posts].sort((left, right) => {
    if (left.featured !== right.featured) {
      return Number(right.featured) - Number(left.featured)
    }

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

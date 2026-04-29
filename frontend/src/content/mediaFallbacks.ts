import type { MediaCategory, MediaPost, MediaType } from '../types'

type StaticMediaSurface = {
  id: number
  mediaUrl: string
  mediaType: MediaType
  altText: string
  caption: string
  mediaCategory?: MediaCategory
}

function toFallbackPost(entry: StaticMediaSurface, index: number): MediaPost {
  return {
    id: entry.id || -(index + 1),
    mediaUrl: entry.mediaUrl,
    mediaType: entry.mediaType,
    caption: entry.caption,
    altText: entry.altText,
    featured: false,
    showOnHome: false,
    showOnAbout: false,
    mediaCategory: entry.mediaCategory,
    displayOrder: 0,
    homeDisplayOrder: 0,
    aboutDisplayOrder: 0,
    createdAt: `2024-01-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
  }
}

const aboutFallbackEntries: StaticMediaSurface[] = [
  {
    id: -1,
    mediaUrl: '/images/Coach.png',
    mediaType: 'IMAGE',
    altText: 'Coach Mohamed Sheik Kante portrait',
    caption: 'Coach Kante, founder and head coach of Kante Elite Training.',
    mediaCategory: 'TRAINING_PHOTO',
  },
  {
    id: -2,
    mediaUrl: '/images/D26A0694.jpeg',
    mediaType: 'IMAGE',
    altText: 'Coach Kante on the field during a training session',
    caption: 'Coach Kante on the field working with players.',
    mediaCategory: 'TRAINING_PHOTO',
  },
  {
    id: -3,
    mediaUrl: '/images/D26A0746.jpeg',
    mediaType: 'IMAGE',
    altText: 'Coach Kante leading technical training',
    caption: 'Technical training with close attention to detail and repetition.',
    mediaCategory: 'TRAINING_PHOTO',
  },
  {
    id: -4,
    mediaUrl: '/images/IMG_3599.jpeg',
    mediaType: 'IMAGE',
    altText: 'Coach Kante working with a player during training',
    caption: 'A closer look at the standards and detail behind each session.',
    mediaCategory: 'TRAINING_PHOTO',
  },
]

const mediaFallbackEntries: StaticMediaSurface[] = [
  ...aboutFallbackEntries,
  {
    id: -5,
    mediaUrl: '/images/training-1.mp4',
    mediaType: 'VIDEO',
    altText: 'Training clip showing players in a Kante Elite session',
    caption: 'Live training footage from a Kante Elite session.',
    mediaCategory: 'SKILL_CLIP',
  },
  {
    id: -6,
    mediaUrl: '/images/training-2.mp4',
    mediaType: 'VIDEO',
    altText: 'Training video focused on ball work and movement',
    caption: 'Ball work, movement, and repetition during training.',
    mediaCategory: 'SKILL_CLIP',
  },
  {
    id: -7,
    mediaUrl: '/images/training-3.mp4',
    mediaType: 'VIDEO',
    altText: 'Player development clip from Kante Elite training',
    caption: 'Player development clip from a live session.',
    mediaCategory: 'SKILL_CLIP',
  },
  {
    id: -8,
    mediaUrl: '/images/training-4.mp4',
    mediaType: 'VIDEO',
    altText: 'Kante Elite training highlight clip',
    caption: 'Session highlight showing intensity and repetition.',
    mediaCategory: 'SKILL_CLIP',
  },
  {
    id: -9,
    mediaUrl: '/images/training-5.mp4',
    mediaType: 'VIDEO',
    altText: 'Training highlight video from a Kante Elite workout',
    caption: 'Training highlight from Kante Elite.',
    mediaCategory: 'SKILL_CLIP',
  },
]

export const ABOUT_FALLBACK_MEDIA = aboutFallbackEntries.map(toFallbackPost)
export const MEDIA_FALLBACK_POSTS = mediaFallbackEntries.map(toFallbackPost)

export const COACH_SPOTLIGHT_MEDIA = toFallbackPost(
  {
    id: -10,
    mediaUrl: '/images/IMG_3599.jpeg',
    mediaType: 'IMAGE',
    altText: 'Coach Kante working with players during a session',
    caption: 'Focused coaching, clear standards, and training built for real match habits.',
    mediaCategory: 'TRAINING_PHOTO',
  },
  9,
)

export const COACH_PROFILE_MEDIA = toFallbackPost(
  {
    id: -11,
    mediaUrl: '/images/Coach.png',
    mediaType: 'IMAGE',
    altText: 'Coach Mohamed Sheik Kante headshot',
    caption: 'Coach Mohamed Sheik Kante, founder of Kante Elite Training.',
    mediaCategory: 'TRAINING_PHOTO',
  },
  10,
)

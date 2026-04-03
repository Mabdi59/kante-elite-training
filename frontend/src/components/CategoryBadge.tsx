import type { MediaCategory } from '../types'

const CATEGORY_CONFIG: Record<
  MediaCategory,
  { label: string; colorClass: string }
> = {
  TRAINING_PHOTO: {
    label: 'Training Photos',
    colorClass: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  },
  MATCH_HIGHLIGHT: {
    label: 'Match Highlights',
    colorClass: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
  SKILL_CLIP: {
    label: 'Skill Clips',
    colorClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  },
  TESTIMONIAL: {
    label: 'Testimonials',
    colorClass: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  },
}

export const CATEGORY_OPTIONS: { value: MediaCategory; label: string }[] = (
  Object.entries(CATEGORY_CONFIG) as [MediaCategory, { label: string; colorClass: string }][]
).map(([value, config]) => ({ value, label: config.label }))

interface CategoryBadgeProps {
  category?: MediaCategory | null
  size?: 'sm' | 'xs'
  className?: string
}

export function getCategoryLabel(category: MediaCategory): string {
  return CATEGORY_CONFIG[category]?.label ?? category
}

export default function CategoryBadge({
  category,
  size = 'xs',
  className = '',
}: CategoryBadgeProps) {
  if (!category) return null

  const config = CATEGORY_CONFIG[category]
  if (!config) return null

  const sizeClass =
    size === 'sm'
      ? 'px-3 py-1 text-xs font-semibold'
      : 'px-2.5 py-0.5 text-[10px] font-bold'

  return (
    <span
      className={`inline-flex items-center rounded-full border uppercase tracking-[0.18em] ${sizeClass} ${config.colorClass} ${className}`}
    >
      {config.label}
    </span>
  )
}

import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from '../constants/brand'

type BrandMarkSize = 'nav' | 'footer' | 'portal' | 'auth' | 'compact'

interface BrandMarkProps {
  size?: BrandMarkSize
  showText?: boolean
  label?: string
  className?: string
  textClassName?: string
  imageClassName?: string
}

const imageSizes: Record<BrandMarkSize, string> = {
  nav: 'h-10 w-10',
  footer: 'h-11 w-11',
  portal: 'h-9 w-9',
  auth: 'h-20 w-20',
  compact: 'h-8 w-8',
}

const textSizes: Record<BrandMarkSize, string> = {
  nav: 'text-sm sm:text-base md:text-lg',
  footer: 'text-lg',
  portal: 'text-sm',
  auth: 'text-2xl',
  compact: 'text-sm',
}

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function BrandMark({
  size = 'nav',
  showText = false,
  label = 'Training',
  className,
  textClassName,
  imageClassName,
}: BrandMarkProps) {
  return (
    <span className={joinClasses('inline-flex min-w-0 items-center gap-3', size === 'auth' && 'flex-col gap-3', className)}>
      <span
        className={joinClasses(
          'inline-flex shrink-0 items-center justify-center rounded-full bg-white p-0.5 ring-1 ring-white/20',
          'shadow-[0_0_0_1px_rgba(0,0,0,0.35)]',
          imageSizes[size],
          imageClassName,
        )}
      >
        <img
          src={BRAND_LOGO_SRC}
          alt={BRAND_LOGO_ALT}
          loading="eager"
          decoding="async"
          width="759"
          height="759"
          className="h-full w-full rounded-full object-contain"
        />
      </span>
      {showText ? (
        <span className={joinClasses('min-w-0', size === 'auth' && 'text-center', textClassName)}>
          <span className={joinClasses('block font-black leading-none text-white', textSizes[size])}>
            KANTE ELITE
          </span>
          <span className="mt-1 block text-[10px] font-bold uppercase leading-none text-amber-500">
            {label}
          </span>
        </span>
      ) : null}
    </span>
  )
}

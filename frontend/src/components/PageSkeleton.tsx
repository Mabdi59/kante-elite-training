interface PageSkeletonProps {
  titleWidthClassName?: string
  count?: number
}

export default function PageSkeleton({
  titleWidthClassName = 'w-52',
  count = 3,
}: PageSkeletonProps) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-3 rounded-2xl border border-gray-900 bg-gray-950/80 px-4 py-5 sm:px-6">
        <div className={`skeleton h-9 ${titleWidthClassName}`} />
        <div className="skeleton h-4 w-full max-w-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">
            <div className="skeleton mb-4 aspect-video w-full rounded-xl" />
            <div className="space-y-3">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-6 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

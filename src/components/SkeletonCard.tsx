interface Props {
  lines?: number
  avatar?: boolean
}

export default function SkeletonCard({ lines = 2, avatar = false }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        {avatar && (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2.5">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <div
              key={i}
              className={`h-3 bg-gray-200 dark:bg-gray-700 rounded-full ${i === lines - 2 ? 'w-1/2' : 'w-full'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

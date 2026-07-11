import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'shimmer',
        variant === 'circular'    && 'rounded-full',
        variant === 'text'        && 'rounded h-4',
        variant === 'rectangular' && 'rounded-xl',
        className,
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <Skeleton className="h-5 w-1/3" variant="text" />
      <Skeleton className="h-28 w-full" />
      <div className="flex gap-3">
        <Skeleton className="h-3 w-1/4" variant="text" />
        <Skeleton className="h-3 w-1/4" variant="text" />
      </div>
    </div>
  )
}

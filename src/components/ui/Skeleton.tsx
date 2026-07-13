import { cn } from '@/lib/utils'

interface SkeletonProps { className?: string; variant?: 'text' | 'circular' | 'rectangular' }

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  return (
    <div className={cn('shimmer',
      variant === 'circular'    && 'rounded-full',
      variant === 'text'        && 'rounded-lg h-4',
      variant === 'rectangular' && 'rounded-xl',
      className,
    )} />
  )
}

export function SkeletonCard() {
  return (
    <div className="premium-card p-5 space-y-4">
      <Skeleton className="h-5 w-2/5" variant="text" />
      <Skeleton className="h-24 w-full" />
      <div className="flex gap-3">
        <Skeleton className="h-3 w-1/4" variant="text" />
        <Skeleton className="h-3 w-1/5" variant="text" />
      </div>
    </div>
  )
}

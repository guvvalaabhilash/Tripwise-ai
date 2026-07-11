import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean
  highlighted?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const paddingMap = { sm: 'p-6', md: 'p-8', lg: 'p-10' }

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, bordered = false, highlighted = false, padding = 'md', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-transparent',
        'rounded-none',
        'border-none',
        'shadow-none',
        'transition-colors duration-150',
        bordered && 'border border-[var(--color-border)]',
        highlighted && 'border-2 border-[var(--color-accent)]',
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {highlighted && (
        <div className="absolute top-0 left-0 h-1 w-16 bg-[var(--color-accent)]" />
      )}
      {children}
    </div>
  ))
Card.displayName = 'Card'

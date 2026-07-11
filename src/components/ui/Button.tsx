import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: 'relative inline-flex items-center justify-center font-semibold uppercase tracking-wider text-[var(--color-accent)] bg-transparent border-0 px-0 gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  secondary: 'relative inline-flex items-center justify-center font-semibold uppercase tracking-wider text-[var(--color-foreground)] border border-[var(--color-foreground)] bg-transparent px-6 gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  ghost: 'relative inline-flex items-center justify-center font-medium text-[var(--color-muted-foreground)] border-0 bg-transparent px-4 gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
}

const sizes = {
  sm: 'py-2 text-sm gap-2',
  md: 'py-3 text-base gap-2.5',
  lg: 'py-4 text-lg gap-3',
}

const hoverStyles = {
  primary: 'hover:translate-y-px active:translate-y-0.5',
  secondary: 'hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] hover:translate-y-px active:translate-y-0.5',
  ghost: 'hover:text-[var(--color-foreground)]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const off = disabled || loading
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium cursor-pointer transition-all duration-150',
          variants[variant],
          sizes[size],
          hoverStyles[variant],
          off && 'pointer-events-none opacity-50',
          className
        )}
        disabled={off}
        {...props}
      >
        {variant === 'primary' && (
          <span className="absolute bottom-0 left-0 h-0.5 bg-[var(--color-accent)] transition-transform duration-150 origin-left scale-x-100 group-hover:scale-x-110" />
        )}
        {variant === 'ghost' && (
          <span className="absolute bottom-0 left-0 h-px bg-[var(--color-foreground)] transition-transform duration-150 origin-left scale-x-0 group-hover:scale-x-100" />
        )}
        {loading && (
          <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  })
Button.displayName = 'Button'

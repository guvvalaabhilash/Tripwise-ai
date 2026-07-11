import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, disabled, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-[11px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--color-foreground)] transition-colors duration-150 z-10 pointer-events-none">
            {icon}
          </div>
        )}
        <input ref={ref}
          disabled={disabled}
          className={cn(
            'w-full rounded-none px-4 py-3 text-base text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]',
            'bg-[var(--color-input)]',
            'border border-[var(--color-border)]',
            'focus:outline-none focus:border-[var(--color-accent)]',
            'transition-colors duration-150',
            '[color-scheme:dark]',
            icon && 'pl-12',
            error && 'border-[var(--color-accent)]',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )} {...props} />
      </div>
      {error && <p className="text-[11px] text-[var(--color-accent)]">{error}</p>}
    </div>
  ))
Input.displayName = 'Input'

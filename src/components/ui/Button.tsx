import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: [
    'inline-flex items-center justify-center gap-2 font-semibold text-white cursor-pointer',
    'bg-gradient-to-r from-[#4F7CFF] to-[#6A5CFF]',
    'border border-white/10 rounded-xl',
    'shadow-[0_4px_16px_rgba(79,124,255,0.35)]',
    'hover:shadow-[0_8px_24px_rgba(79,124,255,0.5)] hover:-translate-y-0.5',
    'active:translate-y-0 active:shadow-[0_4px_12px_rgba(79,124,255,0.3)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]/50',
    'disabled:pointer-events-none disabled:opacity-50',
    'transition-all duration-200 whitespace-nowrap',
  ].join(' '),

  secondary: [
    'inline-flex items-center justify-center gap-2 font-medium text-[#AEB7C6] cursor-pointer',
    'bg-white/5 border border-white/10 rounded-xl',
    'hover:text-white hover:bg-white/8 hover:border-white/18',
    'active:bg-white/6',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
    'disabled:pointer-events-none disabled:opacity-50',
    'transition-all duration-200 whitespace-nowrap',
  ].join(' '),

  ghost: [
    'inline-flex items-center justify-center gap-2 font-medium text-[#AEB7C6] cursor-pointer',
    'bg-transparent border border-transparent rounded-xl',
    'hover:text-white hover:bg-white/6 hover:border-white/8',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
    'disabled:pointer-events-none disabled:opacity-50',
    'transition-all duration-200 whitespace-nowrap',
  ].join(' '),

  danger: [
    'inline-flex items-center justify-center gap-2 font-semibold text-[#FF4D6D] cursor-pointer',
    'bg-[#FF4D6D]/8 border border-[#FF4D6D]/25 rounded-xl',
    'hover:bg-[#FF4D6D]/16 hover:border-[#FF4D6D]/4 hover:text-white',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D6D]/50',
    'disabled:pointer-events-none disabled:opacity-50',
    'transition-all duration-200 whitespace-nowrap',
  ].join(' '),
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const off = disabled || loading
    return (
      <button
        ref={ref}
        className={cn(variants[variant], sizes[size], off && 'pointer-events-none opacity-50', className)}
        disabled={off}
        {...props}
      >
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

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, disabled, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-[#AEB7C6] uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AEB7C6] group-focus-within:text-[#4F7CFF] transition-colors duration-150 z-10 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full bg-white/4 border border-white/10 rounded-xl',
            'px-4 py-2.5 text-sm text-white placeholder:text-[#AEB7C6]/50',
            'outline-none transition-all duration-200 [color-scheme:dark]',
            'focus:border-[#4F7CFF]/50 focus:bg-[#4F7CFF]/6 focus:shadow-[0_0_0_3px_rgba(79,124,255,0.12)]',
            icon && 'pl-10',
            error && 'border-[#FF4D6D]/50 focus:border-[#FF4D6D]/60',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-[#FF4D6D] flex items-center gap-1">{error}</p>
      )}
    </div>
  ))
Input.displayName = 'Input'

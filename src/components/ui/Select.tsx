import { cn } from '@/lib/utils'

interface SelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
}

export function Select({ label, value, onChange, options, className }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-medium text-[#6F7D9E] uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn(
          'w-full rounded-xl px-4 py-2.5 text-sm text-[#F8FAFC]',
          'bg-[rgba(14,18,38,0.65)] backdrop-blur-sm',
          'border border-[#4F7BFF]/15',
          'focus:outline-none focus:border-[#4F7BFF]/50 focus:ring-2 focus:ring-[#4F7BFF]/15',
          'focus:shadow-[0_0_15px_rgba(0,229,255,0.12)]',
          'appearance-none cursor-pointer transition-all duration-200',
          className,
        )}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#0B1023] text-[#F8FAFC]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

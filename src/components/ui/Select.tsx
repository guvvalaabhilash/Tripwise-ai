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
        <label className="block text-xs font-semibold text-[#AEB7C6] uppercase tracking-wider">{label}</label>
      )}
      <select value={value} onChange={e => onChange(e.target.value)}
        className={cn(
          'w-full bg-white/4 border border-white/10 rounded-xl',
          'px-4 py-2.5 text-sm text-white',
          'outline-none appearance-none cursor-pointer',
          'focus:border-[#4F7CFF]/50 focus:bg-[#4F7CFF]/5 focus:shadow-[0_0_0_3px_rgba(79,124,255,0.1)]',
          'transition-all duration-200',
          className,
        )}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#0B1020] text-white">{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

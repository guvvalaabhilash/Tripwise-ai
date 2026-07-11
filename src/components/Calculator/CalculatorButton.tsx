import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type BtnVariant = 'number' | 'operator' | 'action' | 'equals' | 'memory' | 'scientific'

interface CalcButtonProps {
  label: string
  onClick: () => void
  variant?: BtnVariant
  wide?: boolean
  disabled?: boolean
  'aria-label'?: string
}

const variantStyles: Record<BtnVariant, string> = {
  number:     'bg-white/8 hover:bg-white/14 text-white border border-white/6',
  operator:   'bg-royal/20 hover:bg-royal/35 text-royal border border-royal/20',
  action:     'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/6',
  equals:     'bg-linear-to-br from-royal to-royal-light hover:brightness-110 text-white border border-royal/30 shadow-lg shadow-royal/20',
  memory:     'bg-purple-500/15 hover:bg-purple-500/28 text-purple-300 border border-purple-500/20',
  scientific: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/15 text-xs',
}

export function CalcButton({
  label, onClick, variant = 'number', wide = false, disabled = false, 'aria-label': ariaLabel,
}: CalcButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.91 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || label}
      className={cn(
        'relative rounded-xl font-medium text-sm transition-colors duration-150 cursor-pointer',
        'flex items-center justify-center overflow-hidden',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal',
        'h-12 lg:h-14',
        wide ? 'col-span-2' : '',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
        variantStyles[variant],
      )}
    >
      {/* Shine on hover */}
      <span
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
        style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 60%)' }}
      />
      {label}
    </motion.button>
  )
}

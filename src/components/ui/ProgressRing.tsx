import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}

export function ProgressRing({
  value, max = 100, size = 120, strokeWidth = 8, label, className,
}: ProgressRingProps) {
  const pct          = Math.min((value / max) * 100, 100)
  const radius       = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset       = circumference - (pct / 100) * circumference

  const color =
    pct > 90 ? '#FF4D6D' :
    pct > 70 ? '#FFB547' :
    pct > 40 ? '#00C2FF' : '#19F28C'

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
          {/* Progress */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: `drop-shadow(0 0 5px ${color}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold"
            style={{ color, textShadow: `0 0 8px ${color}55` }}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      {label && (
        <span className="text-[10px] text-[#AEB7C6] uppercase tracking-widest font-medium">{label}</span>
      )}
    </div>
  )
}

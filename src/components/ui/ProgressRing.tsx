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

  // Color shifts from emerald → cyan → orange → red as budget fills
  const color =
    pct > 90 ? '#FF4D6D' :
    pct > 70 ? '#FFB547' :
    pct > 40 ? '#00E5FF' : '#19F28C'

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Track */}
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(79,123,255,0.1)" strokeWidth={strokeWidth} />
          {/* Progress */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: `drop-shadow(0 0 6px ${color}99)` }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold" style={{ color, textShadow: `0 0 8px ${color}66` }}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      {label && <span className="text-[11px] text-[#6F7D9E] uppercase tracking-wide">{label}</span>}
    </div>
  )
}

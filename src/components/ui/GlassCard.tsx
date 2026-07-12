import { useRef, useCallback, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: ReactNode
  hover?: boolean
  glow?: 'royal' | 'cyan' | 'purple' | 'none'
  padding?: 'sm' | 'md' | 'lg' | 'none'
  tilt?: boolean          // 3D mouse-reactive tilt
  sweep?: boolean         // periodic light sweep
  animated?: boolean      // animated border on
}

const paddingMap = { sm: 'p-4', md: 'p-6', lg: 'p-8', none: '' }

const glowMap = {
  royal:  'shadow-[0_0_20px_rgba(79,123,255,0.25),0_0_60px_rgba(79,123,255,0.1)]',
  cyan:   'shadow-[0_0_20px_rgba(0,229,255,0.25),0_0_60px_rgba(0,229,255,0.1)]',
  purple: 'shadow-[0_0_20px_rgba(123,97,255,0.25),0_0_60px_rgba(123,97,255,0.1)]',
  none:   '',
}

export function GlassCard({
  className, children, hover = false, glow = 'none',
  padding = 'md', tilt = false, sweep = false, animated = false, style, ...props
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // 3D tilt values
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 20 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!tilt || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5)
  }, [tilt, mouseX, mouseY])

  const handleMouseLeave = useCallback(() => {
    if (!tilt) return
    mouseX.set(0); mouseY.set(0)
  }, [tilt, mouseX, mouseY])

  const tiltStyle = tilt ? { rotateX, rotateY, transformStyle: 'preserve-3d' as const } : {}

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={hover ? {
        y: -8, scale: 1.015,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      } : undefined}
      style={{ ...tiltStyle, ...style }}
      className={cn(
        'premium-card light-sweep-card',
        animated && 'animated-border animated-border-on',
        hover && 'cursor-pointer',
        glowMap[glow],
        paddingMap[padding],
        className,
      )}
      {...props}
    >
      {/* Periodic light sweep beam */}
      {sweep && <div className="sweep-beam pointer-events-none" aria-hidden />}

      {/* Content sits above pseudo-elements */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

export default GlassCard

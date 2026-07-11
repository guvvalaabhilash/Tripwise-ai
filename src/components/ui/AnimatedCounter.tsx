import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  className,
}: AnimatedCounterProps) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 })
  const display = useTransform(spring, (v) => {
    const rounded = Math.round(v)
    if (rounded >= 1000) return `${prefix}${(rounded / 1000).toFixed(rounded % 1000 === 0 ? 0 : 1)}k${suffix}`
    return `${prefix}${rounded}${suffix}`
  })
  const [text, setText] = useState(`${prefix}0${suffix}`)

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  useEffect(() => {
    return display.on('change', (v) => setText(v))
  }, [display])

  return <motion.span className={className}>{text}</motion.span>
}

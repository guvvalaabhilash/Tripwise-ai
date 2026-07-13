import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

type GlassButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children?: React.ReactNode
    size?: 'sm' | 'md' | 'lg'
  }

export const GlassButton: React.FC<GlassButtonProps> = ({ children, size = 'md', className = '', ...rest }) => {
  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold text-white cursor-pointer',
        'bg-gradient-to-r from-[#4F7CFF] to-[#6A5CFF]',
        'border border-white/10',
        'shadow-[0_4px_16px_rgba(79,124,255,0.35)]',
        'hover:shadow-[0_8px_24px_rgba(79,124,255,0.5)]',
        'transition-shadow duration-200',
        sizes[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

export default GlassButton

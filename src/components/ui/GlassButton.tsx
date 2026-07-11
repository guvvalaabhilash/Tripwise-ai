import React from 'react'
import { motion } from 'framer-motion'

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export const GlassButton: React.FC<GlassButtonProps> = ({ children, size = 'md', className = '', ...rest }) => {
  const sizes: Record<string, string> = {
    sm: 'px-3 py-2 text-sm rounded-xl',
    md: 'px-4 py-2.5 text-sm rounded-[18px]',
    lg: 'px-5 py-3 text-base rounded-[18px]'
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 600, damping: 22 }}
      className={`glass-strong gradient-text-animated pulse-glow inline-flex items-center gap-2 justify-center ${sizes[size]} ${className}`}
      {...rest}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

export default GlassButton

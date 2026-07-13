import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}
const sizeMap = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn('relative w-full rounded-2xl p-6', sizeMap[size])}
            style={{
              background: 'rgba(8,12,28,0.97)',
              backdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,124,255,0.08)',
            }}>
            {/* Top accent */}
            <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(79,124,255,0.5),rgba(0,194,255,0.3),transparent)' }} />

            {title && (
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white font-[family-name:var(--font-jakarta)]">{title}</h2>
                <button onClick={onClose}
                  className="p-1.5 rounded-lg text-[#AEB7C6] hover:text-white hover:bg-white/8 transition-all cursor-pointer">
                  <X size={15} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

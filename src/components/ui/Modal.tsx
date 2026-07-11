import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean; onClose: () => void; title?: string; children: React.ReactNode; size?: 'sm'|'md'|'lg'
}
const sizeMap = { sm:'max-w-md', md:'max-w-lg', lg:'max-w-2xl' }

export function Modal({ isOpen, onClose, title, children, size='md' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-lg" onClick={onClose} />
          <motion.div
            initial={{ opacity:0, scale:0.93, y:28 }}
            animate={{ opacity:1, scale:1, y:0 }}
            exit={{ opacity:0, scale:0.93, y:28 }}
            transition={{ type:'spring', damping:28, stiffness:320 }}
            className={cn('relative w-full rounded-2xl p-6 shadow-2xl', sizeMap[size])}
            style={{ background:'rgba(8,12,32,0.94)', backdropFilter:'blur(32px)',
              border:'1px solid rgba(79,123,255,0.18)',
              boxShadow:'0 0 0 1px rgba(79,123,255,0.1), 0 0 40px rgba(79,123,255,0.15), 0 40px 80px rgba(0,0,0,0.6)' }}>
            {/* Top accent */}
            <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
              style={{ background:'linear-gradient(90deg,transparent,rgba(79,123,255,0.6),rgba(0,229,255,0.4),transparent)' }} />
            {title && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-[#F0F4FF] font-[family-name:var(--font-jakarta)]">{title}</h2>
                <button onClick={onClose}
                  className="p-1.5 rounded-lg text-[#6F7D9E] hover:text-white hover:bg-[#4F7BFF]/15 transition-all cursor-pointer">
                  <X size={16} />
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

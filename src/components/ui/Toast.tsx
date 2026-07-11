import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
}

const config = {
  success: { icon: CheckCircle, color: '#19F28C', bg: 'rgba(25,242,140,0.08)', border: 'rgba(25,242,140,0.25)', shadow: 'rgba(25,242,140,0.2)' },
  error:   { icon: AlertCircle, color: '#FF4D6D', bg: 'rgba(255,77,109,0.08)',  border: 'rgba(255,77,109,0.25)',  shadow: 'rgba(255,77,109,0.2)'  },
  info:    { icon: Info,        color: '#00E5FF', bg: 'rgba(0,229,255,0.08)',   border: 'rgba(0,229,255,0.25)',   shadow: 'rgba(0,229,255,0.2)'   },
}

export function Toast({ message, type = 'info', isVisible, onClose }: ToastProps) {
  const { icon: Icon, color, bg, border, shadow } = config[type]
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl backdrop-blur-xl"
            style={{ background: bg, border: `1px solid ${border}`,
              boxShadow: `0 0 20px ${shadow}, 0 8px 32px rgba(0,0,0,0.4)` }}>
            {/* Top accent */}
            <div className="absolute inset-x-0 top-0 h-px rounded-t-xl"
              style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />
            <Icon size={16} style={{ color, filter: `drop-shadow(0 0 6px ${color})` }} />
            <span className="text-sm text-[#F8FAFC]">{message}</span>
            <button onClick={onClose} className="text-[#6F7D9E] hover:text-white transition-colors cursor-pointer ml-1">
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

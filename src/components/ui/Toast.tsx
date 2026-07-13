import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

interface ToastProps {
  message: string; type?: 'success' | 'error' | 'info'; isVisible: boolean; onClose: () => void
}

const cfg = {
  success: { Icon: CheckCircle, color: '#19F28C', bg: 'rgba(25,242,140,0.07)',   border: 'rgba(25,242,140,0.22)'  },
  error:   { Icon: AlertCircle, color: '#FF4D6D', bg: 'rgba(255,77,109,0.07)',   border: 'rgba(255,77,109,0.22)'  },
  info:    { Icon: Info,        color: '#00C2FF', bg: 'rgba(0,194,255,0.07)',    border: 'rgba(0,194,255,0.22)'   },
}

export function Toast({ message, type = 'info', isVisible, onClose }: ToastProps) {
  const { Icon, color, bg, border } = cfg[type]
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 56, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 56, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="relative flex items-center gap-3 px-5 py-3 rounded-xl backdrop-blur-xl overflow-hidden"
            style={{ background: bg, border: `1px solid ${border}`,
              boxShadow: `0 0 20px ${color}20, 0 8px 32px rgba(0,0,0,0.4)` }}>
            <div className="absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />
            <Icon size={15} style={{ color, filter: `drop-shadow(0 0 5px ${color})` }} />
            <span className="text-sm text-white">{message}</span>
            <button onClick={onClose}
              className="text-[#AEB7C6] hover:text-white transition-colors cursor-pointer ml-1">
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

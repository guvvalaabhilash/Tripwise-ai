import { motion } from 'framer-motion'
import { Receipt, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types'

const typeConfig = {
  expense: { icon: Receipt,       color: '#4F7CFF', bg: 'rgba(79,124,255,0.1)'  },
  warning: { icon: AlertTriangle, color: '#FFB547', bg: 'rgba(255,181,71,0.1)'  },
  info:    { icon: Info,          color: '#00C2FF', bg: 'rgba(0,194,255,0.1)'   },
  success: { icon: CheckCircle,   color: '#19F28C', bg: 'rgba(25,242,140,0.1)'  },
}

interface NotificationCardProps {
  notification: Notification
  onClick?: () => void
}

export function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const { icon: Icon, color, bg } = typeConfig[notification.type]

  return (
    <motion.div
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
      onClick={onClick}
      className={cn('flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150')}
      style={{
        background: notification.read ? 'rgba(255,255,255,0.02)' : 'rgba(79,124,255,0.04)',
        border: `1px solid ${notification.read ? 'rgba(255,255,255,0.06)' : 'rgba(79,124,255,0.12)'}`,
      }}
    >
      {/* Unread left bar */}
      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      )}

      <div className="p-2 rounded-lg shrink-0 flex items-center justify-center" style={{ background: bg }}>
        <Icon size={13} style={{ color, filter: `drop-shadow(0 0 3px ${color}80)` }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold text-white truncate">{notification.title}</h4>
          {!notification.read && (
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
          )}
        </div>
        <p className="text-[11px] text-[#AEB7C6] mt-0.5 leading-relaxed">{notification.message}</p>
        <span className="text-[10px] text-[#6B7A93] mt-1 block">{notification.time}</span>
      </div>
    </motion.div>
  )
}

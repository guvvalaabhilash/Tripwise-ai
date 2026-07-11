import { motion } from 'framer-motion'
import { Receipt, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types'

const typeConfig = {
  expense: { icon: Receipt,       color: '#4F7BFF', bg: 'rgba(79,123,255,0.12)'  },
  warning: { icon: AlertTriangle, color: '#FFB547', bg: 'rgba(255,181,71,0.12)'  },
  info:    { icon: Info,          color: '#00E5FF', bg: 'rgba(0,229,255,0.12)'   },
  success: { icon: CheckCircle,   color: '#19F28C', bg: 'rgba(25,242,140,0.12)'  },
}

interface NotificationCardProps {
  notification: Notification
  onClick?: () => void
}

export function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const { icon: Icon, color, bg } = typeConfig[notification.type]

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200',
        !notification.read && 'relative',
      )}
      style={{
        background: notification.read ? 'transparent' : 'rgba(79,123,255,0.04)',
        border: `1px solid ${notification.read ? 'rgba(79,123,255,0.06)' : 'rgba(79,123,255,0.15)'}`,
      }}
    >
      {/* Unread left bar */}
      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      )}

      <div className="p-2 rounded-lg shrink-0 flex items-center justify-center" style={{ background: bg }}>
        <Icon size={14} style={{ color, filter: `drop-shadow(0 0 4px ${color}80)` }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold text-[#F8FAFC] truncate">{notification.title}</h4>
          {!notification.read && (
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
          )}
        </div>
        <p className="text-[11px] text-[#6F7D9E] mt-0.5 leading-relaxed">{notification.message}</p>
        <span className="text-[10px] text-[#6F7D9E]/60 mt-1 block">{notification.time}</span>
      </div>
    </motion.div>
  )
}

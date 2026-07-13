import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TabsProps {
  tabs: { id: string; label: string }[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 p-1 rounded-xl', className)}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)}
            className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: isActive ? '#fff' : '#AEB7C6' }}>
            {isActive && (
              <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,124,255,0.18), rgba(106,92,255,0.1))',
                  border: '1px solid rgba(79,124,255,0.22)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

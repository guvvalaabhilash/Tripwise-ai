import { motion } from 'framer-motion'
import { MapPin, Clock } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import type { ItineraryItem } from '@/types'

const typeColors = {
  activity: 'border-cyan-500/30 bg-cyan-500/10',
  food: 'border-orange-500/30 bg-orange-500/10',
  transport: 'border-royal/30 bg-royal/10',
  accommodation: 'border-purple-500/30 bg-purple-500/10',
}

interface TimelineProps {
  items: ItineraryItem[]
}

export function Timeline({ items }: TimelineProps) {
  const days = [...new Set(items.map((i) => i.day))]

  return (
    <div className="space-y-8">
      {days.map((day) => (
        <div key={day}>
          <h3 className="text-sm font-semibold text-royal mb-4 font-jakarta">
            Day {day}
          </h3>
          <div className="space-y-3">
            {items
              .filter((i) => i.day === day)
              .map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${typeColors[item.type]}`} />
                    <div className="w-px flex-1 bg-white/10 mt-1" />
                  </div>
                  <GlassCard padding="sm" className="flex-1 mb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-white text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {item.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={10} />
                            {item.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

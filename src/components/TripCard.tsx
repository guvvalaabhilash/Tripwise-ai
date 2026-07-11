import { motion } from 'framer-motion'
import { MapPin, Calendar, Users, ArrowRight } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatShortDate } from '@/lib/utils'
import { useCountry } from '@/context/CountryContext'
import type { Trip } from '@/types'

interface TripCardProps {
  trip: Trip
  onClick?: () => void
  variant?: 'default' | 'compact'
}

const statusConfig: Record<Trip['status'], { label: string; color: string; bg: string; glow: string }> = {
  active:    { label: 'Active',    color: '#19F28C', bg: 'rgba(25,242,140,0.12)',  glow: 'rgba(25,242,140,0.3)'  },
  upcoming:  { label: 'Upcoming',  color: '#4F7BFF', bg: 'rgba(79,123,255,0.12)', glow: 'rgba(79,123,255,0.3)'  },
  completed: { label: 'Completed', color: '#6F7D9E', bg: 'rgba(111,125,158,0.1)', glow: 'rgba(111,125,158,0.2)' },
}

export function TripCard({ trip, onClick, variant = 'default' }: TripCardProps) {
  const { formatAmount } = useCountry()
  const pct = trip.budget > 0 ? Math.min((trip.spent / trip.budget) * 100, 100) : 0
  const st  = statusConfig[trip.status]
  const barColor = pct > 90 ? '#FF4D6D' : pct > 70 ? '#FFB547' : '#4F7BFF'
  const members  = trip.members ?? []

  if (variant === 'compact') {
    return (
      <GlassCard hover padding="sm" onClick={onClick}
        className="flex items-center gap-3 group">
        <div className="relative shrink-0">
          <img src={trip.image} alt={trip.destination}
            className="w-12 h-12 rounded-xl object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#F0F4FF] truncate">{trip.name}</p>
          <p className="text-[11px] text-[#6F7D9E] truncate">{trip.destination}</p>
          <span className="text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block font-medium"
            style={{ color: st.color, background: st.bg, border: `1px solid ${st.glow}` }}>
            {st.label}
          </span>
        </div>
        <ArrowRight size={14} className="text-[#6F7D9E] group-hover:text-[#00E5FF] transition-colors shrink-0" />
      </GlassCard>
    )
  }

  return (
    <GlassCard hover tilt sweep onClick={onClick} padding="none"
      className="overflow-hidden group">
      {/* Hero image */}
      <div className="relative h-44 overflow-hidden">
        <img src={trip.image} alt={trip.destination}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(3,5,15,0.95) 0%, rgba(3,5,15,0.4) 55%, transparent 100%)' }} />
        <span className="absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm"
          style={{ color: st.color, background: st.bg, border: `1px solid ${st.glow}`,
            boxShadow: `0 0 10px ${st.glow}` }}>
          {st.label}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-base font-bold text-[#F0F4FF] truncate font-[family-name:var(--font-jakarta)]">
          {trip.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-[#6F7D9E] mt-1">
          <MapPin size={11} />{trip.destination}
        </div>

        <div className="flex items-center gap-4 mt-2.5 text-[11px] text-[#6F7D9E]">
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {trip.startDate ? formatShortDate(trip.startDate) : 'N/A'} – {trip.endDate ? formatShortDate(trip.endDate) : 'N/A'}
          </span>
          <span className="flex items-center gap-1"><Users size={10} />{trip.travelers}</span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#6F7D9E]">Budget used</span>
            <span className="font-medium" style={{ color: barColor }}>
              {formatAmount(trip.spent)} / {formatAmount(trip.budget)}
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(79,123,255,0.1)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                boxShadow: `0 0 8px ${barColor}88`, borderRadius: '9999px' }} />
          </div>
        </div>

        {members.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((m) => (
                <Avatar key={m.id} src={m.avatar} name={m.name} size="sm"
                  className="ring-2 ring-[#03050F]" />
              ))}
            </div>
            {members.length > 3 && (
              <span className="text-[11px] text-[#6F7D9E]">+{members.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  )
}

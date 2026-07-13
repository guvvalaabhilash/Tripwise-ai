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

const statusConfig: Record<Trip['status'], { label: string; color: string; bg: string; border: string }> = {
  active:    { label: 'Active',    color: '#19F28C', bg: 'rgba(25,242,140,0.1)',  border: 'rgba(25,242,140,0.25)' },
  upcoming:  { label: 'Upcoming',  color: '#4F7CFF', bg: 'rgba(79,124,255,0.1)', border: 'rgba(79,124,255,0.25)' },
  completed: { label: 'Completed', color: '#AEB7C6', bg: 'rgba(174,183,198,0.08)', border: 'rgba(174,183,198,0.2)' },
}

export function TripCard({ trip, onClick, variant = 'default' }: TripCardProps) {
  const { formatAmount } = useCountry()
  const pct = trip.budget > 0 ? Math.min((trip.spent / trip.budget) * 100, 100) : 0
  const st  = statusConfig[trip.status]
  const barColor = pct > 90 ? '#FF4D6D' : pct > 70 ? '#FFB547' : '#4F7CFF'
  const members  = trip.members ?? []

  if (variant === 'compact') {
    return (
      <GlassCard hover padding="sm" onClick={onClick} className="flex items-center gap-3 group">
        <img src={trip.image} alt={trip.destination} className="w-10 h-10 rounded-xl object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{trip.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin size={10} className="text-[#AEB7C6]/60" />
            <p className="text-xs text-[#AEB7C6]/70 truncate">{trip.destination}</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block font-medium"
            style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}` }}>
            {st.label}
          </span>
        </div>
        <ArrowRight size={13} className="text-[#AEB7C6]/40 group-hover:text-[#4F7CFF] transition-colors shrink-0" />
      </GlassCard>
    )
  }

  return (
    <GlassCard hover tilt sweep onClick={onClick} padding="none" className="overflow-hidden group">
      {/* Hero image */}
      <div className="relative h-40 overflow-hidden">
        <img src={trip.image} alt={trip.destination}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(5,8,22,0.95) 0%, rgba(5,8,22,0.3) 55%, transparent 100%)' }} />
        <span className="absolute top-3 right-3 badge"
          style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}` }}>
          {st.label}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-bold text-white truncate font-[family-name:var(--font-jakarta)]">{trip.name}</h3>
        <div className="flex items-center gap-1.5 text-xs text-[#AEB7C6]/70 mt-1">
          <MapPin size={11} />{trip.destination}
        </div>
        <div className="flex items-center gap-4 mt-2 text-[11px] text-[#AEB7C6]/60">
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {trip.startDate ? formatShortDate(trip.startDate) : 'N/A'}
            {' – '}
            {trip.endDate ? formatShortDate(trip.endDate) : 'N/A'}
          </span>
          <span className="flex items-center gap-1"><Users size={10} />{trip.travelers}</span>
        </div>

        {/* Budget bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-[#AEB7C6]/60">Budget used</span>
            <span className="font-medium" style={{ color: barColor }}>
              {formatAmount(trip.spent)} / {formatAmount(trip.budget)}
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden bg-white/6">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${barColor}bb, ${barColor})`,
                borderRadius: '9999px',
              }}
            />
          </div>
        </div>

        {members.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex -space-x-1.5">
              {members.slice(0, 3).map(m => (
                <Avatar key={m.id} src={m.avatar} name={m.name} size="sm"
                  className="ring-2 ring-[#050816]" />
              ))}
            </div>
            {members.length > 3 && (
              <span className="text-[11px] text-[#AEB7C6]/60">+{members.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  )
}

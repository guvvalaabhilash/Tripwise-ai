import { motion } from 'framer-motion'
import { Wind, Droplets, Thermometer, AlertTriangle, Star, Package } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import type { WeatherData } from '@/lib/weatherService'
import { getWeatherRecommendations } from '@/lib/weatherService'

interface WeatherCardProps { weather: WeatherData; loading?: boolean }

export function WeatherCard({ weather, loading = false }: WeatherCardProps) {
  if (loading) {
    return (
      <GlassCard padding="sm" className="animate-pulse">
        <div className="h-28 rounded-xl shimmer" />
      </GlassCard>
    )
  }

  const rec = getWeatherRecommendations(weather)
  const { current, forecast, location, country } = weather

  const scoreColor =
    rec.travelScore === 'Excellent' ? '#19F28C' :
    rec.travelScore === 'Good'      ? '#00C2FF' :
    rec.travelScore === 'Moderate'  ? '#FFB547' : '#FF4D6D'

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }} className="space-y-3">

      {/* Current weather */}
      <GlassCard glow="royal" padding="sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">{current.conditionIcon}</span>
              <div>
                <p className="text-[11px] text-[#AEB7C6]">{location}, {country}</p>
                <p className="text-sm text-white font-medium capitalize">{current.condition}</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{current.temp}°C</p>
            <p className="text-[11px] text-[#6B7A93] mt-0.5">Feels like {current.feelsLike}°C</p>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 justify-end mb-1">
              <Star size={12} style={{ color: scoreColor }} />
              <span className="text-[11px] text-[#AEB7C6]">Travel Score</span>
            </div>
            <p className="text-base font-bold" style={{ color: scoreColor }}>{rec.travelScore}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { Icon: Droplets,    label: 'Humidity', value: `${current.humidity}%`,  color: '#00C2FF' },
            { Icon: Wind,        label: 'Wind',     value: `${current.windKph}km/h`, color: '#4F7CFF' },
            { Icon: Thermometer, label: 'Rain',     value: `${current.rainChance}%`, color: '#6A5CFF' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <s.Icon size={13} style={{ color: s.color }} className="mx-auto mb-1" />
              <p className="text-xs font-semibold text-white">{s.value}</p>
              <p className="text-[10px] text-[#6B7A93]">{s.label}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* 7-day forecast */}
      {forecast.length > 0 && (
        <div className="grid grid-cols-7 gap-1">
          {forecast.map((day, i) => (
            <div key={day.date} className="rounded-xl p-2 text-center transition-all"
              style={i === 0 ? {
                background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.25)',
              } : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[9px] text-[#6B7A93] mb-1">{day.label}</p>
              <span className="text-sm block">{day.conditionIcon}</span>
              <p className="text-[10px] font-semibold text-white mt-1">{day.tempMax}°</p>
              <p className="text-[9px] text-[#6B7A93]">{day.tempMin}°</p>
              {day.rainChance > 30 && (
                <p className="text-[9px] mt-0.5" style={{ color: '#00C2FF' }}>{day.rainChance}%</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {rec.warnings.length > 0 && (
        <div className="rounded-xl px-4 py-3"
          style={{ background: 'rgba(255,181,71,0.07)', border: '1px solid rgba(255,181,71,0.18)' }}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={13} style={{ color: '#FFB547' }} />
            <span className="text-xs font-semibold" style={{ color: '#FFB547' }}>Travel Alerts</span>
          </div>
          {rec.warnings.map(w => (
            <p key={w} className="text-xs text-[#AEB7C6] mt-1">{w}</p>
          ))}
        </div>
      )}

      {/* Packing tips */}
      <GlassCard padding="sm">
        <div className="flex items-center gap-2 mb-2">
          <Package size={13} className="text-[#4F7CFF]" />
          <span className="text-xs font-semibold text-white">Packing Tips</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {rec.packingSuggestions.map(s => (
            <span key={s} className="text-[11px] px-2 py-1 rounded-lg text-[#AEB7C6]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {s}
            </span>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}

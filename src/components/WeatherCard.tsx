import { motion } from 'framer-motion'
import { Wind, Droplets, Thermometer, AlertTriangle, Star, Package } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import type { WeatherData } from '@/lib/weatherService'
import { getWeatherRecommendations } from '@/lib/weatherService'

interface WeatherCardProps {
  weather: WeatherData
  loading?: boolean
}

export function WeatherCard({ weather, loading = false }: WeatherCardProps) {
  const rec = getWeatherRecommendations(weather)
  const { current, forecast, location, country } = weather

  if (loading) {
    return (
      <GlassCard className="animate-pulse">
        <div className="h-32 bg-white/5 rounded-xl" />
      </GlassCard>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      {/* ── Current weather header ── */}
      <GlassCard glow="royal" padding="sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{current.conditionIcon}</span>
              <div>
                <p className="text-xs text-slate-400">{location}, {country}</p>
                <p className="text-sm text-white font-medium">{current.condition}</p>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mt-1">{current.temp}°C</p>
            <p className="text-xs text-slate-500 mt-0.5">Feels like {current.feelsLike}°C</p>
          </div>
          {/* Travel score */}
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 justify-end mb-1">
              <Star size={13} className={rec.travelScoreColor} />
              <span className="text-xs text-slate-400">Travel Score</span>
            </div>
            <p className={`text-lg font-bold ${rec.travelScoreColor}`}>{rec.travelScore}</p>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/6">
          {[
            { icon: Droplets, label: 'Humidity', value: `${current.humidity}%`, color: 'text-cyan-400' },
            { icon: Wind, label: 'Wind', value: `${current.windKph} km/h`, color: 'text-blue-400' },
            { icon: Thermometer, label: 'Rain', value: `${current.rainChance}%`, color: 'text-indigo-400' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <s.icon size={14} className={`${s.color} mx-auto mb-1`} />
              <p className="text-xs font-medium text-white">{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── 7-day forecast strip ── */}
      {forecast.length > 0 && (
        <div className="grid grid-cols-7 gap-1">
            {forecast.map((day, i) => (
            <div
              key={day.date}
              className={`rounded-xl p-2 text-center transition-all ${
                i === 0
                  ? 'bg-royal/20 border border-royal/25'
                  : 'bg-white/3 border border-white/5'
              }`}
            >
              <p className="text-[9px] text-slate-400 mb-1">{day.label}</p>
              <span className="text-sm block">{day.conditionIcon}</span>
              <p className="text-[10px] font-medium text-white mt-1">{day.tempMax}°</p>
              <p className="text-[9px] text-slate-500">{day.tempMin}°</p>
              {day.rainChance > 30 && (
                <p className="text-[9px] text-cyan-400 mt-0.5">{day.rainChance}%</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Warnings ── */}
      {rec.warnings.length > 0 && (
        <div className="rounded-xl px-4 py-3 bg-orange-500/8 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-orange-400" />
            <span className="text-xs font-semibold text-orange-400">Travel Alerts</span>
          </div>
          {rec.warnings.map(w => (
            <p key={w} className="text-xs text-slate-300 mt-1">{w}</p>
          ))}
        </div>
      )}

      {/* ── Packing suggestions ── */}
      <GlassCard padding="sm">
        <div className="flex items-center gap-2 mb-2">
          <Package size={14} className="text-royal" />
          <span className="text-xs font-semibold text-white">Packing Tips</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {rec.packingSuggestions.map(s => (
            <span
              key={s}
              className="text-[11px] bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-slate-300"
            >
              {s}
            </span>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}

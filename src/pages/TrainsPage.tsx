import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Train, Search, ArrowRight, Clock, MapPin, Ruler, Info } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  searchTrains,
  STATION_MAP,
  TRAIN_TYPE_STYLE,
  type TrainResult,
  type TrainSearchResult,
} from '@/lib/trainService'

// ─── Autocomplete station input ────────────────────────────────────────────────
const CITY_LIST = Object.keys(STATION_MAP).map(k => ({
  city: k.replace(/\b\w/g, c => c.toUpperCase()),
  code: STATION_MAP[k],
}))

function StationInput({
  label, value, onChange, placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const filtered = value.trim().length > 1
    ? CITY_LIST.filter(c =>
        c.city.toLowerCase().includes(value.toLowerCase()) ||
        c.code.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8)
    : []

  return (
    <div className="relative">
      <label className="text-xs font-medium text-slate-400 mb-1.5 block">{label}</label>
      <div className="relative">
        <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3b5bdb]/50 focus:ring-2 focus:ring-[#3b5bdb]/20 transition-all"
        />
      </div>
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute z-20 left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {filtered.map(c => (
              <button
                key={c.code + c.city}
                onMouseDown={() => { onChange(c.city); setOpen(false) }}
                className="w-full text-left px-4 py-2.5 hover:bg-white/8 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="text-sm text-white">{c.city}</span>
                <span className="text-xs text-[#5c7cfa] font-mono">{c.code}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Train result card ────────────────────────────────────────────────────────
function TrainCard({ train, index }: { train: TrainResult; index: number }) {
  const style = TRAIN_TYPE_STYLE[train.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassCard padding="sm" hover className="group">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Train info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-white text-sm">{train.trainName}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${style.bg} ${style.color}`}>
                {style.label}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">#{train.trainNo}</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {train.classes.map(cls => (
                <span
                  key={cls}
                  className="text-[10px] bg-white/5 border border-white/8 text-slate-400 px-1.5 py-0.5 rounded font-mono"
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>

          {/* Timings */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <p className="text-lg font-bold text-white font-mono">{train.departure}</p>
              <p className="text-[10px] text-slate-500">Departs</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-slate-600">
                <div className="w-8 h-px bg-slate-600" />
                <ArrowRight size={12} />
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Clock size={10} />
                <span className="text-[10px]">{train.duration}</span>
              </div>
              {train.distance !== '0' && train.distance !== '' && (
                <div className="flex items-center gap-1 text-slate-600">
                  <Ruler size={10} />
                  <span className="text-[10px]">{train.distance} km</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white font-mono">{train.arrival}</p>
              <p className="text-[10px] text-slate-500">Arrives</p>
            </div>
          </div>

          {/* Runs on */}
          {train.runsOn && train.runsOn !== 'Daily' && (
            <div className="text-right shrink-0 hidden sm:block">
              <p className="text-[10px] text-slate-500">Runs on</p>
              <p className="text-xs text-slate-300 font-mono">{train.runsOn}</p>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TrainsPage() {
  const [from, setFrom]       = useState('')
  const [to, setTo]           = useState('')
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<TrainSearchResult | null>(null)

  const handleSearch = async () => {
    if (!from.trim() || !to.trim()) return
    setLoading(true)
    const res = await searchTrains(from, to)
    setResult(res)
    setLoading(false)
  }

  const swap = () => { setFrom(to); setTo(from) }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Train size={22} className="text-royal" />
          <h1 className="text-2xl font-bold text-white font-jakarta">Train Search</h1>
        </div>
        <p className="text-slate-400 text-sm">Search Indian Railways trains between any two stations</p>
      </motion.div>

      {/* Search form */}
      <GlassCard glow="royal">
        <div className="grid sm:grid-cols-2 gap-4 relative">
          <StationInput label="From" value={from} onChange={setFrom} placeholder="e.g. Delhi, Mumbai" />

          {/* Swap button */}
          <button
            onClick={swap}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-2 z-10 sm:flex hidden w-8 h-8 items-center justify-center rounded-full bg-royal/20 border border-royal/30 text-royal hover:bg-royal/35 transition-colors cursor-pointer"
            aria-label="Swap stations"
          >
            ⇄
          </button>

          <StationInput label="To" value={to} onChange={setTo} placeholder="e.g. Goa, Varanasi" />
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Travel Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full sm:w-56 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-royal/50 transition-all"
          />
        </div>

        <div className="mt-5">
          <Button
            onClick={handleSearch}
            loading={loading}
            disabled={!from.trim() || !to.trim()}
            className="w-full sm:w-auto"
          >
            <Search size={16} />
            Search Trains
          </Button>
        </div>
      </GlassCard>

      {/* Results */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-white/3 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && result && (
        <div className="space-y-4">
          {/* Result header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                {result.fromResolved} → {result.toResolved}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {result.trains.length} train{result.trains.length !== 1 ? 's' : ''} found
                {result.source === 'static' && ' · showing popular routes'}
              </p>
            </div>
            {result.source === 'static' && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Info size={12} />
                Curated data
              </div>
            )}
          </div>

          {result.error && result.trains.length === 0 ? (
            <EmptyState
              title="No trains found"
              description={result.error}
              action={
                <Button size="sm" variant="secondary" onClick={() => setResult(null)}>
                  Try Different Stations
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {result.trains.map((train, i) => (
                <TrainCard key={train.trainNo + i} train={train} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !result && (
        <GlassCard className="text-center py-12">
          <Train size={36} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Enter origin and destination to search trains</p>
          <p className="text-slate-600 text-xs mt-1">Supports all major Indian cities and stations</p>
        </GlassCard>
      )}
    </div>
  )
}

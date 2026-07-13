import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plane,
  Home,
  Utensils,
  Check,
  Sparkles,
  CloudSun,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { WeatherCard } from '@/components/WeatherCard'
import { fetchWeather, getWeatherRecommendations } from '@/lib/weatherService'
import type { WeatherData } from '@/lib/weatherService'
import {
  TRANSPORT_OPTIONS,
  ACCOMMODATION_OPTIONS,
  FOOD_PREFERENCES,
} from '@/constants'


const steps = [
  { id: 1, label: 'Destination', icon: MapPin,  desc: 'Where are you going?' },
  { id: 2, label: 'Details',     icon: Calendar, desc: 'Dates, members & budget' },
  { id: 3, label: 'Preferences', icon: Utensils, desc: 'Transport & food' },
  { id: 4, label: 'Summary',     icon: Check,    desc: 'Review & confirm' },
]

export default function TripPlannerPage() {
  const navigate = useNavigate()
  const formatAmount = (amount: number) => `₹${amount.toLocaleString()}`
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
  tripName: "",

  destination: "",
  startDate: "",
  endDate: "",
  travelers: 2,
  budget: 3000,
  transport: "flight",
  accommodation: "hotel",
  foodPreference: "any",
});

  const update = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ── Weather: auto-fetch when destination is set and user reaches Step 2 ──
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const weatherTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!form.destination.trim() || step < 2) return
    if (weatherTimer.current) clearTimeout(weatherTimer.current)
    weatherTimer.current = setTimeout(async () => {
      setWeatherLoading(true)
      setWeatherError(null)
      const result = await fetchWeather(form.destination)
      setWeather(result.data)
      setWeatherError(result.errorMessage)
      setWeatherLoading(false)
      if (result.data) {
        const rec = getWeatherRecommendations(result.data)
        setForm(prev => ({
          ...prev,
          transport: rec.transport,
          accommodation: rec.accommodation,
        }))
      }
    }, 800)
    return () => { if (weatherTimer.current) clearTimeout(weatherTimer.current) }
  }, [form.destination, step])

const handleCreate = async () => {
  if (
  !form.tripName ||
  !form.destination ||
  !form.startDate ||
  !form.endDate
) {
  alert("Please fill all required fields.");
  return;
}

  setLoading(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Please login first.");
    setLoading(false);
    navigate("/login");
    return;
  }

 const { error } = await supabase
  .from("trips")
  .insert([
    {
   
   
   user_id: user.id,
     trip_name: form.tripName,
    destination: form.destination,
    start_date: form.startDate,
    end_date: form.endDate,
    budget: form.budget,
    spent: 0,
    travelers: form.travelers,
    transport: form.transport,
    accommodation: form.accommodation,
    food_preference: form.foodPreference,
    status: "planned",
  },
])
  
  .select();
  setLoading(false);

  if (error) {
    alert(error.message);
    return;
  }

  // DB trigger (notify_on_trip_insert) fires the notification automatically.

  alert("Trip created successfully!");
  navigate("/dashboard");
};
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-jakarta)]">Plan Your Trip</h1>
        <p className="text-[#AEB7C6] mt-1 text-sm">Let AI help you create the perfect itinerary</p>
      </div>

      <div className="flex gap-6">
        {/* ── Left vertical stepper ── */}
        <div className="hidden md:flex flex-col gap-0 w-52 shrink-0">
          {steps.map((s, idx) => {
            const Icon = s.icon
            const isActive = step === s.id
            const isDone   = step > s.id
            return (
              <div key={s.id} className="flex flex-col">
                <button
                  onClick={() => s.id < step && setStep(s.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    s.id < step ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  style={isActive ? {
                    background: 'rgba(79,124,255,0.1)',
                    border: '1px solid rgba(79,124,255,0.22)',
                  } : { border: '1px solid transparent' }}
                >
                  {/* Step circle */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200"
                    style={
                      isDone   ? { background: 'rgba(25,242,140,0.15)', border: '1.5px solid #19F28C' } :
                      isActive ? { background: 'rgba(79,124,255,0.2)',  border: '1.5px solid #4F7CFF',
                        boxShadow: '0 0 12px rgba(79,124,255,0.3)' } :
                                 { background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.12)' }
                    }>
                    {isDone
                      ? <Check size={14} className="text-[#19F28C]" />
                      : isActive
                        ? <Icon size={14} className="text-[#4F7CFF]" />
                        : <span className="text-xs font-semibold text-[#6B7A93]">{s.id}</span>
                    }
                  </div>
                  {/* Label */}
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold leading-tight ${
                      isActive ? 'text-white' : isDone ? 'text-[#AEB7C6]' : 'text-[#6B7A93]'
                    }`}>{s.label}</p>
                    <p className="text-[10px] text-[#6B7A93] mt-0.5">{s.desc}</p>
                  </div>
                </button>
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="ml-7 w-px h-4 self-start"
                    style={{ background: isDone ? 'rgba(25,242,140,0.4)' : 'rgba(255,255,255,0.07)' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* ── Mobile horizontal stepper ── */}
        <div className="flex md:hidden items-center justify-center gap-1.5 mb-4 w-full">
          {steps.map((s) => {
            const isActive = step === s.id
            const isDone   = step > s.id
            return (
              <button key={s.id} onClick={() => s.id < step && setStep(s.id)}
                className={`flex items-center gap-1.5 ${s.id < step ? 'cursor-pointer' : 'cursor-default'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone ? 'bg-[#19F28C]/15 text-[#19F28C]' :
                  isActive ? 'text-[#4F7CFF]' : 'text-[#6B7A93]'
                }`} style={isActive ? { background: 'rgba(79,124,255,0.18)', boxShadow: '0 0 10px rgba(79,124,255,0.3)' } :
                  isDone ? {} : { background: 'rgba(255,255,255,0.05)' }}>
                  {isDone ? <Check size={12} /> : s.id}
                </div>
                {s.id < steps.length && (
                  <div className={`w-5 h-px ${isDone ? 'bg-[#19F28C]/40' : 'bg-white/10'}`} />
                )}
              </button>
            )
          })}
        </div>

        {/* ── Form panel ── */}
        <div className="flex-1 min-w-0">
          <GlassCard glow="royal" padding="lg">
            <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <Sparkles size={32} className="text-royal-light mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-white">Where do you want to go?</h2>
              </div>
              <Input
  label="Trip Name"
  placeholder="e.g. Summer Vacation"
  icon={<MapPin size={16} />}
  value={form.tripName}
  onChange={(e) => update("tripName", e.target.value)}
/>
              <Input
                label="Destination"
                placeholder="e.g. Goa, India"
                icon={<MapPin size={16} />}
                value={form.destination}
                onChange={(e) => update('destination', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2.5">
                {['Goa, India', 'Jaipur, India', 'Kerala Backwaters', 'Varanasi, India'].map((dest) => (
                  <button
                    key={dest}
                    onClick={() => update('destination', dest)}
                    className={`p-3 rounded-xl text-sm text-left transition-all duration-200 cursor-pointer font-medium ${
                      form.destination === dest
                        ? 'text-[#4F7CFF]'
                        : 'text-[#AEB7C6] hover:text-white'
                    }`}
                    style={form.destination === dest ? {
                      background: 'rgba(79,124,255,0.12)',
                      border: '1px solid rgba(79,124,255,0.3)',
                    } : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-white text-center">Trip Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  icon={<Calendar size={16} />}
                  value={form.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                />
                <Input
                  label="End Date"
                  type="date"
                  icon={<Calendar size={16} />}
                  value={form.endDate}
                  onChange={(e) => update('endDate', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-3">
                  <Users size={16} />
                  Travelers: {form.travelers}
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={form.travelers}
                  onChange={(e) => update('travelers', parseInt(e.target.value))}
                  className="w-full accent-royal"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-3">
                  <DollarSign size={16} />
                  Budget: {formatAmount(form.budget)}
                </label>
                <input
                  type="range"
                  min={500}
                  max={100000}
                  step={500}
                  value={form.budget}
                  onChange={(e) => update('budget', parseInt(e.target.value))}
                  className="w-full accent-royal"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>₹500</span>
                  <span>₹1,00,000</span>
                </div>
              </div>

              {/* ── Weather forecast for selected destination ── */}
              {form.destination && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CloudSun size={16} className="text-cyan-400" />
                    <span className="text-sm font-medium text-white">
                      Weather Forecast — {form.destination}
                    </span>
                  </div>
                  {weatherLoading ? (
                    <GlassCard padding="sm" className="animate-pulse">
                      <div className="h-24 bg-white/5 rounded-xl" />
                    </GlassCard>
                  ) : weather ? (
                    <WeatherCard weather={weather} />
                  ) : (
                    <GlassCard padding="sm">
                      <p className="text-xs text-slate-400 text-center py-4">
                        {weatherError ?? 'Unable to load weather for this location.'}
                      </p>
                    </GlassCard>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-white text-center">Your Preferences</h2>
              <div>
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-3">
                  <Plane size={16} />
                  Transport
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {TRANSPORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update('transport', opt.value)}
                      className={`p-3 rounded-xl text-sm transition-all duration-200 cursor-pointer text-center ${
                        form.transport === opt.value ? 'text-[#4F7CFF]' : 'text-[#AEB7C6] hover:text-white'
                      }`}
                      style={form.transport === opt.value ? {
                        background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.3)',
                      } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <span className="text-xl block mb-1">{opt.icon}</span>
                      <p className="text-xs font-medium">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-3">
                  <Home size={16} />
                  Accommodation
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {ACCOMMODATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update('accommodation', opt.value)}
                      className={`p-3 rounded-xl text-sm transition-all duration-200 cursor-pointer text-center ${
                        form.accommodation === opt.value ? 'text-[#4F7CFF]' : 'text-[#AEB7C6] hover:text-white'
                      }`}
                      style={form.accommodation === opt.value ? {
                        background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.3)',
                      } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <span className="text-xl block mb-1">{opt.icon}</span>
                      <p className="text-xs font-medium">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <Select
                label="Food Preference"
                value={form.foodPreference}
                onChange={(v) => update('foodPreference', v)}
                options={FOOD_PREFERENCES}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <Check size={32} className="text-emerald-400 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-white">Trip Summary</h2>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Trip Name',     value: form.tripName || 'Not set' },
                  { label: 'Destination',   value: form.destination || 'Not set' },
                  { label: 'Dates',         value: form.startDate && form.endDate ? `${form.startDate} → ${form.endDate}` : 'Not set' },
                  { label: 'Travelers',     value: form.travelers },
                  { label: 'Budget',        value: formatAmount(form.budget) },
                  { label: 'Transport',     value: TRANSPORT_OPTIONS.find(t => t.value === form.transport)?.label },
                  { label: 'Accommodation', value: ACCOMMODATION_OPTIONS.find(a => a.value === form.accommodation)?.label },
                  { label: 'Food',          value: FOOD_PREFERENCES.find(f => f.value === form.foodPreference)?.label },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2.5 px-3 rounded-xl"
                    style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xs text-[#AEB7C6]">{item.label}</span>
                    <span className="text-sm font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl mt-2"
                style={{ background:'rgba(79,124,255,0.08)', border:'1px solid rgba(79,124,255,0.18)' }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-[#4F7CFF]" />
                  <p className="text-sm text-[#AEB7C6]">AI will craft a personalized itinerary based on your preferences.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-6 border-t border-white/8">
          {step > 1 ? (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleCreate} loading={loading}>
              <Sparkles size={16} />
              Create Trip with AI
            </Button>
          )}
        </div>
      </GlassCard>
        </div>
      </div>
    </div>
  )
}

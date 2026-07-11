import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface TravelTool {
  id: string
  title: string
  icon: string
  fields: Array<{ key: string; label: string; placeholder: string }>
  calculate: (vals: Record<string, number>) => Array<{ label: string; value: string }>
}

const TRAVEL_TOOLS: TravelTool[] = [
  {
    id: 'budget-per-day',
    title: 'Budget Per Day',
    icon: '📅',
    fields: [
      { key: 'total', label: 'Total Budget (₹)', placeholder: '30000' },
      { key: 'days', label: 'Number of Days', placeholder: '7' },
    ],
    calculate: ({ total, days }) => [
      { label: 'Per Day Budget', value: `₹${(total / (days || 1)).toFixed(2)}` },
      { label: 'Per Day (10% emergency)', value: `₹${(total * 0.9 / (days || 1)).toFixed(2)}` },
    ],
  },
  {
    id: 'expense-per-person',
    title: 'Trip Cost Split',
    icon: '👥',
    fields: [
      { key: 'total', label: 'Total Trip Cost (₹)', placeholder: '80000' },
      { key: 'people', label: 'Number of People', placeholder: '4' },
    ],
    calculate: ({ total, people }) => [
      { label: 'Per Person', value: `₹${(total / (people || 1)).toFixed(2)}` },
      { label: 'With 5% buffer', value: `₹${(total * 1.05 / (people || 1)).toFixed(2)}` },
    ],
  },
  {
    id: 'fuel',
    title: 'Fuel Cost',
    icon: '⛽',
    fields: [
      { key: 'distance', label: 'Distance (km)', placeholder: '500' },
      { key: 'mileage', label: 'Mileage (km/litre)', placeholder: '15' },
      { key: 'price', label: 'Fuel Price (₹/litre)', placeholder: '102' },
    ],
    calculate: ({ distance, mileage, price }) => {
      const litres = distance / (mileage || 1)
      return [
        { label: 'Fuel Needed', value: `${litres.toFixed(2)} litres` },
        { label: 'Total Fuel Cost', value: `₹${(litres * price).toFixed(2)}` },
        { label: 'Cost per km', value: `₹${(price / (mileage || 1)).toFixed(2)}` },
      ]
    },
  },
  {
    id: 'hotel',
    title: 'Hotel Cost',
    icon: '🏨',
    fields: [
      { key: 'rate', label: 'Room Rate (₹/night)', placeholder: '3000' },
      { key: 'rooms', label: 'Number of Rooms', placeholder: '2' },
      { key: 'nights', label: 'Number of Nights', placeholder: '5' },
    ],
    calculate: ({ rate, rooms, nights }) => {
      const total = rate * rooms * nights
      return [
        { label: 'Total Hotel Cost', value: `₹${total.toFixed(2)}` },
        { label: 'Cost per night (all rooms)', value: `₹${(rate * rooms).toFixed(2)}` },
      ]
    },
  },
  {
    id: 'food-budget',
    title: 'Food Budget',
    icon: '🍽️',
    fields: [
      { key: 'meals', label: 'Meals Per Day', placeholder: '3' },
      { key: 'cost', label: 'Avg. Cost Per Meal (₹)', placeholder: '300' },
      { key: 'people', label: 'People', placeholder: '2' },
      { key: 'days', label: 'Days', placeholder: '7' },
    ],
    calculate: ({ meals, cost, people, days }) => {
      const daily = meals * cost * people
      const total = daily * days
      return [
        { label: 'Daily Food Cost', value: `₹${daily.toFixed(2)}` },
        { label: 'Total Food Budget', value: `₹${total.toFixed(2)}` },
      ]
    },
  },
  {
    id: 'emergency',
    title: 'Emergency Fund',
    icon: '🚨',
    fields: [
      { key: 'total', label: 'Total Trip Budget (₹)', placeholder: '50000' },
      { key: 'pct', label: 'Reserve % (recommended: 15)', placeholder: '15' },
    ],
    calculate: ({ total, pct }) => {
      const fund = total * pct / 100
      return [
        { label: 'Emergency Reserve', value: `₹${fund.toFixed(2)}` },
        { label: 'Spending Budget', value: `₹${(total - fund).toFixed(2)}` },
      ]
    },
  },
  {
    id: 'packing',
    title: 'Packing Weight',
    icon: '🧳',
    fields: [
      { key: 'clothes', label: 'Clothes (kg)', placeholder: '5' },
      { key: 'shoes', label: 'Shoes (kg)', placeholder: '2' },
      { key: 'electronics', label: 'Electronics (kg)', placeholder: '2' },
      { key: 'misc', label: 'Misc / Toiletries (kg)', placeholder: '1' },
    ],
    calculate: ({ clothes, shoes, electronics, misc }) => {
      const total = clothes + shoes + electronics + misc
      return [
        { label: 'Total Weight', value: `${total.toFixed(1)} kg` },
        { label: 'Economy Allowance (20kg)', value: total <= 20 ? '✅ Within limit' : `⚠️ Over by ${(total - 20).toFixed(1)} kg` },
        { label: 'Business Allowance (30kg)', value: total <= 30 ? '✅ Within limit' : `⚠️ Over by ${(total - 30).toFixed(1)} kg` },
      ]
    },
  },
]

function TravelToolCard({ tool }: { tool: TravelTool }) {
  const [open, setOpen] = useState(false)
  const [vals, setVals] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Array<{ label: string; value: string }>>([])

  const compute = () => {
    const nums: Record<string, number> = {}
    for (const f of tool.fields) nums[f.key] = parseFloat(vals[f.key] || '0') || 0
    setResults(tool.calculate(nums))
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/4 transition-colors cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{tool.icon}</span>
          <span className="text-sm font-medium text-white">{tool.title}</span>
        </div>
        {open
          ? <ChevronUp size={14} className="text-slate-400" />
          : <ChevronDown size={14} className="text-slate-400" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-2">
              {tool.fields.map(f => (
                <div key={f.key}>
                  <label className="text-[11px] text-slate-400 mb-0.5 block">{f.label}</label>
                  <input
                    type="number"
                    placeholder={f.placeholder}
                    value={vals[f.key] || ''}
                    onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#5c7cfa]/50 transition-colors"
                  />
                </div>
              ))}
              <button
                onClick={compute}
                className="w-full py-2 rounded-lg text-sm font-medium text-white bg-emerald-500/15 hover:bg-emerald-500/28 border border-emerald-500/20 transition-colors cursor-pointer mt-1"
              >
                Calculate
              </button>
              {results.length > 0 && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-white/6">
                  {results.map(r => (
                    <div key={r.label} className="flex justify-between items-center gap-2">
                      <span className="text-xs text-slate-400">{r.label}</span>
                      <span className="text-sm font-semibold text-emerald-400 text-right">{r.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function TravelTools() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="px-4 py-3 border-b border-white/6 flex items-center gap-2">
        <span className="text-base">✈️</span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Travel Calculators</span>
      </div>
      <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
        {TRAVEL_TOOLS.map(t => <TravelToolCard key={t.id} tool={t} />)}
      </div>
    </div>
  )
}

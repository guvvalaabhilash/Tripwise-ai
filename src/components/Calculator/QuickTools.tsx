import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ToolResult { label: string; value: string }

interface Tool {
  id: string
  title: string
  icon: string
  fields: Array<{ key: string; label: string; placeholder: string; type?: string }>
  calculate: (vals: Record<string, number>) => ToolResult[]
}

const TOOLS: Tool[] = [
  {
    id: 'percent',
    title: 'Percentage',
    icon: '%',
    fields: [
      { key: 'value', label: 'Value', placeholder: '1000' },
      { key: 'pct', label: 'Percentage', placeholder: '18' },
    ],
    calculate: ({ value, pct }) => [
      { label: `${pct}% of ${value}`, value: String(+(value * pct / 100).toFixed(4)) },
      { label: 'Remaining', value: String(+(value - value * pct / 100).toFixed(4)) },
    ],
  },
  {
    id: 'discount',
    title: 'Discount',
    icon: '🏷️',
    fields: [
      { key: 'price', label: 'Original Price', placeholder: '5000' },
      { key: 'disc', label: 'Discount %', placeholder: '20' },
    ],
    calculate: ({ price, disc }) => {
      const saved = price * disc / 100
      return [
        { label: 'You save', value: `₹${saved.toFixed(2)}` },
        { label: 'Final price', value: `₹${(price - saved).toFixed(2)}` },
      ]
    },
  },
  {
    id: 'gst',
    title: 'GST Calculator',
    icon: '🧾',
    fields: [
      { key: 'amount', label: 'Amount (₹)', placeholder: '10000' },
      { key: 'rate', label: 'GST Rate %', placeholder: '18' },
    ],
    calculate: ({ amount, rate }) => {
      const gst = amount * rate / 100
      return [
        { label: 'GST Amount', value: `₹${gst.toFixed(2)}` },
        { label: 'Total (incl. GST)', value: `₹${(amount + gst).toFixed(2)}` },
        { label: 'Price before GST', value: `₹${(amount / (1 + rate / 100)).toFixed(2)}` },
      ]
    },
  },
  {
    id: 'tip',
    title: 'Tip Calculator',
    icon: '💁',
    fields: [
      { key: 'bill', label: 'Bill Amount', placeholder: '2000' },
      { key: 'tip', label: 'Tip %', placeholder: '15' },
      { key: 'people', label: 'People', placeholder: '4' },
    ],
    calculate: ({ bill, tip, people }) => {
      const tipAmt = bill * tip / 100
      const total = bill + tipAmt
      const pp = total / (people || 1)
      return [
        { label: 'Tip Amount', value: `₹${tipAmt.toFixed(2)}` },
        { label: 'Total Bill', value: `₹${total.toFixed(2)}` },
        { label: 'Per Person', value: `₹${pp.toFixed(2)}` },
      ]
    },
  },
  {
    id: 'split',
    title: 'Split Bill',
    icon: '✂️',
    fields: [
      { key: 'total', label: 'Total Amount', placeholder: '3600' },
      { key: 'people', label: 'Number of People', placeholder: '3' },
    ],
    calculate: ({ total, people }) => [
      { label: 'Per Person', value: `₹${(total / (people || 1)).toFixed(2)}` },
    ],
  },
  {
    id: 'emi',
    title: 'Loan EMI',
    icon: '🏦',
    fields: [
      { key: 'principal', label: 'Loan Amount (₹)', placeholder: '500000' },
      { key: 'rate', label: 'Interest Rate % (annual)', placeholder: '8.5' },
      { key: 'months', label: 'Tenure (months)', placeholder: '60' },
    ],
    calculate: ({ principal, rate, months }) => {
      const r = rate / 12 / 100
      const emi = r === 0 ? principal / months : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
      const total = emi * months
      return [
        { label: 'Monthly EMI', value: `₹${emi.toFixed(2)}` },
        { label: 'Total Payment', value: `₹${total.toFixed(2)}` },
        { label: 'Total Interest', value: `₹${(total - principal).toFixed(2)}` },
      ]
    },
  },
  {
    id: 'age',
    title: 'Age Calculator',
    icon: '🎂',
    fields: [{ key: 'year', label: 'Birth Year', placeholder: '1995' }],
    calculate: ({ year }) => {
      const now = new Date()
      const age = now.getFullYear() - year
      return [
        { label: 'Age', value: `${age} years` },
        { label: 'Days lived (~)', value: `${Math.round(age * 365.25).toLocaleString()} days` },
      ]
    },
  },
  {
    id: 'si',
    title: 'Simple Interest',
    icon: '📈',
    fields: [
      { key: 'p', label: 'Principal (₹)', placeholder: '10000' },
      { key: 'r', label: 'Rate % p.a.', placeholder: '6' },
      { key: 't', label: 'Time (years)', placeholder: '3' },
    ],
    calculate: ({ p, r, t }) => {
      const si = (p * r * t) / 100
      return [
        { label: 'Simple Interest', value: `₹${si.toFixed(2)}` },
        { label: 'Total Amount', value: `₹${(p + si).toFixed(2)}` },
      ]
    },
  },
  {
    id: 'ci',
    title: 'Compound Interest',
    icon: '📊',
    fields: [
      { key: 'p', label: 'Principal (₹)', placeholder: '10000' },
      { key: 'r', label: 'Rate % p.a.', placeholder: '8' },
      { key: 't', label: 'Time (years)', placeholder: '5' },
      { key: 'n', label: 'Compounding/year', placeholder: '12' },
    ],
    calculate: ({ p, r, t, n }) => {
      const ci = p * Math.pow(1 + r / (n * 100), n * t)
      return [
        { label: 'Maturity Amount', value: `₹${ci.toFixed(2)}` },
        { label: 'Compound Interest', value: `₹${(ci - p).toFixed(2)}` },
      ]
    },
  },
]

function ToolCard({ tool }: { tool: Tool }) {
  const [open, setOpen] = useState(false)
  const [vals, setVals] = useState<Record<string, string>>({})
  const [results, setResults] = useState<ToolResult[]>([])

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
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
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
                    className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-royal/50 transition-colors"
                  />
                </div>
              ))}
              <button
                onClick={compute}
                className="w-full py-2 rounded-lg text-sm font-medium text-white bg-royal/20 hover:bg-royal/35 border border-royal/25 transition-colors cursor-pointer mt-1"
              >
                Calculate
              </button>
              {results.length > 0 && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-white/6">
                  {results.map(r => (
                    <div key={r.label} className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">{r.label}</span>
                      <span className="text-sm font-semibold text-royal">{r.value}</span>
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

export function QuickTools() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="px-4 py-3 border-b border-white/6">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Tools</span>
      </div>
      <div className="p-2 space-y-1 max-h-105 overflow-y-auto">
        {TOOLS.map(t => <ToolCard key={t.id} tool={t} />)}
      </div>
    </div>
  )
}

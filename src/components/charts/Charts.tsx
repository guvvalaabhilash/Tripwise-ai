import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts'
import GlassCard from '@/components/ui/GlassCard'

// ─── Shared tooltip style ─────────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: 'rgba(8,12,30,0.97)',
  border: '1px solid rgba(79,124,255,0.18)',
  borderRadius: '12px',
  padding: '8px 14px',
  fontSize: '12px',
  color: '#e8edf5',
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
}

const axisTickStyle = { fill: '#6B7A93', fontSize: 11 }

// ─── Chart wrapper card ───────────────────────────────────────────────────────
interface ChartCardProps { title: string; children: React.ReactNode; className?: string }

export function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <GlassCard className={className}>
      <h3 className="text-sm font-semibold text-white mb-4 font-[family-name:var(--font-jakarta)]">
        {title}
      </h3>
      {children}
    </GlassCard>
  )
}

// ─── Daily Spending (Area) ────────────────────────────────────────────────────
export function DailySpendingChart({ data }: { data: { day: string; amount: number }[] }) {
  return (
    <ChartCard title="Daily Spending">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#4F7CFF" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#4F7CFF" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axisTickStyle} />
          <YAxis axisLine={false} tickLine={false} tick={axisTickStyle} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="amount" stroke="#4F7CFF" strokeWidth={2}
            fill="url(#spendGrad)" dot={false} animationDuration={900} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── Category breakdown (Donut/Pie) ──────────────────────────────────────────
export function CategoryChart({ data }: { data: { category: string; amount: number; color: string }[] }) {
  return (
    <ChartCard title="By Category">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={82}
            paddingAngle={3} dataKey="amount" animationDuration={900}
            stroke="none">
            {data.map(entry => (
              <Cell key={entry.category} fill={entry.color}
                style={{ filter: `drop-shadow(0 0 4px ${entry.color}80)` }} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
        {data.map(d => (
          <span key={d.category} className="flex items-center gap-1.5 text-[11px] text-[#AEB7C6]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
            {d.category}
          </span>
        ))}
      </div>
    </ChartCard>
  )
}

// ─── Budget Overview (Bar) ────────────────────────────────────────────────────
export function BudgetChart({ data }: { data: { month: string; budget: number; spent: number }[] }) {
  return (
    <ChartCard title="Budget Overview">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }} barGap={3}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTickStyle} />
          <YAxis axisLine={false} tickLine={false} tick={axisTickStyle} />
          <Tooltip contentStyle={tooltipStyle} />
          <defs>
            <linearGradient id="budgetBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F7CFF" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#4F7CFF" stopOpacity={0.06} />
            </linearGradient>
            <linearGradient id="spentBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F7CFF" />
              <stop offset="100%" stopColor="#6A5CFF" />
            </linearGradient>
          </defs>
          <Bar dataKey="budget" fill="url(#budgetBar)" radius={[5,5,0,0]} animationDuration={900} />
          <Bar dataKey="spent"  fill="url(#spentBar)"  radius={[5,5,0,0]} animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

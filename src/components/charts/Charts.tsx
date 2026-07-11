import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'

interface ChartCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <GlassCard className={className}>
      <h3 className="text-sm font-semibold text-white mb-4 font-jakarta">
        {title}
      </h3>
      {children}
    </GlassCard>
  )
}

const tooltipStyle = {
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '8px 12px',
  fontSize: '12px',
  color: '#e2e8f0',
}

interface DailySpendingChartProps {
  data: { day: string; amount: number }[]
}

export function DailySpendingChart({ data }: DailySpendingChartProps) {
  return (
    <ChartCard title="Daily Spending">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="spendingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b5bdb" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b5bdb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#3b5bdb"
            strokeWidth={2}
            fill="url(#spendingGrad)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface CategoryChartProps {
  data: { category: string; amount: number; color: string }[]
}

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <ChartCard title="By Category">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="amount"
            animationDuration={1000}
          >
            {data.map((entry) => (
              <Cell key={entry.category} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-2 mt-2">
        {data.map((d) => (
          <span key={d.category} className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.category}
          </span>
        ))}
      </div>
    </ChartCard>
  )
}

interface BudgetChartProps {
  data: { month: string; budget: number; spent: number }[]
}

export function BudgetChart({ data }: BudgetChartProps) {
  return (
    <ChartCard title="Budget Overview">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="budget" fill="rgba(59,91,219,0.2)" radius={[4, 4, 0, 0]} animationDuration={1000} />
          <Bar dataKey="spent" fill="#3b5bdb" radius={[4, 4, 0, 0]} animationDuration={1000} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

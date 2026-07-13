import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Receipt, Sparkles, ArrowRight, TrendingUp, Wallet, Map, Plus,
} from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { TripCard } from '@/components/TripCard'
import { ExpenseCard } from '@/components/ExpenseCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { BudgetChart } from '@/components/charts/Charts'
import { useAuthUser } from '@/hooks/useAuthUser'
import { useTrips } from '@/hooks/useTrips'
import { useExpenses } from '@/hooks/useExpenses'
import { buildBudgetOverview } from '@/lib/expenseStats'
import { useCountry } from '@/context/CountryContext'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
})

export default function DashboardPage() {
  const { user } = useAuthUser()
  const { trips, loading } = useTrips()
  const { formatAmount } = useCountry()

  const upcomingTrips = trips.filter((t) => t.status === 'upcoming')
  const totalBudget = trips.reduce((s, t) => s + t.budget, 0)
  const totalSpent = trips.reduce((sum, t) => sum + (t.spent || 0), 0)
  const remaining = Math.max(totalBudget - totalSpent, 0)
  const budgetPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
  const budgetOverview = buildBudgetOverview(trips)
  const firstName = user?.name?.split(' ')[0] || 'Traveler'

  const activeTrip = trips[0]
  const { expenses: recentExpenses, loading: expensesLoading } = useExpenses(activeTrip?.id)

  const statCards = [
    {
      label: 'Total Trips',
      value: loading ? '—' : String(trips.length),
      sub: 'All time trips',
      icon: Map,
      iconColor: '#4F7CFF',
      iconBg: 'rgba(79,124,255,0.12)',
    },
    {
      label: 'Total Budget',
      value: loading ? '—' : formatAmount(totalBudget),
      sub: 'Across all trips',
      icon: Wallet,
      iconColor: '#00C2FF',
      iconBg: 'rgba(0,194,255,0.1)',
    },
    {
      label: 'Total Spent',
      value: loading ? '—' : formatAmount(totalSpent),
      sub: `${budgetPct}% of budget`,
      icon: Receipt,
      iconColor: '#FFB547',
      iconBg: 'rgba(255,181,71,0.1)',
    },
    {
      label: 'Upcoming Trips',
      value: loading ? '—' : String(upcomingTrips.length),
      sub: upcomingTrips[0]?.destination ?? 'None planned',
      icon: TrendingUp,
      iconColor: '#19F28C',
      iconBg: 'rgba(25,242,140,0.1)',
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <motion.div {...fadeUp()} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-jakarta)]">
            Good Morning, {firstName} 👋
          </h1>
          <p className="text-[#AEB7C6] mt-1 text-sm">
            {loading
              ? 'Loading your trips...'
              : trips.length === 0
                ? 'Ready for your next adventure?'
                : `You have ${upcomingTrips.length} upcoming trip${upcomingTrips.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link to="/trip-planner">
          <Button size="sm">
            <Plus size={14} />
            New Trip
          </Button>
        </Link>
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} {...fadeUp(0.05 + i * 0.04)}>
              <div className="stat-card">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-[#AEB7C6] mb-1">{s.label}</p>
                    <p className="text-xl font-bold text-white font-[family-name:var(--font-jakarta)] truncate">{s.value}</p>
                    <p className="text-[11px] text-[#AEB7C6]/60 mt-1 truncate">{s.sub}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ml-2"
                    style={{ background: s.iconBg }}>
                    <Icon size={16} style={{ color: s.iconColor }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ── Main content ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Budget Overview */}
          <motion.div {...fadeUp(0.12)}>
            {budgetOverview.length > 0 ? (
              <GlassCard>
                <BudgetChart data={budgetOverview} />
              </GlassCard>
            ) : (
              <EmptyState
                title="No budget data yet"
                description="Your budget chart will appear once you create a trip."
              />
            )}
          </motion.div>

          {/* Recent Trips */}
          <motion.div {...fadeUp(0.16)}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white font-[family-name:var(--font-jakarta)]">Recent Trips</h2>
              <Link to="/trip-planner"
                className="text-xs text-[#4F7CFF] hover:text-[#7B9FFF] transition-colors flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-48 rounded-2xl shimmer" />
                ))}
              </div>
            ) : trips.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {trips.slice(0, 2).map((trip) => (
                  <Link key={trip.id} to={`/trips/${trip.id}`}>
                    <TripCard trip={trip} />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No trips yet"
                description="Plan your first trip and it will show up here."
                action={
                  <Link to="/trip-planner">
                    <Button size="sm"><Plus size={14} />Plan a Trip</Button>
                  </Link>
                }
              />
            )}
          </motion.div>

          {/* Recent Expenses */}
          <motion.div {...fadeUp(0.2)}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white font-[family-name:var(--font-jakarta)]">Recent Expenses</h2>
              <Link to="/expenses"
                className="text-xs text-[#4F7CFF] hover:text-[#7B9FFF] transition-colors flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {expensesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl shimmer" />)}
              </div>
            ) : recentExpenses.length > 0 ? (
              <div className="space-y-2">
                {recentExpenses.slice(0, 4).map((expense) => (
                  <Link key={expense.id} to="/expenses">
                    <ExpenseCard expense={expense} />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No expenses recorded"
                description="Add expenses from the Expenses page."
                action={
                  <Link to="/expenses">
                    <Button size="sm" variant="secondary">Add Expense</Button>
                  </Link>
                }
              />
            )}
          </motion.div>
        </div>

        {/* ── Right column (1/3) ── */}
        <div className="space-y-5">

          {/* Budget ring */}
          <motion.div {...fadeUp(0.1)}>
            <GlassCard>
              <h3 className="text-sm font-semibold text-white mb-4 font-[family-name:var(--font-jakarta)]">Budget Overview</h3>
              {totalBudget > 0 ? (
                <div className="flex items-center gap-4">
                  <ProgressRing value={totalSpent} max={totalBudget} size={100} strokeWidth={7} />
                  <div className="space-y-2 min-w-0">
                    <div>
                      <p className="text-[10px] text-[#AEB7C6]/60 uppercase tracking-wide">Spent</p>
                      <p className="text-base font-bold text-white">{formatAmount(totalSpent)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#AEB7C6]/60 uppercase tracking-wide">Remaining</p>
                      <p className="text-base font-bold text-[#19F28C]">{formatAmount(remaining)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#AEB7C6]/60 text-center py-4">No budget data</p>
              )}
            </GlassCard>
          </motion.div>

          {/* AI Suggestions */}
          <motion.div {...fadeUp(0.14)}>
            <GlassCard>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(79,124,255,0.12)' }}>
                  <Sparkles size={14} className="text-[#4F7CFF]" />
                </div>
                <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-jakarta)]">AI Suggestions</h3>
              </div>
              <EmptyState
                title="No suggestions yet"
                description="Create a trip and chat with AI to get personalized recommendations."
                className="py-6"
                action={
                  <Link to="/ai-chat">
                    <Button variant="ghost" size="sm">
                      Open AI Chat <ArrowRight size={13} />
                    </Button>
                  </Link>
                }
              />
            </GlassCard>
          </motion.div>

          {/* Upcoming Trips */}
          <motion.div {...fadeUp(0.18)}>
            <GlassCard>
              <h3 className="text-sm font-semibold text-white mb-4 font-[family-name:var(--font-jakarta)]">Upcoming Trips</h3>
              {upcomingTrips.length > 0 ? (
                <div className="space-y-2">
                  {upcomingTrips.slice(0, 3).map((trip) => (
                    <Link key={trip.id} to={`/trips/${trip.id}`}>
                      <TripCard trip={trip} variant="compact" />
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nothing scheduled"
                  description="Upcoming trips you create will appear here."
                  className="py-6"
                />
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

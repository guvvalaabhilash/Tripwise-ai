import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Receipt,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import GlassButton from '@/components/ui/GlassButton'
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

export default function DashboardPage() {
  const { user } = useAuthUser()
  const { trips, loading } = useTrips()
  const { formatAmount } = useCountry()

  const upcomingTrips = trips.filter((t) => t.status === 'upcoming')
  const totalBudget = trips.reduce((s, t) => s + t.budget, 0)
  const totalSpent = trips.reduce((sum, trip) => sum + (trip.spent || 0), 0)
  const budgetOverview = buildBudgetOverview(trips)
  const firstName = user?.name?.split(' ')[0] || 'Traveler'

  // Show expenses for the most recent trip on the dashboard
  const activeTrip = trips[0]
  const { expenses: recentExpenses, loading: expensesLoading } = useExpenses(activeTrip?.id)

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white font-jakarta">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-slate-400 mt-1">
            {loading
              ? 'Loading your trips...'
              : trips.length === 0
                ? 'Create your first trip to get started'
                : `You have ${upcomingTrips.length} upcoming trip${upcomingTrips.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link to="/trip-planner">
          <GlassButton>
            Plan New Trip
          </GlassButton>
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Total Budget</p>
                  <p className="text-2xl font-bold text-white mt-1">{formatAmount(totalBudget)}</p>
                </div>
                <TrendingUp size={20} className="text-royal-light" />
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Total Spent</p>
                  <p className="text-2xl font-bold text-white mt-1">{formatAmount(totalSpent)}</p>
                </div>
                <Receipt size={20} className="text-orange-400" />
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Remaining</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {formatAmount(Math.max(totalBudget - totalSpent, 0))}
                  </p>
                </div>
                {totalBudget > 0 && (
                  <ProgressRing value={totalSpent} max={totalBudget} size={48} strokeWidth={4} />
                )}
              </div>
            </GlassCard>
          </div>

          {budgetOverview.length > 0 ? (
            <GlassCard className="p-4">
              <BudgetChart data={budgetOverview} />
            </GlassCard>
          ) : (
            <EmptyState
              title="No budget data yet"
              description="Your budget chart will appear once you create a trip."
            />
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white font-jakarta">Your Trips</h2>
              <Link to="/trip-planner" className="text-sm text-royal-light hover:text-cyan transition-colors">
                View all →
              </Link>
            </div>
            {trips.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {trips.slice(0, 2).map((trip) => (
                  <Link key={trip.id} to={`/trips/${trip.id}`}>
                    <GlassCard className="p-0 overflow-hidden">
                      <TripCard trip={trip} />
                    </GlassCard>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No trips yet"
                description="Plan your first trip and it will show up here."
                action={
                  <Link to="/trip-planner">
                    <GlassButton size="sm">Plan a Trip</GlassButton>
                  </Link>
                }
              />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white font-jakarta">Recent Expenses</h2>
              <Link to="/expenses" className="text-sm text-royal-light hover:text-cyan transition-colors">
                View all →
              </Link>
            </div>
            {expensesLoading ? (
              <EmptyState title="Loading expenses..." />
            ) : recentExpenses.length > 0 ? (
              <div className="space-y-3">
                {recentExpenses.slice(0, 3).map((expense) => (
                  <Link key={expense.id} to="/expenses">
                    <GlassCard className="p-0 overflow-hidden">
                      <ExpenseCard expense={expense} />
                    </GlassCard>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No expenses recorded"
                description="Add expenses from the Expenses page."
                action={
                  <Link to="/expenses">
                    <GlassButton size="sm">Add Expense</GlassButton>
                  </Link>
                }
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-royal-light" />
              <h3 className="text-sm font-semibold text-white font-jakarta">AI Suggestions</h3>
            </div>
            <EmptyState
              title="No suggestions yet"
              description="Create a trip and chat with AI to get personalized recommendations."
              className="py-8"
              action={
                <Link to="/ai-chat">
                  <Button variant="ghost" size="sm">
                    Open AI Chat
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              }
            />
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-4 font-jakarta">Upcoming Trips</h3>
            {upcomingTrips.length > 0 ? (
              <div className="space-y-3">
                {upcomingTrips.map((trip) => (
                  <Link key={trip.id} to={`/trips/${trip.id}`}>
                    <TripCard trip={trip} variant="compact" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nothing scheduled"
                description="Upcoming trips you create will appear here."
                className="py-8"
              />
            )}
          </GlassCard>

          <EmptyState
            title="Spending chart unavailable"
            description="Daily spending will appear after you add expenses."
            className="py-8"
          />
        </div>
      </div>
    </div>
  )
}

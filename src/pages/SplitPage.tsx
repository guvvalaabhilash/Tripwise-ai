import { Link } from 'react-router-dom'
import { Users, ArrowRight, CheckCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { useTrips } from '@/hooks/useTrips'
import { useExpenses } from '@/hooks/useExpenses'
import { useAuthUser } from '@/hooks/useAuthUser'
import { useCountry } from '@/context/CountryContext'

interface MemberSplit {
  userId: string
  name: string
  paid: number
  fairShare: number
  balance: number // positive = owed money, negative = owes money
}

interface Settlement {
  from: string
  to: string
  amount: number
}

function computeSplits(
  expenses: { paidBy: string; paidByName: string; amount: number; splitBetween: string[] }[],
  currentUserId: string,
  currentUserName: string,
): { members: MemberSplit[]; settlements: Settlement[] } {
  const paidMap: Record<string, { name: string; paid: number }> = {}
  const owedMap: Record<string, number> = {}

  // Ensure the current user always appears
  paidMap[currentUserId] = { name: currentUserName, paid: 0 }
  owedMap[currentUserId] = 0

  for (const expense of expenses) {
    // Track who paid
    if (!paidMap[expense.paidBy]) {
      paidMap[expense.paidBy] = { name: expense.paidByName, paid: 0 }
    }
    paidMap[expense.paidBy].paid += expense.amount

    // Split evenly among members listed
    const split = expense.splitBetween.length > 0 ? expense.splitBetween : [expense.paidBy]
    const share = expense.amount / split.length
    for (const uid of split) {
      if (!owedMap[uid]) owedMap[uid] = 0
      owedMap[uid] += share
      if (!paidMap[uid]) paidMap[uid] = { name: uid, paid: 0 }
    }
  }

  const members: MemberSplit[] = Object.keys(paidMap).map((uid) => {
    const paid = paidMap[uid].paid
    const fairShare = owedMap[uid] || 0
    return {
      userId: uid,
      name: paidMap[uid].name,
      paid,
      fairShare,
      balance: paid - fairShare, // positive = net creditor, negative = net debtor
    }
  })

  // Greedy settlement algorithm
  const creditors = members.filter((m) => m.balance > 0.01).map((m) => ({ ...m }))
  const debtors = members.filter((m) => m.balance < -0.01).map((m) => ({ ...m }))
  const settlements: Settlement[] = []

  for (const debtor of debtors) {
    let remaining = Math.abs(debtor.balance)
    for (const creditor of creditors) {
      if (remaining < 0.01) break
      if (creditor.balance < 0.01) continue
      const amount = Math.min(remaining, creditor.balance)
      settlements.push({ from: debtor.name, to: creditor.name, amount })
      creditor.balance -= amount
      remaining -= amount
    }
  }

  return { members, settlements }
}

export default function SplitPage() {
  const { trips, loading } = useTrips()
  const { user } = useAuthUser()
  const { formatAmount } = useCountry()
  const activeTrip = trips[0]

  const { expenses, loading: expensesLoading } = useExpenses(activeTrip?.id)

  if (loading || expensesLoading) {
    return <EmptyState title="Loading..." />
  }

  if (!activeTrip) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white font-jakarta">Expense Split</h1>
        <EmptyState
          title="Create a trip first"
          description="Expense splitting becomes available once you have a trip and recorded expenses."
          action={
            <Link to="/trip-planner">
              <Button size="sm">Plan a Trip</Button>
            </Link>
          }
        />
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-jakarta">Expense Split</h1>
          <p className="text-slate-400 mt-1">{activeTrip.name}</p>
        </div>
        <GlassCard>
          <EmptyState
            title="No expenses to split"
            description="Add expenses and invite members to calculate contributions and settlements."
            action={
              <Link to="/expenses">
                <Button size="sm">Add Expenses</Button>
              </Link>
            }
          />
        </GlassCard>
      </div>
    )
  }

  const { members, settlements } = computeSplits(
    expenses,
    user?.id || '',
    user?.name || 'You',
  )

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-jakarta">Expense Split</h1>
        <p className="text-slate-400 mt-1">{activeTrip.name}</p>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard glow="royal">
          <p className="text-xs text-slate-400">Total Expenses</p>
          <p className="text-2xl font-bold text-white mt-1">{formatAmount(totalExpenses)}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs text-slate-400">Participants</p>
          <p className="text-2xl font-bold text-white mt-1">{members.length}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs text-slate-400">Settlements Needed</p>
          <p className="text-2xl font-bold text-white mt-1">{settlements.length}</p>
        </GlassCard>
      </div>

      {/* Member contributions */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-royal-light" />
          <h2 className="text-sm font-semibold text-white">Member Contributions</h2>
        </div>
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.userId} className="flex items-center gap-4">
              <Avatar name={member.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{member.name}</p>
                <div className="flex gap-4 mt-0.5">
                  <span className="text-xs text-slate-400">
                    Paid: <span className="text-white">{formatAmount(member.paid)}</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    Share: <span className="text-white">{formatAmount(member.fairShare)}</span>
                  </span>
                </div>
              </div>
              <span
                className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                  member.balance > 0.01
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : member.balance < -0.01
                      ? 'bg-red-500/15 text-red-400'
                      : 'bg-white/5 text-slate-400'
                }`}
              >
                {member.balance > 0.01
                  ? `+${formatAmount(member.balance)}`
                  : member.balance < -0.01
                    ? `-${formatAmount(Math.abs(member.balance))}`
                    : 'Settled'}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Settlements */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={18} className="text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Who Owes Whom</h2>
        </div>
        {settlements.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            Everyone is settled up! 🎉
          </p>
        ) : (
          <div className="space-y-3">
            {settlements.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/6"
              >
                <span className="text-sm font-medium text-red-400 min-w-[80px] truncate">{s.from}</span>
                <ArrowRight size={14} className="text-slate-500 shrink-0" />
                <span className="text-sm font-medium text-emerald-400 flex-1 truncate">{s.to}</span>
                <span className="text-sm font-bold text-white">{formatAmount(s.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}

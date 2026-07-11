import { EXPENSE_CATEGORIES } from '@/constants'
import type { Expense } from '@/types'

export function buildCategorySpending(expenses: Expense[]) {
  return EXPENSE_CATEGORIES.map((cat) => ({
    category: cat.label,
    amount: expenses
      .filter((e) => e.category === cat.value)
      .reduce((sum, e) => sum + e.amount, 0),
    color: cat.color,
  })).filter((item) => item.amount > 0)
}

export function buildDailySpending(expenses: Expense[]) {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const totals = new Array(7).fill(0)

  expenses.forEach((expense) => {
    const day = new Date(expense.date).getDay()
    totals[day] += expense.amount
  })

  return dayLabels.map((day, index) => ({
    day,
    amount: totals[index],
  }))
}

export function buildBudgetOverview(trips: { budget: number; spent: number; startDate: string }[]) {
  return trips.slice(0, 6).map((trip) => ({
    month: new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short' }),
    budget: trip.budget,
    spent: trip.spent,
  }))
}

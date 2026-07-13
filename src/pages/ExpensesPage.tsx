import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExpenseCard } from '@/components/ExpenseCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { CategoryChart, DailySpendingChart } from '@/components/charts/Charts'
import { Toast } from '@/components/ui/Toast'
import { EXPENSE_CATEGORIES } from '@/constants'
import { useAuthUser } from '@/hooks/useAuthUser'
import { useTrips } from '@/hooks/useTrips'
import { useExpenses } from '@/hooks/useExpenses'
import { createExpense, updateExpense, deleteExpense } from '@/lib/expenses'
import { buildCategorySpending, buildDailySpending } from '@/lib/expenseStats'
import { useCountry } from '@/context/CountryContext'
import type { Expense, ExpenseCategory, ExpenseFormData } from '@/types'

export default function ExpensesPage() {
  const { user } = useAuthUser()
  const { trips, loading: tripsLoading } = useTrips()
  const { formatAmount } = useCountry()
  const activeTrip = trips[0]

  const { expenses, loading: expensesLoading } = useExpenses(activeTrip?.id)

  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>(
    { visible: false, message: '', type: 'success' },
  )

  const [form, setForm] = useState<ExpenseFormData>({
    title: '',
    amount: 0,
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    paidBy: user?.id || '',
    splitBetween: user ? [user.id] : [],
  })

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type })
  }

  const resetForm = () => {
    setForm({
      title: '',
      amount: 0,
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      paidBy: user?.id || '',
      splitBetween: user ? [user.id] : [],
    })
  }

  const filtered =
    categoryFilter === 'all'
      ? expenses
      : expenses.filter((e) => e.category === categoryFilter)

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const categorySpending = buildCategorySpending(expenses)
  const dailySpending = buildDailySpending(expenses)

  const handleAdd = async () => {
    if (!activeTrip || !user) return
    if (!form.title || !form.amount) {
      showToast('Please fill in all required fields.', 'error')
      return
    }

    setSaving(true)
    const result = await createExpense({
      tripId: activeTrip.id,
      userId: user.id,
      title: form.title,
      amount: form.amount,
      category: form.category,
      date: form.date,
      paidBy: user.id,
      paidByName: user.name,
      splitBetween: [user.id],
    })
    setSaving(false)

    if (!result) {
      showToast('Failed to add expense. Please try again.', 'error')
      return
    }

    setShowAddModal(false)
    resetForm()
    showToast('Expense added successfully!')
  }

  const handleEdit = async () => {
    if (!editingExpense || !activeTrip) return

    setSaving(true)
    const result = await updateExpense(editingExpense.id, activeTrip.id, {
      title: form.title,
      amount: form.amount,
      category: form.category,
      date: form.date,
    })
    setSaving(false)

    if (!result) {
      showToast('Failed to update expense. Please try again.', 'error')
      return
    }

    setShowEditModal(false)
    setEditingExpense(null)
    resetForm()
    showToast('Expense updated!')
  }

  const handleDelete = async (expense: Expense) => {
    if (!activeTrip) return
    setSaving(true)
    const ok = await deleteExpense(expense.id, activeTrip.id)
    setSaving(false)
    if (!ok) {
      showToast('Failed to delete expense.', 'error')
      return
    }
    setShowEditModal(false)
    setEditingExpense(null)
    showToast('Expense deleted.')
  }

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      paidBy: expense.paidBy,
      splitBetween: expense.splitBetween,
    })
    setShowEditModal(true)
  }

  const expenseForm = (
    <div className="space-y-4">
      <Input
        label="Title"
        placeholder="e.g. Dinner at restaurant"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <Input
        label="Amount"
        type="number"
        placeholder="0"
        value={form.amount || ''}
        onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
      />
      <Select
        label="Category"
        value={form.category}
        onChange={(v) => setForm({ ...form, category: v as ExpenseCategory })}
        options={EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
      />
      <Input
        label="Date"
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />
    </div>
  )

  if (tripsLoading || expensesLoading) {
    return <EmptyState title="Loading expenses..." />
  }

  if (!activeTrip) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white font-jakarta">Expenses</h1>
        <EmptyState
          title="Create a trip first"
          description="You need at least one trip before you can track expenses."
          action={
            <Link to="/trip-planner">
              <Button size="sm">Plan a Trip</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-jakarta">Expenses</h1>
          <p className="text-slate-400 mt-1">
            {activeTrip.name} — {formatAmount(totalSpent)} spent
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          Add Expense
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard glow="royal" className="flex items-center gap-6">
          <ProgressRing value={totalSpent} max={activeTrip.budget || 1} label="Budget Used" />
          <div>
            <p className="text-xs text-slate-400">Remaining Budget</p>
            <p className="text-2xl font-bold text-emerald-400">
              {formatAmount(Math.max(activeTrip.budget - totalSpent, 0))}
            </p>
            <p className="text-xs text-slate-500 mt-1">of {formatAmount(activeTrip.budget)}</p>
          </div>
        </GlassCard>
        {expenses.length > 0 ? (
          <>
            <DailySpendingChart data={dailySpending} />
            <CategoryChart data={categorySpending} />
          </>
        ) : (
          <GlassCard className="md:col-span-2">
            <EmptyState
              title="No chart data yet"
              description="Add your first expense to see spending breakdowns."
              className="py-8"
            />
          </GlassCard>
        )}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-[#AEB7C6]" />
        {['all', ...EXPENSE_CATEGORIES.map(c => c.value)].map(cat => {
          const label = cat === 'all' ? 'All' : EXPENSE_CATEGORIES.find(c => c.value === cat)?.label ?? cat
          const isActive = categoryFilter === cat
          return (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={isActive ? {
                background: 'rgba(79,124,255,0.15)', color: '#7B9FFF',
                border: '1px solid rgba(79,124,255,0.3)',
              } : { color: '#AEB7C6', border: '1px solid transparent' }}>
              {label}
            </button>
          )
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((expense, i) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ExpenseCard expense={expense} onClick={() => openEdit(expense)} />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No expenses yet"
          description="Expenses you add will appear here for this trip."
          action={
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              Add Expense
            </Button>
          }
        />
      )}

      {/* Add modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Expense">
        {expenseForm}
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            className="flex-1"
            disabled={!form.title || !form.amount}
            loading={saving}
          >
            Add Expense
          </Button>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Expense">
        {expenseForm}
        <div className="flex gap-3 mt-6">
          <Button
            variant="danger"
            onClick={() => editingExpense && handleDelete(editingExpense)}
            loading={saving}
          >
            <Trash2 size={14} />
          </Button>
          <Button
            variant="secondary"
            onClick={() => { setShowEditModal(false); setEditingExpense(null) }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleEdit} className="flex-1" loading={saving}>
            Save Changes
          </Button>
        </div>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  )
}

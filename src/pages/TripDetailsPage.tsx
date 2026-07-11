import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin,
  Calendar,
  Users,
  Map,
  Hotel,
  Car,
  Receipt,
  ArrowLeft,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import { fetchTripById, updateTripDates } from '@/lib/trips'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Tabs } from '@/components/ui/Tabs'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExpenseCard } from '@/components/ExpenseCard'
import { Toast } from '@/components/ui/Toast'
import { CategoryChart } from '@/components/charts/Charts'
import { useAuthUser } from '@/hooks/useAuthUser'
import { useExpenses } from '@/hooks/useExpenses'
import { buildCategorySpending } from '@/lib/expenseStats'
import { formatShortDate } from '@/lib/utils'
import { useCountry } from '@/context/CountryContext'
import type { Trip } from '@/types'
import { ACCOMMODATION_OPTIONS, TRANSPORT_OPTIONS } from '@/constants'

export default function TripDetailsPage() {
  const { formatAmount } = useCountry()
  const { user } = useAuthUser()
  const { id } = useParams()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('itinerary')

  // ── Date editing state ────────────────────────────────────────────────────
  const [editingDates, setEditingDates] = useState(false)
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const [savingDates, setSavingDates] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false, message: '', type: 'success',
  })

  const { expenses, loading: expensesLoading } = useExpenses(id)
  const categorySpending = buildCategorySpending(expenses)
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)

  useEffect(() => {
    const loadTrip = async () => {
      if (!id || !user) { setLoading(false); return }
      const data = await fetchTripById(id, user.id)
      setTrip(data)
      setLoading(false)
    }
    loadTrip()
  }, [id, user])

  const openDateEdit = () => {
    if (!trip) return
    setEditStart(trip.startDate)
    setEditEnd(trip.endDate)
    setDateError(null)
    setEditingDates(true)
  }

  const cancelDateEdit = () => {
    setEditingDates(false)
    setDateError(null)
  }

  const saveDates = async () => {
    if (!trip || !user) return

    if (!editStart || !editEnd) {
      setDateError('Both dates are required.')
      return
    }
    if (editEnd < editStart) {
      setDateError('End date must be after start date.')
      return
    }

    setSavingDates(true)
    setDateError(null)

    const updated = await updateTripDates(trip.id, user.id, editStart, editEnd)
    setSavingDates(false)

    if (!updated) {
      setDateError('Failed to save. Please try again.')
      return
    }

    setTrip(updated)
    setEditingDates(false)
    setToast({ visible: true, message: 'Trip dates updated!', type: 'success' })
  }

  const tabs = [
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'budget', label: 'Budget' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'members', label: 'Members' },
  ]

  if (loading) return <EmptyState title="Loading trip..." />

  if (!trip) {
    return (
      <div className="space-y-4">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <EmptyState
          title="Trip not found"
          description="This trip may have been removed or you do not have access to it."
          action={<Link to="/dashboard"><Button size="sm">Go to Dashboard</Button></Link>}
        />
      </div>
    )
  }

  const transportLabel =
    TRANSPORT_OPTIONS.find((t) => t.value === trip.transport)?.label || trip.transport || 'Not set'
  const accommodationLabel =
    ACCOMMODATION_OPTIONS.find((a) => a.value === trip.accommodation)?.label ||
    trip.accommodation || 'Not set'

  // Duration in days
  const durationDays = trip.startDate && trip.endDate
    ? Math.max(1, Math.round(
        (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000,
      ) + 1)
    : null

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden h-48 md:h-64">
        <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-navy via-navy/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
            {trip.status}
          </span>
          <h1 className="text-3xl font-bold text-white mt-2 font-jakarta">{trip.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-300">
            <span className="flex items-center gap-1"><MapPin size={14} />{trip.destination}</span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatShortDate(trip.startDate)} – {formatShortDate(trip.endDate)}
              {durationDays && <span className="text-slate-400 ml-1">({durationDays}d)</span>}
            </span>
            <span className="flex items-center gap-1"><Users size={14} />{trip.travelers} travelers</span>
          </div>
        </div>
      </div>

      {/* ── Editable dates card ──────────────────────────────────────────────── */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={17} className="text-royal-light" />
            <h2 className="text-sm font-semibold text-white">Trip Dates</h2>
          </div>
          {!editingDates && (
            <button
              onClick={openDateEdit}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5 border border-white/8 cursor-pointer"
            >
              <Pencil size={12} />
              Edit
            </button>
          )}
        </div>

        {editingDates ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Start date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Start Date</label>
                <input
                  type="date"
                  value={editStart}
                  onChange={(e) => { setEditStart(e.target.value); setDateError(null) }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-royal/50 focus:ring-2 focus:ring-royal/20 transition-all [color-scheme:dark]"
                />
              </div>
              {/* End date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">End Date</label>
                <input
                  type="date"
                  value={editEnd}
                  min={editStart || undefined}
                  onChange={(e) => { setEditEnd(e.target.value); setDateError(null) }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-royal/50 focus:ring-2 focus:ring-royal/20 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Duration preview */}
            {editStart && editEnd && editEnd >= editStart && (
              <p className="text-xs text-slate-400">
                Duration:{' '}
                <span className="text-white font-medium">
                  {Math.round(
                    (new Date(editEnd).getTime() - new Date(editStart).getTime()) / 86400000,
                  ) + 1}{' '}
                  days
                </span>
              </p>
            )}

            {/* Error */}
            {dateError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {dateError}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={cancelDateEdit} disabled={savingDates}>
                <X size={13} />
                Cancel
              </Button>
              <Button size="sm" onClick={saveDates} loading={savingDates}>
                <Check size={13} />
                Save Dates
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/4 border border-white/8">
              <p className="text-xs text-slate-500 mb-1">Start Date</p>
              <p className="text-sm font-medium text-white">{formatShortDate(trip.startDate)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/4 border border-white/8">
              <p className="text-xs text-slate-500 mb-1">End Date</p>
              <p className="text-sm font-medium text-white">{formatShortDate(trip.endDate)}</p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Budget stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <GlassCard>
          <p className="text-xs text-slate-400">Budget</p>
          <p className="text-xl font-bold text-white mt-1">{formatAmount(trip.budget)}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs text-slate-400">Spent</p>
          <p className="text-xl font-bold text-orange-400 mt-1">{formatAmount(totalSpent)}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs text-slate-400">Remaining</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">
            {formatAmount(Math.max(trip.budget - totalSpent, 0))}
          </p>
        </GlassCard>
        <GlassCard className="flex items-center justify-center">
          <ProgressRing value={totalSpent} max={trip.budget || 1} label="Budget Used" />
        </GlassCard>
      </div>

      {/* Info cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-royal/20">
            <Map size={24} className="text-royal" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Interactive Map</p>
            <p className="text-xs text-slate-400">Coming soon</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/20">
            <Hotel size={24} className="text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Accommodation</p>
            <p className="text-xs text-slate-400">{accommodationLabel}</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/20">
            <Car size={24} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Transport</p>
            <p className="text-xs text-slate-400">{transportLabel}</p>
          </div>
        </GlassCard>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'itinerary' && (
          <EmptyState
            title="No itinerary yet"
            description="Your AI-generated itinerary will appear here once connected."
          />
        )}

        {activeTab === 'budget' && (
          <div className="space-y-4">
            {categorySpending.length > 0 ? (
              <>
                <CategoryChart data={categorySpending} />
                <div className="space-y-2">
                  {categorySpending.map((item) => (
                    <GlassCard key={item.category} padding="sm" className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-slate-300">{item.category}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{formatAmount(item.amount)}</span>
                    </GlassCard>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                title="No budget breakdown yet"
                description="Add expenses to see how your budget is allocated by category."
              />
            )}
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-slate-400">
                {expensesLoading ? 'Loading…' : `${expenses.length} expense${expenses.length === 1 ? '' : 's'}`}
              </p>
              <Link to="/expenses">
                <Button size="sm" variant="secondary">
                  <Receipt size={14} />
                  Manage Expenses
                </Button>
              </Link>
            </div>
            {expensesLoading ? (
              <EmptyState title="Loading expenses..." />
            ) : expenses.length > 0 ? (
              expenses.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))
            ) : (
              <EmptyState
                title="No expenses for this trip"
                description="Track spending from the Expenses page."
                action={<Link to="/expenses"><Button size="sm">Add Expense</Button></Link>}
              />
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="grid md:grid-cols-2 gap-4">
            {user && (
              <GlassCard padding="sm" className="flex items-center gap-4">
                <Avatar src={user.avatar} name={user.name} size="lg" />
                <div>
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </GlassCard>
            )}
            <GlassCard padding="sm" className="flex items-center justify-center border-dashed cursor-pointer hover:border-royal/30">
              <Button variant="ghost" size="sm">
                <Users size={16} />
                Invite Member
              </Button>
            </GlassCard>
          </div>
        )}
      </motion.div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  )
}

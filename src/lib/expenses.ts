import { supabase } from '@/lib/supabase'
import { insertNotification } from '@/lib/notifications'
import type { Expense, ExpenseCategory } from '@/types'

export function mapExpenseFromSupabase(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    tripId: row.trip_id as string,
    title: row.title as string,
    amount: Number(row.amount ?? 0),
    category: row.category as ExpenseCategory,
    date: (row.expense_date as string) || (row.date as string),
    paidBy: (row.paid_by as string) || '',
    paidByName: (row.paid_by_name as string) || 'Unknown',
    splitBetween: (row.split_between as string[]) || [],
    status: (row.status as 'paid' | 'pending') || 'paid',
  }
}

export async function fetchExpensesByTrip(tripId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('expense_date', { ascending: false })

  if (error || !data) return []
  return data.map((row) => mapExpenseFromSupabase(row))
}

export async function fetchRecentExpenses(userId: string, limit = 5): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data.map((row) => mapExpenseFromSupabase(row))
}

export interface CreateExpensePayload {
  tripId: string
  userId: string
  title: string
  amount: number
  category: ExpenseCategory
  date: string
  paidBy: string
  paidByName: string
  splitBetween: string[]
}

export async function createExpense(payload: CreateExpensePayload): Promise<Expense | null> {
  const { data, error } = await supabase
    .from('expenses')
    .insert([
      {
        trip_id: payload.tripId,
        user_id: payload.userId,
        title: payload.title,
        amount: payload.amount,
        category: payload.category,
        expense_date: payload.date,
        paid_by: payload.paidBy,
        paid_by_name: payload.paidByName,
        split_between: payload.splitBetween,
        status: 'paid',
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('[createExpense] Supabase error:', error.message, error.details, error.hint)
    return null
  }
  if (!data) return null

  // Update the trip's spent amount
  await recalcTripSpent(payload.tripId)

  // DB trigger (notify_on_expense_insert) already fires a notification on insert,
  // so no need to call insertNotification here.

  return mapExpenseFromSupabase(data)
}

export interface UpdateExpensePayload {
  title: string
  amount: number
  category: ExpenseCategory
  date: string
}

export async function updateExpense(
  expenseId: string,
  tripId: string,
  payload: UpdateExpensePayload,
): Promise<Expense | null> {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      title: payload.title,
      amount: payload.amount,
      category: payload.category,
      expense_date: payload.date,
    })
    .eq('id', expenseId)
    .select()
    .single()

  if (error || !data) return null

  await recalcTripSpent(tripId)

  // No DB trigger for expense updates — notify from app side
  const userId = (data as Record<string, unknown>).user_id as string | undefined
  if (userId) {
    void insertNotification(
      userId,
      '✏️ Expense Updated',
      `"${payload.title}" has been updated.`,
      'info',
    )
  }

  return mapExpenseFromSupabase(data)
}

export async function deleteExpense(expenseId: string, tripId: string): Promise<boolean> {
  const { error } = await supabase.from('expenses').delete().eq('id', expenseId)

  if (error) return false

  await recalcTripSpent(tripId)

  // DB trigger (notify_on_expense_delete) fires the notification on delete.

  return true
}

/** Recompute and update trips.spent by summing all expenses for a trip */
async function recalcTripSpent(tripId: string) {
  const { data } = await supabase
    .from('expenses')
    .select('amount')
    .eq('trip_id', tripId)

  const total = (data || []).reduce((sum, row) => sum + Number(row.amount), 0)

  await supabase.from('trips').update({ spent: total }).eq('id', tripId)
}

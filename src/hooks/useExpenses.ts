import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchExpensesByTrip, mapExpenseFromSupabase } from '@/lib/expenses'
import type { Expense } from '@/types'

/**
 * Fetch and subscribe to expenses for a single trip in real time.
 * Returns { expenses, loading, refresh }.
 */
export function useExpenses(tripId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!tripId) {
      setExpenses([])
      setLoading(false)
      return
    }
    setLoading(true)
    const data = await fetchExpensesByTrip(tripId)
    setExpenses(data)
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Realtime subscription — keep the list in sync without a full refetch
  useEffect(() => {
    if (!tripId) return

    const channel = supabase
      .channel(`expenses:trip_id=eq.${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newExpense = mapExpenseFromSupabase(
              payload.new as Record<string, unknown>,
            )
            setExpenses((prev) => [newExpense, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapExpenseFromSupabase(
              payload.new as Record<string, unknown>,
            )
            setExpenses((prev) =>
              prev.map((e) => (e.id === updated.id ? updated : e)),
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id
            setExpenses((prev) => prev.filter((e) => e.id !== deletedId))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tripId])

  return { expenses, loading, refresh }
}

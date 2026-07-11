import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchUserTrips, mapTripFromSupabase } from '@/lib/trips'
import type { Trip } from '@/types'

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setTrips([])
      setLoading(false)
      return
    }

    setUserId(user.id)
    const data = await fetchUserTrips(user.id)
    setTrips(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Realtime subscription — keeps trips (especially `spent`) up to date
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`trips:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTrip = mapTripFromSupabase(payload.new as Record<string, unknown>)
            setTrips((prev) => [newTrip, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapTripFromSupabase(payload.new as Record<string, unknown>)
            setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id
            setTrips((prev) => prev.filter((t) => t.id !== deletedId))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { trips, loading, refresh }
}

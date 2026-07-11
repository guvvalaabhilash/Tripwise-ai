import { supabase } from '@/lib/supabase'
import type { Trip } from '@/types'

const DEFAULT_TRIP_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop'

export function mapTripFromSupabase(row: Record<string, unknown>): Trip {
  const status = row.status as string
  return {
    id: row.id as string,
    name: row.trip_name as string,
    destination: row.destination as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    budget: Number(row.budget ?? 0),
    spent: Number(row.spent ?? 0),
    travelers: Number(row.travelers ?? 1),
    status: status === 'planned' ? 'upcoming' : (status as Trip['status']),
    transport: row.transport as string | undefined,
    accommodation: row.accommodation as string | undefined,
    foodPreference: row.food_preference as string | undefined,
    image: (row.image as string) || DEFAULT_TRIP_IMAGE,
    members: [],
  }
}

export async function fetchUserTrips(userId: string): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data.map((row) => mapTripFromSupabase(row))
}

export async function fetchTripById(tripId: string, userId: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null
  return mapTripFromSupabase(data)
}

export async function updateTripDates(
  tripId: string,
  userId: string,
  startDate: string,
  endDate: string,
): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('trips')
    .update({ start_date: startDate, end_date: endDate })
    .eq('id', tripId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) return null
  return mapTripFromSupabase(data)
}

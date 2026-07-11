import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types'

// ─── Map a raw Supabase row → Notification ────────────────────────────────────
function mapRow(row: Record<string, unknown>): Notification {
  const createdAt = new Date(row.created_at as string)
  const now = new Date()
  const diffMs = now.getTime() - createdAt.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  let time: string
  if (diffMin < 1)        time = 'Just now'
  else if (diffMin < 60)  time = `${diffMin}m ago`
  else if (diffHr < 24)   time = `${diffHr}h ago`
  else if (diffDay === 1) time = 'Yesterday'
  else                    time = createdAt.toLocaleDateString()

  const rawType = row.type as string
  const type: Notification['type'] =
    rawType === 'expense' ? 'expense' :
    rawType === 'success' ? 'success' :
    rawType === 'warning' ? 'warning' : 'info'

  return {
    id:      row.id as string,
    title:   row.title as string,
    message: row.message as string,
    time,
    type,
    read:    row.read as boolean,
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading]             = useState(true)
  const [userId, setUserId]               = useState<string | null>(null)

  // ── Initial fetch ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setNotifications([]); setLoading(false); return }

    setUserId(user.id)
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[Notifications] Fetch error:', error.message)
      setLoading(false)
      return
    }
    setNotifications((data || []).map(r => mapRow(r as Record<string, unknown>)))
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Realtime subscription ──────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`notifications:user_id=eq.${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const n = mapRow(payload.new as Record<string, unknown>)
          setNotifications(prev => [n, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          const n = mapRow(payload.new as Record<string, unknown>)
          setNotifications(prev => prev.map(x => x.id === n.id ? n : x))
        } else if (payload.eventType === 'DELETE') {
          const id = (payload.old as { id: string }).id
          setNotifications(prev => prev.filter(x => x.id !== id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // ── Mark one as read ───────────────────────────────────────────────────────
  const markRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
    if (error) console.error('[Notifications] markRead error:', error.message)
  }, [])

  // ── Mark all as read ───────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    if (!userId) return
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    if (error) console.error('[Notifications] markAllRead error:', error.message)
  }, [userId])

  // ── Clear all ──────────────────────────────────────────────────────────────
  const clearAll = useCallback(async () => {
    setNotifications([])
    if (!userId) return
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
    if (error) {
      console.error('[Notifications] clearAll error:', error.message)
      fetchAll() // re-fetch to restore state if delete failed
    }
  }, [userId, fetchAll])

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, loading, unreadCount, markRead, markAllRead, clearAll }
}

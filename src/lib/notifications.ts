/**
 * Notification helpers — insert notifications into the existing
 * `notifications` table in Supabase.
 *
 * These are fire-and-forget calls added after successful operations.
 * Failures are silently logged and never disrupt the calling operation.
 */
import { supabase } from '@/lib/supabase'

export type NotificationType = 'info' | 'success' | 'warning' | 'expense'

export async function insertNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'info',
): Promise<void> {
  const { error } = await supabase.from('notifications').insert([
    { user_id: userId, title, message, type, read: false },
  ])
  if (error) {
    console.error('[Notifications] Insert failed:', error.message, error)
  }
}

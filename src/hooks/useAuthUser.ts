import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const buildUser = async (authUser: {
    id: string
    email?: string
    user_metadata?: Record<string, string>
  }): Promise<User> => {
    // Try to get the richest name/avatar from the profiles table first
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', authUser.id)
      .maybeSingle()

    return {
      id: authUser.id,
      name:
        (profile?.full_name as string | undefined) ||
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split('@')[0] ||
        'Traveler',
      email: authUser.email || '',
      avatar:
        (profile?.avatar_url as string | undefined) ||
        authUser.user_metadata?.avatar_url ||
        '',
      role: authUser.user_metadata?.role,
    }
  }

  useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!mounted) return
      if (authUser) {
        const mapped = await buildUser(authUser)
        if (mounted) { setUser(mapped); setLoading(false) }
      } else {
        setUser(null)
        setLoading(false)
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      if (session?.user) {
        const mapped = await buildUser(session.user)
        if (mounted) setUser(mapped)
      } else {
        setUser(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { user, loading }
}

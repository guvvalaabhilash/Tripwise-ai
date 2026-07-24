import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * AuthCallbackPage
 *
 * Supabase redirects here after OAuth (Google, Facebook, etc.) with the
 * session tokens in the URL hash fragment.
 *
 * Root cause of blank page: onAuthStateChange() only fires for FUTURE events.
 * If detectSessionInUrl already processed the hash before this component
 * mounted, the SIGNED_IN event is missed and the page hangs forever.
 *
 * Fix: poll getSession() directly, which reads the already-persisted session
 * regardless of when detectSessionInUrl ran. Also subscribe to
 * onAuthStateChange as a backup for the case where it hasn't fired yet.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    const redirect = (session: boolean) => {
      if (handled.current) return
      handled.current = true
      navigate(session ? '/dashboard' : '/login', { replace: true })
    }

    // Primary: check if session already exists (detectSessionInUrl may have
    // already stored it before this component mounted)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        redirect(true)
        return
      }

      // Secondary: wait for onAuthStateChange in case detectSessionInUrl
      // hasn't processed the hash yet
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          redirect(true)
        } else if (event === 'SIGNED_OUT') {
          redirect(false)
        }
      })

      // Timeout fallback — if nothing fires within 5s, send to login
      const timeout = setTimeout(() => redirect(false), 5000)

      return () => {
        subscription.unsubscribe()
        clearTimeout(timeout)
      }
    })
  }, [navigate])

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white"
      style={{ background: 'linear-gradient(135deg, #080C1E 0%, #0D1535 100%)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#4F7CFF] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#AEB7C6]">Signing you in…</p>
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * AuthCallbackPage
 *
 * Supabase redirects here after OAuth (Google, Facebook, etc.).
 * The URL contains the session tokens in the hash fragment.
 * Supabase's client parses it automatically via detectSessionInUrl — we just
 * need to wait for the session and then navigate to the dashboard.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard', { replace: true })
      } else if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
        navigate('/login', { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center text-white"
      style={{ background: 'linear-gradient(135deg, #080C1E 0%, #0D1535 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#4F7CFF] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#AEB7C6]">Signing you in…</p>
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * AuthCallbackPage
 *
 * Handles the OAuth redirect from Supabase after Google / Facebook login.
 *
 * The URL arrives as:
 *   /auth/callback#access_token=...&refresh_token=...&token_type=bearer
 *
 * Strategy (most-to-least reliable):
 *
 * 1. Parse the hash manually and call setSession() directly — this works
 *    regardless of when detectSessionInUrl ran, bypassing all race conditions.
 * 2. If the hash is missing/invalid, fall back to getSession() in case the
 *    session was already stored by a prior detectSessionInUrl run.
 * 3. onAuthStateChange as a final backup.
 * 4. 8-second hard timeout → /login.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    const go = (ok: boolean) => {
      if (handled.current) return
      handled.current = true
      navigate(ok ? '/dashboard' : '/login', { replace: true })
    }

    const run = async () => {
      // ── 1. Parse hash fragment ──────────────────────────────────────────
      const hash = window.location.hash.substring(1) // strip leading #
      const params = new URLSearchParams(hash)
      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const tokenType    = params.get('token_type')

      if (accessToken && refreshToken && tokenType === 'bearer') {
        // Manually set the session — this is the most reliable path
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (!error) { go(true); return }
        console.error('[AuthCallback] setSession error:', error.message)
      }

      // ── 2. Maybe detectSessionInUrl already ran ─────────────────────────
      const { data: { session } } = await supabase.auth.getSession()
      if (session) { go(true); return }

      // ── 3. Wait for onAuthStateChange ────────────────────────────────────
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) go(true)
        else if (event === 'SIGNED_OUT')       go(false)
      })

      // ── 4. Hard timeout ──────────────────────────────────────────────────
      const timer = setTimeout(() => {
        console.error('[AuthCallback] Timed out waiting for session')
        go(false)
      }, 8000)

      return () => { subscription.unsubscribe(); clearTimeout(timer) }
    }

    run()
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

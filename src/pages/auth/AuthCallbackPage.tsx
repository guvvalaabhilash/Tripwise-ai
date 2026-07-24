import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const handled = useRef(false)
  const [status, setStatus] = useState('Reading tokens from URL…')

  useEffect(() => {
    const go = (ok: boolean) => {
      if (handled.current) return
      handled.current = true
      setStatus(ok ? 'Session confirmed — redirecting…' : 'No session — going to login…')
      setTimeout(() => navigate(ok ? '/dashboard' : '/login', { replace: true }), 500)
    }

    const run = async () => {
      // Step 1 — parse hash
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const tokenType    = params.get('token_type')

      setStatus(`Tokens found: ${accessToken ? 'YES' : 'NO'} | type: ${tokenType ?? 'none'}`)

      if (accessToken && refreshToken && tokenType === 'bearer') {
        setStatus('Calling setSession()…')
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error) {
          setStatus(`setSession error: ${error.message}`)
          // fall through to getSession
        } else if (data.session) {
          setStatus('setSession OK — redirecting to dashboard')
          go(true)
          return
        }
      }

      // Step 2 — getSession fallback
      setStatus('Trying getSession()…')
      const { data: { session }, error: gsError } = await supabase.auth.getSession()
      if (gsError) setStatus(`getSession error: ${gsError.message}`)
      if (session) { go(true); return }

      // Step 3 — onAuthStateChange fallback
      setStatus('Waiting for auth state change…')
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setStatus(`Auth event: ${event}`)
        if (event === 'SIGNED_IN' && session) go(true)
        else if (event === 'SIGNED_OUT') go(false)
      })

      // Step 4 — timeout
      const timer = setTimeout(() => {
        setStatus('Timed out — no session detected. Going to login.')
        go(false)
      }, 8000)

      return () => { subscription.unsubscribe(); clearTimeout(timer) }
    }

    run()
  }, [navigate])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-white gap-6"
      style={{ background: 'linear-gradient(135deg, #080C1E 0%, #0D1535 100%)' }}
    >
      <div className="w-10 h-10 border-2 border-[#4F7CFF] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-[#AEB7C6] text-center px-4">{status}</p>
    </div>
  )
}

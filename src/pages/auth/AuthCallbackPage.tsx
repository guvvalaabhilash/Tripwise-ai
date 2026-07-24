import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const handled = useRef(false)
  const [status, setStatus] = useState('Starting…')

  useEffect(() => {
    const go = (ok: boolean) => {
      if (handled.current) return
      handled.current = true
      setStatus(ok ? '✅ Signed in — going to dashboard…' : '❌ No session — going to login…')
      setTimeout(() => navigate(ok ? '/dashboard' : '/login', { replace: true }), 800)
    }

    const run = async () => {
      // Show env var status so we can diagnose on deployed site
      const urlSet = !!import.meta.env.VITE_SUPABASE_URL
      const keySet = !!import.meta.env.VITE_SUPABASE_ANON_KEY
      setStatus(`Env: URL=${urlSet ? '✅' : '❌MISSING'} KEY=${keySet ? '✅' : '❌MISSING'}`)

      if (!urlSet || !keySet) {
        // Env vars not baked in — Render needs them set before building
        setTimeout(() => setStatus(
          '❌ Supabase env vars missing in build.\n' +
          'Go to Render → Environment and add:\n' +
          'VITE_SUPABASE_URL\nVITE_SUPABASE_ANON_KEY\n' +
          'Then redeploy.'
        ), 100)
        return
      }

      // Parse hash tokens
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const tokenType    = params.get('token_type')

      setStatus(`Tokens: access=${accessToken ? '✅' : '❌'} refresh=${refreshToken ? '✅' : '❌'} type=${tokenType ?? 'none'}`)

      if (accessToken && refreshToken && tokenType === 'bearer') {
        setStatus('Calling setSession()…')
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error) {
          setStatus(`setSession failed: ${error.message}`)
        } else if (data.session) {
          go(true)
          return
        }
      }

      // Fallback: getSession
      setStatus('Trying getSession()…')
      const { data: { session }, error: gsErr } = await supabase.auth.getSession()
      if (gsErr) setStatus(`getSession error: ${gsErr.message}`)
      if (session) { go(true); return }

      // Fallback: onAuthStateChange
      setStatus('Waiting for auth event…')
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
        setStatus(`Auth event: ${event}`)
        if (event === 'SIGNED_IN' && s) go(true)
        else if (event === 'SIGNED_OUT') go(false)
      })

      const timer = setTimeout(() => {
        setStatus('⏱ Timed out — no session found.')
        go(false)
      }, 8000)

      return () => { subscription.unsubscribe(); clearTimeout(timer) }
    }

    run()
  }, [navigate])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-white gap-4"
      style={{ background: 'linear-gradient(135deg, #080C1E 0%, #0D1535 100%)' }}
    >
      <div className="w-10 h-10 border-2 border-[#4F7CFF] border-t-transparent rounded-full animate-spin" />
      <pre
        className="text-sm text-center px-6 max-w-lg whitespace-pre-wrap"
        style={{ color: '#AEB7C6' }}
      >
        {status}
      </pre>
    </div>
  )
}

import { supabase } from "@/lib/supabase";
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword]       = useState(false)
  const [loading, setLoading]                 = useState(false)
  const [googleLoading, setGoogleLoading]     = useState(false)
  const [facebookLoading, setFacebookLoading] = useState(false)
  const [email, setEmail]                     = useState('')
  const [password, setPassword]               = useState('')

  // ── Email / password ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { alert(error.message); return }
    navigate('/dashboard')
  }

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) {
      console.error('[Google OAuth] Error:', error.message)
      alert(error.message)
      setGoogleLoading(false)
    }
  }

  // ── Facebook OAuth ──────────────────────────────────────────────────────────
  // Supabase redirects the browser to Facebook, then back to the redirectTo URL.
  // Make sure this exact URL is whitelisted in:
  //   1. Supabase → Authentication → URL Configuration → Redirect URLs
  //   2. Facebook App → Facebook Login → Settings → Valid OAuth Redirect URIs
  //      (must include: https://<project>.supabase.co/auth/v1/callback)
  const handleFacebookLogin = async () => {
    setFacebookLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: 'email,public_profile',
      },
    })
    if (error) {
      console.error('[Facebook OAuth] Error:', error.message, error)
      alert(error.message)
      setFacebookLoading(false)
    }
    // On success the browser is redirected to Facebook — no cleanup needed here
  }

  return (
    <GlassCard glow="royal">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white font-jakarta">
          Welcome back
        </h2>
        <p className="text-sm text-slate-400 mt-2">Sign in to continue your journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="alex.rivera@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={16} />}
        />
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-royal/50 focus:ring-2 focus:ring-royal/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
            <input type="checkbox" className="rounded border-white/20" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-royal hover:text-cyan transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Sign In
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/8" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-transparent text-slate-500">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" size="sm" onClick={handleGoogleLogin} loading={googleLoading}>
          Google
        </Button>
        <Button variant="secondary" size="sm" onClick={handleFacebookLogin} loading={facebookLoading}>
          Facebook
        </Button>
      </div>

      <p className="text-center text-sm text-slate-400 mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-royal hover:text-cyan transition-colors font-medium">
          Sign up
        </Link>
      </p>
    </GlassCard>
  )
}

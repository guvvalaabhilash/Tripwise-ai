import { supabase } from "@/lib/supabase"
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { alert(error.message); return }
    navigate('/dashboard')
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) { console.error('[Google OAuth] Error:', error.message); alert(error.message); setGoogleLoading(false) }
  }

  const handleFacebookLogin = async () => {
    setFacebookLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/dashboard`, scopes: 'email,public_profile' },
    })
    if (error) { console.error('[Facebook OAuth] Error:', error.message, error); alert(error.message); setFacebookLoading(false) }
  }

  return (
    <div className="w-full rounded-2xl p-8 relative overflow-hidden"
      style={{
        background: 'rgba(8,12,30,0.75)',
        backdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 0 0 1px rgba(79,124,255,0.08), 0 32px 64px rgba(0,0,0,0.5)',
      }}>
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(79,124,255,0.55),rgba(0,194,255,0.35),transparent)' }} />

      <div className="text-center mb-7">
        <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-jakarta)]">Welcome back</h2>
        <p className="text-sm text-[#AEB7C6] mt-1.5">Sign in to continue your journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" placeholder="you@email.com"
          value={email} onChange={e => setEmail(e.target.value)}
          icon={<Mail size={15} />} />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#AEB7C6] uppercase tracking-wider">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AEB7C6] z-10 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-white/4 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-[#AEB7C6]/50 outline-none focus:border-[#4F7CFF]/50 focus:bg-[#4F7CFF]/6 focus:shadow-[0_0_0_3px_rgba(79,124,255,0.12)] transition-all [color-scheme:dark]"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AEB7C6] hover:text-white cursor-pointer z-10">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[#AEB7C6] cursor-pointer select-none">
            <input type="checkbox" className="w-3.5 h-3.5 rounded border-white/20 accent-[#4F7CFF]" />
            <span className="text-xs">Remember me</span>
          </label>
          <Link to="/forgot-password"
            className="text-xs text-[#4F7CFF] hover:text-[#7B9FFF] transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Sign In
        </Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/8" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 text-[#AEB7C6]/50" style={{ background: 'rgba(8,12,30,0.75)' }}>
            or continue with
          </span>
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

      <p className="text-center text-sm text-[#AEB7C6] mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-[#4F7CFF] hover:text-[#7B9FFF] transition-colors font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  )
}

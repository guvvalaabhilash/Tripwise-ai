import { supabase } from "@/lib/supabase"
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [name, setName]                 = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) { alert('Please fill in all fields.'); return }
    if (password.length < 8) { alert('Password must be at least 8 characters long.'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name } },
    })
    if (error) { setLoading(false); alert(error.message); return }
    const user = data.user
    if (user) {
      const { error: profileError } = await supabase.from('profiles').insert([{ id: user.id, full_name: name, email }])
      if (profileError) alert(profileError.message)
    }
    setLoading(false)
    alert('Account created successfully!')
    navigate('/login')
  }

  return (
    <div className="w-full rounded-2xl p-8 relative overflow-hidden"
      style={{
        background: 'rgba(8,12,30,0.75)',
        backdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 0 0 1px rgba(79,124,255,0.08), 0 32px 64px rgba(0,0,0,0.5)',
      }}>
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(79,124,255,0.55),rgba(0,194,255,0.35),transparent)' }} />

      <div className="text-center mb-7">
        <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-jakarta)]">Create your account</h2>
        <p className="text-sm text-[#AEB7C6] mt-1.5">Start planning amazing trips today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" type="text" placeholder="Alex Rivera"
          icon={<User size={15} />} value={name} onChange={e => setName(e.target.value)} />
        <Input label="Email" type="email" placeholder="you@email.com"
          icon={<Mail size={15} />} value={email} onChange={e => setEmail(e.target.value)} />
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#AEB7C6] uppercase tracking-wider">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AEB7C6] z-10 pointer-events-none" />
            <input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters"
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/4 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-[#AEB7C6]/50 outline-none focus:border-[#4F7CFF]/50 focus:bg-[#4F7CFF]/6 focus:shadow-[0_0_0_3px_rgba(79,124,255,0.12)] transition-all [color-scheme:dark]" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AEB7C6] hover:text-white cursor-pointer z-10">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <label className="flex items-start gap-2 text-xs text-[#AEB7C6] cursor-pointer select-none">
          <input type="checkbox" className="w-3.5 h-3.5 rounded border-white/20 mt-0.5 accent-[#4F7CFF]" />
          I agree to the Terms of Service and Privacy Policy
        </label>
        <Button type="submit" className="w-full" loading={loading}>Create Account</Button>
      </form>

      <p className="text-center text-sm text-[#AEB7C6] mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-[#4F7CFF] hover:text-[#7B9FFF] transition-colors font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  )
}

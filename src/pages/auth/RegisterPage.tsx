import { supabase } from "@/lib/supabase";
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
const [name, setName] = useState("")
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!name || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  if (password.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
  }

  setLoading(true);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });
if (error) {
  setLoading(false);
  alert(error.message);
  return;
}

const user = data.user;

 if (user) {
  const { error: profileError } = await supabase
    .from("profiles")
    .insert([
      {
        id: user.id,
        full_name: name,
        email: email,
      },
    ]);

  if (profileError) {
    alert(profileError.message);
  }
}

setLoading(false);
alert("Account created successfully!");
navigate("/login");

};

  return (
    <GlassCard glow="royal">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white font-jakarta">
          Create your account
        </h2>
        <p className="text-sm text-slate-400 mt-2">Start planning amazing trips today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
  label="Full Name"
  type="text"
  placeholder="Alex Rivera"
  icon={<User size={16} />}
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
       <Input
  label="Email"
  type="email"
  placeholder="alex.rivera@email.com"
  icon={<Mail size={16} />}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password}
onChange={(e) => setPassword(e.target.value)}
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

        <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer">
          <input type="checkbox" className="rounded border-white/20 mt-0.5" />
          I agree to the Terms of Service and Privacy Policy
        </label>

        <Button type="submit" className="w-full" loading={loading}>
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-royal-light hover:text-cyan transition-colors font-medium">
          Sign in
        </Link>
      </p>
    </GlassCard>
  )
}

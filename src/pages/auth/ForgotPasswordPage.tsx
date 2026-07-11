import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    setError(null)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/verify-otp`,
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSent(true)
  }

  return (
    <GlassCard glow="royal">
      <Link to="/login" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft size={16} />
        Back to login
      </Link>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white font-jakarta">
          {sent ? 'Check your email' : 'Forgot password?'}
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          {sent
            ? 'We sent a reset link to your email address'
            : "No worries, we'll send you reset instructions"}
        </p>
      </div>

      {sent ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <Mail size={32} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-emerald-300">Reset link sent to {email}</p>
          </div>
          <Link to="/login">
            <Button className="w-full" variant="secondary">
              Back to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="alex.rivera@email.com"
            icon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" loading={loading}>
            Send Reset Link
          </Button>
        </form>
      )}
    </GlassCard>
  )
}

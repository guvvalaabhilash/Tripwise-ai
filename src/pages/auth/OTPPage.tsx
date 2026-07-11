import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

export default function OTPPage() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async () => {
    const token = otp.join('')
    if (token.length < 6) return

    setLoading(true)
    setError(null)

    // Use Supabase PKCE / email OTP verification
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    })

    setLoading(false)

    if (verifyError) {
      setError(verifyError.message)
      return
    }

    navigate('/dashboard')
  }

  return (
    <GlassCard glow="royal">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-royal/20 border border-royal/30 flex items-center justify-center mx-auto mb-4">
          <Shield size={28} className="text-royal" />
        </div>
        <h2 className="text-2xl font-bold text-white font-jakarta">
          Verify your email
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <div className="flex justify-center gap-3 mb-6">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-royal/50 focus:ring-2 focus:ring-royal/20 transition-all"
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-4 text-center">
          {error}
        </p>
      )}

      <Button
        className="w-full"
        loading={loading}
        onClick={handleSubmit}
        disabled={otp.some((d) => !d)}
      >
        Verify & Continue
      </Button>

      <p className="text-center text-sm text-slate-400 mt-4">
        Didn&apos;t receive the code?{' '}
        <button className="text-royal hover:text-cyan transition-colors font-medium cursor-pointer">
          Resend
        </button>
      </p>
    </GlassCard>
  )
}

import { Outlet, Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex" style={{ background: '#050816' }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-80" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,124,255,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,194,255,0.12) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        {/* Grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
          }} />
        <div className="relative z-10 flex flex-col justify-center px-14">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4F7CFF, #00C2FF)', boxShadow: '0 0 24px rgba(79,124,255,0.5)' }}>
                <Sparkles size={22} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-white font-[family-name:var(--font-jakarta)]">TripWise AI</span>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight font-[family-name:var(--font-jakarta)] mb-4">
              Plan smarter.<br />
              <span className="gradient-text">Travel better.</span>
            </h2>
            <p className="text-[#AEB7C6] text-base max-w-sm leading-relaxed">
              AI-powered trip planning, budget management, and expense sharing — all in one premium platform.
            </p>
            <div className="flex flex-col gap-3 mt-10">
              {['Smart AI itinerary generation', 'Real-time expense tracking', 'Budget-aware suggestions'].map(f => (
                <div key={f} className="flex items-center gap-3 text-sm text-[#AEB7C6]">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.3)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4F7CFF]" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4F7CFF, #00C2FF)' }}>
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white font-[family-name:var(--font-jakarta)]">TripWise AI</span>
          </div>
          <Outlet />
          <p className="text-center text-xs text-[#AEB7C6]/50 mt-6">
            <Link to="/" className="hover:text-[#AEB7C6] transition-colors">← Back to home</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

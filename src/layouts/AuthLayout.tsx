import { Outlet, Link } from 'react-router-dom'
import { Plane } from 'lucide-react'
import { motion } from 'framer-motion'

const VALUE_PROPS = [
  'Smart AI itinerary generation',
  'Real-time weather integration',
  'Budget-aware recommendations',
  'Collaborative expense splitting',
]

export function AuthLayout() {
  return (
    <div className="min-h-screen flex" style={{ background: '#050816' }}>

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 animated-gradient opacity-70" />
        {/* Aurora blobs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,124,255,0.2) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute bottom-1/3 right-1/5 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,194,255,0.14) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(106,92,255,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        {/* Subtle grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
          }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-14 py-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Logo lockup */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #4F7CFF, #00C2FF)', boxShadow: '0 0 24px rgba(79,124,255,0.5)' }}>
                <Plane size={22} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white font-[family-name:var(--font-jakarta)] block leading-none">TripWise</span>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#4F7CFF] mt-0.5 block">AI TRAVEL</span>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white leading-tight font-[family-name:var(--font-jakarta)] mb-5">
              Plan smarter.<br />
              <span className="gradient-text">Travel better.</span>
            </h2>

            <p className="text-[#AEB7C6] text-sm leading-relaxed max-w-sm mb-10">
              AI-powered trip planning, budget management, and expense sharing — all in one premium platform.
            </p>

            <div className="flex flex-col gap-3">
              {VALUE_PROPS.map((f, i) => (
                <motion.div key={f}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3 text-sm text-[#AEB7C6]">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.3)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4F7CFF]" />
                  </div>
                  {f}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 relative">
        {/* Soft background glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(79,124,255,0.06) 0%, transparent 70%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative z-10 w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4F7CFF, #00C2FF)', boxShadow: '0 0 20px rgba(79,124,255,0.4)' }}>
              <Plane size={18} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white font-[family-name:var(--font-jakarta)]">TripWise</span>
              <span className="text-[9px] font-semibold tracking-widest uppercase text-[#4F7CFF] block">AI TRAVEL</span>
            </div>
          </div>

          <Outlet />

          <p className="text-center text-xs text-[#AEB7C6]/40 mt-6">
            <Link to="/" className="hover:text-[#AEB7C6] transition-colors">← Back to home</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

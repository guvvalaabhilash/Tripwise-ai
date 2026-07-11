import { Outlet, Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export function AuthLayout() {
  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#3b5bdb]/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#22d3ee]/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-royal to-cyan flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-white font-jakarta">
                TripWise AI
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight font-jakarta">
              Plan smarter.<br />
              <span className="gradient-text">Travel better.</span>
            </h2>
            <p className="text-slate-400 mt-4 text-lg max-w-md">
              AI-powered trip planning, budget management, and expense sharing — all in one beautiful platform.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right auth form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-royal to-cyan flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white font-jakarta">
              TripWise AI
            </span>
          </div>
          <Outlet />
          <p className="text-center text-xs text-slate-500 mt-6">
            <Link to="/" className="hover:text-slate-300 transition-colors">
              Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

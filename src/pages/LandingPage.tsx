import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Shield, MapPin, DollarSign, Brain, Users } from 'lucide-react'
import { LANDING_FEATURES } from '@/constants'

const HoloGlobe = lazy(() => import('@/components/HoloGlobe'))

const PLACEHOLDERS = [
  'Plan a Goa trip under ₹25,000…',
  'Weekend getaway from Hyderabad…',
  'Family trip to Kerala…',
  'Solo backpacking in Himachal…',
  'Luxury honeymoon in Bali…',
]

function useTypingPlaceholder() {
  const [text, setText] = useState('')
  const [idx, setIdx]   = useState(0)
  const [phase, setPhase] = useState<'typing'|'pause'|'erasing'>('typing')
  const charRef = useRef(0)
  useEffect(() => {
    const target = PLACEHOLDERS[idx]
    if (phase === 'typing') {
      if (charRef.current < target.length) {
        const t = setTimeout(() => { charRef.current++; setText(target.slice(0, charRef.current)) }, 45)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setPhase('pause'), 1800); return () => clearTimeout(t)
      }
    } else if (phase === 'pause') {
      const t = setTimeout(() => setPhase('erasing'), 600); return () => clearTimeout(t)
    } else {
      if (charRef.current > 0) {
        const t = setTimeout(() => { charRef.current--; setText(target.slice(0, charRef.current)) }, 24)
        return () => clearTimeout(t)
      } else { setIdx(i => (i + 1) % PLACEHOLDERS.length); setPhase('typing') }
    }
  }, [text, phase, idx])
  return text
}

function MagneticWrap({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0); const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 18 })
  const sy = useSpring(y, { stiffness: 200, damping: 18 })
  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return
    const rect = el.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.28)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.28)
  }, [x, y])
  const handleLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy, display: 'inline-flex' }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </motion.div>
  )
}

const FEATURE_ICONS = [MapPin, DollarSign, Brain, Users]
const FEATURE_COLORS = ['#4F7CFF', '#00C2FF', '#6A5CFF', '#19F28C']

const BADGE_ITEMS = [
  { icon: '🤖', text: 'AI Trip Planner' },
  { icon: '💰', text: 'Budget Optimized' },
  { icon: '🌤️', text: 'Weather Aware' },
  { icon: '🧾', text: 'Expense Split' },
  { icon: '💬', text: 'AI Assistant' },
]

export default function LandingPage() {
  const placeholder = useTypingPlaceholder()
  const [inputValue, setInputValue] = useState('')
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll()
  const heroScale   = useTransform(scrollYProgress, [0, 0.3], [1, 0.97])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const bgParallax  = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navScrolled = scrollY > 20

  return (
    <motion.div className="min-h-screen overflow-hidden"
      style={{ background: '#050816' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>

      {/* ── Background layers ── */}
      <motion.div className="fixed inset-0 pointer-events-none" style={{ y: bgParallax }} aria-hidden>
        <div className="animate-aurora-1 absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 20% 20%, rgba(79,124,255,0.12) 0%, transparent 70%)' }} />
        <div className="animate-aurora-2 absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 55% 40% at 80% 70%, rgba(0,194,255,0.08) 0%, transparent 65%)' }} />
        <div className="animate-aurora-3 absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 45% 35% at 55% 50%, rgba(106,92,255,0.06) 0%, transparent 60%)' }} />
        {/* Grid */}
        <div style={{ position:'absolute', inset:0,
          backgroundImage:'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize:'80px 80px',
          maskImage:'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)' }} />
      </motion.div>

      {/* ── Navbar ── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-14 py-4 transition-all duration-300"
        style={{
          backdropFilter: navScrolled ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: navScrolled ? 'blur(24px)' : 'none',
          borderBottom: navScrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
          background: navScrolled ? 'rgba(5,8,22,0.75)' : 'transparent',
        }}
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}>
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4F7CFF, #00C2FF)', boxShadow: '0 0 20px rgba(79,124,255,0.4)' }}
            whileHover={{ scale: 1.08, rotate: 6 }} transition={{ type:'spring', stiffness:300, damping:15 }}>
            <Sparkles size={18} className="text-white" />
          </motion.div>
          <span className="text-lg font-bold text-white font-[family-name:var(--font-jakarta)]">TripWise AI<sup className="text-[#4F7CFF] text-xs">+</sup></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#AEB7C6]">
          {['Home','Features','Destinations','Pricing'].map(item => (
            <motion.a key={item} href="#" className="hover:text-white transition-colors relative group" whileHover={{ y: -1 }}>
              {item}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#4F7CFF] group-hover:w-full transition-all duration-250" />
            </motion.a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <MagneticWrap>
              <button className="px-4 py-2 text-sm text-[#AEB7C6] hover:text-white transition-colors cursor-pointer">
                Login
              </button>
            </MagneticWrap>
          </Link>
          <Link to="/register">
            <MagneticWrap>
              <button className="btn-primary text-sm px-5 py-2 rounded-xl cursor-pointer">
                Get Started
              </button>
            </MagneticWrap>
          </Link>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <motion.section ref={heroRef} className="relative z-10 min-h-screen flex items-center px-6 lg:px-14 pt-20 pb-16"
        style={{ scale: heroScale, opacity: heroOpacity }}>
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

          {/* Left text */}
          <div className="flex-1 lg:max-w-[52%]">
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.15 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium text-[#4F7CFF]"
                style={{ background:'rgba(79,124,255,0.1)', border:'1px solid rgba(79,124,255,0.2)' }}>
                <Sparkles size={12} />AI-Powered Travel Planner
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.65, delay:0.22, ease:[0.21,1.02,0.73,1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-none tracking-tight font-[family-name:var(--font-jakarta)] mb-6">
              <span className="text-white">Explore India,</span>
              <br />
              <span className="hero-gradient-text">Smartly &amp; Affordably</span>
            </motion.h1>

            <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.55, delay:0.35 }}
              className="text-base md:text-lg text-[#AEB7C6] leading-relaxed max-w-xl mb-8">
              TripWise AI creates personalized, budget-friendly itineraries with AI intelligence and real-time weather insights.
            </motion.p>

            <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.5, delay:0.45 }}
              className="flex flex-wrap gap-3 mb-10">
              <Link to="/trip-planner">
                <MagneticWrap>
                  <button className="btn-primary px-6 py-3 rounded-xl text-sm cursor-pointer">
                    Plan Your Trip <ArrowRight size={15} />
                  </button>
                </MagneticWrap>
              </Link>
              <Link to="/dashboard">
                <MagneticWrap>
                  <button className="btn-secondary px-6 py-3 rounded-xl text-sm cursor-pointer flex items-center gap-2">
                    ▶ Watch Demo
                  </button>
                </MagneticWrap>
              </Link>
            </motion.div>

            {/* Feature badges */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
              className="flex flex-wrap gap-2">
              {BADGE_ITEMS.map((b, i) => (
                <motion.div key={b.text}
                  initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay: 0.65 + i * 0.06 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#AEB7C6]"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <span>{b.icon}</span>{b.text}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right — Globe */}
          <motion.div
            className="relative flex-shrink-0 w-full lg:w-[480px] xl:w-[540px]"
            initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            transition={{ duration:1.1, delay:0.3, ease:[0.21,1.02,0.73,1] }}>
            {/* Platform glow */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full pointer-events-none"
              style={{ background:'radial-gradient(ellipse, rgba(79,124,255,0.35) 0%, transparent 70%)', filter:'blur(16px)' }} />
            <Suspense fallback={<div className="w-full aspect-square rounded-full shimmer opacity-30" />}>
              <HoloGlobe className="w-full aspect-square" />
            </Suspense>
            {/* Floating search bar */}
            <motion.div
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.8 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-sm">
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
                style={{ background:'rgba(8,12,28,0.9)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
                <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-[#AEB7C6]/50 outline-none" />
                <Link to="/dashboard">
                  <button className="p-1.5 rounded-lg cursor-pointer transition-colors"
                    style={{ background:'rgba(79,124,255,0.2)', color:'#4F7CFF' }}>
                    <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 px-6 lg:px-14 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <motion.h2 initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              transition={{ duration:0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight font-[family-name:var(--font-jakarta)] mb-4">
              Everything to travel smart
            </motion.h2>
            <motion.p initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              transition={{ duration:0.5, delay:0.1 }}
              className="text-[#AEB7C6] text-lg max-w-2xl mx-auto">
              From AI itineraries to expense splitting — TripWise handles the details.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {LANDING_FEATURES.map((feature, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length]
              const color = FEATURE_COLORS[i % FEATURE_COLORS.length]
              return (
                <motion.div key={feature.title}
                  initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }} transition={{ delay: i * 0.08, duration:0.5 }}>
                  <div className="premium-card p-5 h-full group cursor-default">
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: `${color}18` }}>
                        <Icon size={18} style={{ color }} />
                      </div>
                      <div className="text-xl mb-3">{feature.icon}</div>
                      <h3 className="text-sm font-semibold text-white mb-2 font-[family-name:var(--font-jakarta)]">{feature.title}</h3>
                      <p className="text-xs text-[#AEB7C6] leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 lg:px-14 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:0.5 }}
            className="premium-card p-12 animated-border animated-border-on">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight font-[family-name:var(--font-jakarta)] mb-4">
                Ready for your next adventure?
              </h2>
              <p className="text-[#AEB7C6] mb-8 max-w-lg mx-auto">
                Start planning smarter with TripWise AI. Free to start, no credit card required.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register">
                  <button className="btn-primary px-8 py-3 rounded-xl text-sm cursor-pointer">
                    Start Planning Free <ArrowRight size={15} />
                  </button>
                </Link>
                <Link to="/dashboard">
                  <button className="btn-secondary px-8 py-3 rounded-xl text-sm cursor-pointer">View Demo</button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/6 px-6 lg:px-14 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background:'linear-gradient(135deg,#4F7CFF,#00C2FF)' }}>
                  <Sparkles size={14} className="text-white" />
                </div>
                <span className="font-bold text-white text-sm">TripWise AI</span>
              </div>
              <p className="text-xs text-[#AEB7C6]/60 leading-relaxed">AI-powered trip planning for the modern traveler.</p>
            </div>
            {[
              { title:'Product', links:['Features','Pricing','AI Chat','Mobile App'] },
              { title:'Company', links:['About','Blog','Careers','Contact'] },
              { title:'Legal',   links:['Privacy','Terms','Security','Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <span className="text-xs text-[#AEB7C6]/60 hover:text-white transition-colors cursor-pointer">{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-6 border-t border-white/6 text-xs text-[#AEB7C6]/40">
            <p>© 2026 TripWise AI. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Shield size={12} /><span>Secure &amp; Private</span>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

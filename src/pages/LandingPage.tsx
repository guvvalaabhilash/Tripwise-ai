import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Shield, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
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
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'pause' | 'erasing'>('typing')
  const charRef = useRef(0)

  useEffect(() => {
    const target = PLACEHOLDERS[idx]
    if (phase === 'typing') {
      if (charRef.current < target.length) {
        const t = setTimeout(() => { charRef.current++; setText(target.slice(0, charRef.current)) }, 42)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setPhase('pause'), 1800)
        return () => clearTimeout(t)
      }
    } else if (phase === 'pause') {
      const t = setTimeout(() => setPhase('erasing'), 600)
      return () => clearTimeout(t)
    } else {
      if (charRef.current > 0) {
        const t = setTimeout(() => { charRef.current--; setText(target.slice(0, charRef.current)) }, 22)
        return () => clearTimeout(t)
      } else {
        setIdx((i) => (i + 1) % PLACEHOLDERS.length)
        setPhase('typing')
      }
    }
  }, [text, phase, idx])

  return text
}

function MagneticWrap({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 18 })
  const sy = useSpring(y, { stiffness: 200, damping: 18 })

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
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

function Particles() {
  const particles = useRef(
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 14,
      opacity: 0.02 + Math.random() * 0.035,
    })),
  ).current

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [0, -70, 0], x: [0, (Math.random() - 0.5) * 30, 0],
            opacity: [0, p.opacity * 14, p.opacity * 7, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function PremiumFeatureCard({ feature, index }: {
  feature: { icon: string; title: string; description: string }
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0, 0, 1] }}
      className="group relative p-6 border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-muted)] transition-colors duration-150"
    >
      <motion.span className="text-2xl block mb-4"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3 + index * 0.4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}>
        {feature.icon}
      </motion.span>
      <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2 font-[family-name:var(--font-inter-tight)]">
        {feature.title}
      </h3>
      <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">{feature.description}</p>
    </motion.div>
  )
}

export default function LandingPage() {
  const placeholder = useTypingPlaceholder()
  const [inputValue, setInputValue] = useState('')
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const ctaSectionRef = useRef<HTMLDivElement>(null)
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 })

  const { scrollYProgress } = useScroll()
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.97])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const bgParallax = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleCtaMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setSpotlightPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  const navScrolled = scrollY > 20

  return (
    <motion.div className="min-h-screen gradient-bg overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}>

      {/* Background */}
      <motion.div className="fixed inset-0 pointer-events-none" style={{ y: bgParallax }} aria-hidden>
        <div className="animate-aurora-1 absolute" style={{ top: '-10%', left: '-5%', width: '70%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(59,91,219,0.14) 0%, rgba(92,124,250,0.06) 40%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(60px)' }} />
        <div className="animate-aurora-2 absolute" style={{ top: '20%', right: '-10%', width: '60%', height: '55%',
          background: 'radial-gradient(ellipse, rgba(34,211,238,0.09) 0%, rgba(59,91,219,0.04) 50%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(70px)' }} />
        <div className="animate-aurora-3 absolute" style={{ bottom: '5%', left: '20%', width: '50%', height: '40%',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 65%)',
          borderRadius: '50%', filter: 'blur(80px)' }} />
        <div className="animate-blob-1 absolute" style={{ top: '15%', left: '8%', width: 320, height: 320,
          background: 'radial-gradient(circle, rgba(59,91,219,0.08) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)' }} />
        <div className="animate-blob-2 absolute" style={{ top: '45%', right: '12%', width: 260, height: 260,
          background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)' }} />
        <div className="animate-blob-3 absolute" style={{ bottom: '20%', left: '35%', width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(92,124,250,0.06) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(30px)' }} />
        <div style={{ position: 'absolute', top: 0, left: '25%', width: '3px', height: '100%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(92,124,250,0.025) 30%, rgba(34,211,238,0.015) 70%, transparent 100%)',
          transform: 'skewX(-20deg)', filter: 'blur(8px)' }} />
        <div style={{ position: 'absolute', top: 0, left: '65%', width: '2px', height: '100%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(34,211,238,0.02) 40%, transparent 100%)',
          transform: 'skewX(-15deg)', filter: 'blur(10px)' }} />
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px', opacity: 0.4 }} />
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)' }} />
      </motion.div>

      <Particles />

      {/* Navbar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-5 transition-all duration-300"
        style={{
          backdropFilter: navScrolled ? 'blur(24px)' : 'blur(0px)',
          WebkitBackdropFilter: navScrolled ? 'blur(24px)' : 'blur(0px)',
          borderBottom: navScrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          background: navScrolled ? 'rgba(10,15,30,0.7)' : 'transparent',
          boxShadow: navScrolled ? '0 4px 32px rgba(0,0,0,0.3)' : 'none',
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b5bdb] to-[#22d3ee] flex items-center justify-center"
            whileHover={{ scale: 1.08, rotate: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <Sparkles size={20} className="text-white" />
          </motion.div>
          <span className="text-xl font-bold text-white font-[family-name:var(--font-jakarta)]">
            TripWise AI
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <motion.a href="#features" className="relative hover:text-white transition-colors group" whileHover={{ y: -1 }}>
            Features
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-[#5c7cfa] to-[#22d3ee] group-hover:w-full transition-all duration-300" />
          </motion.a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <MagneticWrap><Button variant="ghost" size="sm">Sign In</Button></MagneticWrap>
          </Link>
          <Link to="/register">
            <MagneticWrap>
              <div className="relative group">
                <Button size="sm">Get Started</Button>
                <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none" style={{ opacity: 0 }}>
                  <span className="absolute top-0 bottom-0 w-1/3 bg-white/20 skew-x-[-20deg] group-hover:translate-x-[400%] transition-transform duration-700" style={{ left: '-40%' }} />
                </span>
              </div>
            </MagneticWrap>
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section ref={heroRef} className="relative z-10 px-6 lg:px-16 py-20 md:py-28 lg:py-40"
        style={{ scale: heroScale, opacity: heroOpacity }}>
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          {/* Left */}
          <div className="relative z-10 flex-1 lg:max-w-[60%]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.21, 1.02, 0.73, 1] }}>
              <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-8">
                Powered by Advanced AI
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.21, 1.02, 0.73, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-[var(--color-foreground)] leading-none tracking-tight font-[family-name:var(--font-inter-tight)] mb-8">
              Your trips,
              <br />
              <span className="text-[var(--color-accent)]">perfectly planned</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26 }}
              className="text-lg md:text-xl text-[var(--color-muted-foreground)] mt-8 max-w-2xl leading-relaxed">
              AI-powered trip planning, smart budget tracking, and seamless expense sharing.
              Plan unforgettable journeys without the stress.
            </motion.p>

            {/* Search box */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38 }} className="mt-12 max-w-xl">
              <div className="relative">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                  className="w-full rounded-none px-4 py-4 text-base text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] bg-[var(--color-input)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] transition-colors duration-150"
                  placeholder={placeholder} aria-label="AI trip planning prompt" />
                <Link to="/dashboard" className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Button variant="primary" size="sm">
                    Plan Trip
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right — Globe */}
          <motion.div className="relative flex-shrink-0 w-full lg:w-auto select-none overflow-visible"
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.21, 1.02, 0.73, 1] }} style={{ zIndex: 2 }}>
            <Suspense fallback={null}>
              <HoloGlobe className="w-full aspect-square lg:w-[600px] lg:h-[600px] lg:aspect-auto" />
            </Suspense>
          </motion.div>
        </div>
      </motion.section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 lg:px-16 py-20 md:py-28 lg:py-32">
        <div className="absolute top-0 inset-x-0 h-px bg-[var(--color-border)]" />
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] leading-none tracking-tight font-[family-name:var(--font-inter-tight)] mb-6">
              Everything you need to travel smart
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.1 }}
              className="text-lg text-[var(--color-muted-foreground)] max-w-2xl leading-relaxed">
              From AI itineraries to expense splitting, TripWise handles the details so you can focus on the adventure.
            </motion.p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LANDING_FEATURES.map((feature, i) => (
              <PremiumFeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 lg:px-16 py-20 md:py-28 lg:py-32">
        <div className="max-w-4xl mx-auto" ref={ctaSectionRef}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.25, 0, 0, 1] }}
            className="relative border border-[var(--color-border)] bg-transparent text-center py-16 px-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] leading-none tracking-tight font-[family-name:var(--font-inter-tight)] mb-6">
              Ready to plan your next adventure?
            </h2>
            <p className="text-lg text-[var(--color-muted-foreground)] max-w-lg mx-auto mb-10">
              Start planning smarter with TripWise AI. Free to start, no credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Start Planning Free
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="lg">View Demo</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/8 px-6 lg:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b5bdb] to-[#22d3ee] flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className="font-bold text-white">TripWise AI</span>
              </div>
              <p className="text-sm text-slate-400">AI-powered trip planning for the modern traveler.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'AI Chat', 'Mobile App'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal',   links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-white mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/8 text-xs text-slate-500">
            <p>© 2026 TripWise AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Shield size={14} />
              <span>Secure &amp; Private</span>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

import React from 'react'

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} aria-hidden>
      <div className="absolute inset-0 animated-gradient" />

      <div className="animate-aurora-1 absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 15% 25%, rgba(79,123,255,0.08) 0%, transparent 65%)' }} />
      <div className="animate-aurora-2 absolute inset-0" style={{ background: 'radial-gradient(ellipse 55% 40% at 85% 75%, rgba(0,229,255,0.06) 0%, transparent 60%)' }} />
      <div className="animate-aurora-3 absolute inset-0" style={{ background: 'radial-gradient(ellipse 45% 35% at 55% 55%, rgba(123,97,255,0.05) 0%, transparent 55%)' }} />

      <div className="absolute" style={{ top: '5%', left: '-8%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,123,255,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute" style={{ bottom: '5%', right: '-8%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)', filter: 'blur(70px)' }} />

      <div style={{ position: 'absolute', inset: 0, opacity: 0.35, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, backgroundSize: '256px 256px' }} />

      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(79,123,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(79,123,255,0.018) 1px, transparent 1px)', backgroundSize: '72px 72px', maskImage: 'radial-gradient(ellipse 90% 80% at 50% 0%, black 10%, transparent 85%)' }} />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, rgba(79,123,255,0.04), transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 300, background: 'radial-gradient(ellipse, rgba(79,123,255,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
    </div>
  )
}

export default AnimatedBackground

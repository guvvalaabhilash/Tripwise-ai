import { supabase } from '@/lib/supabase'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sparkles, LogOut } from 'lucide-react'
import { NAV_ITEMS } from '@/constants'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthUser } from '@/hooks/useAuthUser'
import { cn } from '@/lib/utils'

interface SidebarProps { mobileOpen: boolean; onMobileClose: () => void }

function SidebarContent({ onClose }: { onClose: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthUser()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background glow orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(79,123,255,0.12) 0%, transparent 70%)', filter: 'blur(30px)' }} />

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5 relative z-10">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #4F7BFF, #00E5FF)',
              boxShadow: '0 0 16px rgba(79,123,255,0.5), 0 0 32px rgba(0,229,255,0.2)' }}>
            <Sparkles size={17} className="text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-sm font-bold text-[#F0F4FF] font-[family-name:var(--font-jakarta)]">TripWise</h1>
          <p className="text-[9px] text-[#6F7D9E] tracking-widest uppercase">AI Travel</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px mb-3"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(79,123,255,0.3), transparent)' }} />

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item, i) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <motion.div key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.035, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              <Link to={item.path} onClick={onClose}
                className={cn('group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-250 overflow-hidden',
                  isActive ? 'text-[#F0F4FF]' : 'text-[#6F7D9E] hover:text-[#C0C8E8]')}>

                {/* Active background */}
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute inset-0 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, rgba(79,123,255,0.22), rgba(0,229,255,0.08))',
                      border: '1px solid rgba(79,123,255,0.28)',
                      boxShadow: '0 0 16px rgba(79,123,255,0.15)' }}
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }} />
                )}

                {/* Hover background */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: 'rgba(79,123,255,0.06)' }} />
                )}

                {/* Active left indicator */}
                {isActive && (
                  <motion.div layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: 'linear-gradient(to bottom, #4F7BFF, #00E5FF)',
                      boxShadow: '0 0 8px #4F7BFF' }}
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }} />
                )}

                {/* Icon */}
                <div className={cn('relative z-10 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  isActive ? 'text-[#00E5FF]' : 'text-[#6F7D9E] group-hover:text-[#4F7BFF]')}
                  style={isActive ? { background: 'rgba(0,229,255,0.1)', boxShadow: '0 0 8px rgba(0,229,255,0.2)' } : {}}>
                  <Icon size={15} />
                </div>

                <span className="relative z-10 truncate flex-1">{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Bottom divider */}
      <div className="mx-5 h-px mt-3"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(79,123,255,0.3), transparent)' }} />

      {/* User */}
      <div className="p-4 relative z-10">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
              style={{ background: 'rgba(79,123,255,0.06)', border: '1px solid rgba(79,123,255,0.1)' }}>
              <Avatar src={user.avatar} name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#F0F4FF] truncate">{user.name}</p>
                <p className="text-[10px] text-[#6F7D9E] truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#6F7D9E] hover:text-[#FF4D6D] hover:bg-[#FF4D6D]/8 transition-all duration-200 cursor-pointer group">
              <LogOut size={13} className="group-hover:scale-110 transition-transform" />
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/login" className="flex items-center gap-2 px-3 py-2 text-xs text-[#6F7D9E] hover:text-white transition-colors">
            <LogOut size={13} />Sign In
          </Link>
        )}
      </div>
    </div>
  )
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const sidebarStyle = {
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    background: 'rgba(5,8,20,0.8)',
    borderRight: '1px solid rgba(79,123,255,0.1)',
    boxShadow: '4px 0 32px rgba(0,0,0,0.35)',
  }

  return (
    <>
      <aside className="hidden lg:flex w-64 flex-col h-screen fixed left-0 top-0 z-40"
        style={sidebarStyle}>
        <SidebarContent onClose={() => {}} />
      </aside>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
              onClick={onMobileClose} />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 w-64 h-screen z-50 lg:hidden"
              style={{ ...sidebarStyle, background: 'rgba(5,8,20,0.97)' }}>
              <button onClick={onMobileClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6F7D9E] hover:text-white hover:bg-[#4F7BFF]/15 cursor-pointer">
                <X size={17} />
              </button>
              <SidebarContent onClose={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="lg:hidden p-2 rounded-xl text-[#6F7D9E] hover:text-white hover:bg-[#4F7BFF]/15 transition-all cursor-pointer">
      <Menu size={19} />
    </button>
  )
}

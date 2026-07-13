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
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(79,124,255,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5 relative z-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #4F7CFF, #00C2FF)',
            boxShadow: '0 0 20px rgba(79,124,255,0.5)',
          }}>
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white font-[family-name:var(--font-jakarta)]">TripWise</h1>
          <p className="text-[10px] text-[#AEB7C6]/60 tracking-widest uppercase">AI Travel</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px mb-4"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item, i) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <motion.div key={item.path}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              <Link
                to={item.path}
                onClick={onClose}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-white'
                    : 'text-[#AEB7C6] hover:text-white hover:bg-white/5'
                )}
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(79,124,255,0.16), rgba(106,92,255,0.08))',
                  border: '1px solid rgba(79,124,255,0.2)',
                } : {}}
              >
                {/* Active left bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{
                      background: 'linear-gradient(180deg, #4F7CFF, #00C2FF)',
                      boxShadow: '0 0 8px #4F7CFF',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  isActive ? 'text-[#4F7CFF]' : 'text-[#AEB7C6]/70 group-hover:text-[#4F7CFF]'
                )}
                  style={isActive ? { background: 'rgba(79,124,255,0.12)' } : {}}>
                  <Icon size={15} />
                </div>

                <span className="truncate flex-1">{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Bottom divider */}
      <div className="mx-5 h-px mt-3"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />

      {/* User section */}
      <div className="p-4 relative z-10">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Avatar src={user.avatar} name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-[#AEB7C6]/60 truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#AEB7C6] hover:text-[#FF4D6D] hover:bg-[#FF4D6D]/8 transition-all duration-200 cursor-pointer group">
              <LogOut size={13} className="group-hover:scale-110 transition-transform" />
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/login" className="flex items-center gap-2 px-3 py-2 text-xs text-[#AEB7C6] hover:text-white transition-colors">
            <LogOut size={13} />Sign In
          </Link>
        )}
      </div>
    </div>
  )
}

const sidebarStyle = {
  backdropFilter: 'blur(32px) saturate(180%)',
  WebkitBackdropFilter: 'blur(32px) saturate(180%)',
  background: 'rgba(5,8,22,0.85)',
  borderRight: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-60 flex-col h-screen fixed left-0 top-0 z-40" style={sidebarStyle}>
        <SidebarContent onClose={() => {}} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 w-60 h-screen z-50 lg:hidden"
              style={{ ...sidebarStyle, background: 'rgba(5,8,22,0.97)' }}>
              <button onClick={onMobileClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#AEB7C6] hover:text-white hover:bg-white/8 cursor-pointer transition-all">
                <X size={16} />
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
      className="lg:hidden p-2 rounded-xl text-[#AEB7C6] hover:text-white hover:bg-white/8 transition-all cursor-pointer">
      <Menu size={18} />
    </button>
  )
}

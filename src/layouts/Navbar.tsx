import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Search, Plus, CheckCheck, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { NotificationCard } from '@/components/NotificationCard'
import { useCountry } from '@/context/CountryContext'
import { useNotifications } from '@/hooks/useNotifications'
import { COUNTRIES } from '@/lib/countries'

export function Navbar() {
  const [showNotif, setShowNotif]         = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [showCountry, setShowCountry]     = useState(false)
  const { country, setCountryCode }       = useCountry()
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications()

  return (
    <header className="sticky top-0 z-30" style={{
      background: 'rgba(5,8,20,0.75)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: '1px solid rgba(79,123,255,0.1)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
    }}>
      {/* Top shimmer line */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(79,123,255,0.4), rgba(0,229,255,0.3), transparent)' }} />

      <div className="flex items-center justify-between px-5 lg:px-8 py-3">
        <div />

        <div className="flex items-center gap-2">
          {/* Currency */}
          <div className="relative hidden md:block">
            <button onClick={() => setShowCountry(s => !s)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#A8B2D1] hover:text-white transition-all cursor-pointer"
              style={{ background: 'rgba(79,123,255,0.06)', border: '1px solid rgba(79,123,255,0.1)' }}>
              <span className="text-sm">{country.flag}</span>
              <span>{country.currencyCode}</span>
            </button>
            <AnimatePresence>
              {showCountry && (
                <motion.div initial={{ opacity: 0, y: 6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }} transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-2 w-52 rounded-2xl p-1.5 z-50 overflow-hidden"
                  style={{ background: 'rgba(8,12,32,0.97)', backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(79,123,255,0.18)',
                    boxShadow: '0 0 30px rgba(79,123,255,0.15), 0 20px 40px rgba(0,0,0,0.5)' }}>
                  {COUNTRIES.map(c => (
                    <button key={c.code} onClick={() => { setCountryCode(c.code); setShowCountry(false) }}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center gap-3 cursor-pointer ${
                        c.code === country.code ? 'text-white' : 'text-[#A8B2D1] hover:text-white hover:bg-[#4F7BFF]/8'
                      }`}
                      style={c.code === country.code ? { background: 'rgba(79,123,255,0.15)', border: '1px solid rgba(79,123,255,0.2)' } : {}}>
                      <span className="text-base">{c.flag}</span>
                      <div>
                        <div className="text-xs font-medium">{c.name}</div>
                        <div className="text-[10px] text-[#6F7D9E]">{c.currencyCode}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300"
            style={{
              background: searchFocused ? 'rgba(79,123,255,0.1)' : 'rgba(79,123,255,0.04)',
              border: searchFocused ? '1px solid rgba(0,229,255,0.3)' : '1px solid rgba(79,123,255,0.1)',
              boxShadow: searchFocused ? '0 0 16px rgba(0,229,255,0.15)' : 'none',
            }}>
            <Search size={13} style={{ color: searchFocused ? '#00E5FF' : '#6F7D9E' }} />
            <input type="text" placeholder="Search trips, expenses..."
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              className="bg-transparent text-xs text-[#F0F4FF] placeholder:text-[#6F7D9E] outline-none w-40" />
          </div>

          {/* Bell */}
          <div className="relative">
            <button onClick={() => { setShowNotif(!showNotif); setShowConfirm(false) }}
              className="relative p-2.5 rounded-xl text-[#6F7D9E] hover:text-[#00E5FF] hover:bg-[#4F7BFF]/10 transition-all cursor-pointer"
              aria-label="Notifications">
              <Bell size={17} />
              {unreadCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#4F7BFF,#FF2E9F)',
                    boxShadow: '0 0 8px rgba(255,46,159,0.6)' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotif && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(8,12,32,0.97)', backdropFilter: 'blur(28px)',
                    border: '1px solid rgba(79,123,255,0.18)',
                    boxShadow: '0 0 40px rgba(79,123,255,0.15), 0 24px 48px rgba(0,0,0,0.5)',
                    maxHeight: '80vh', zIndex: 50 }}>
                  <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg,transparent,rgba(79,123,255,0.6),transparent)' }} />
                  <div className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: '1px solid rgba(79,123,255,0.1)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#F0F4FF]">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full text-[#00E5FF]"
                          style={{ background:'rgba(0,229,255,0.1)', border:'1px solid rgba(0,229,255,0.2)' }}>
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead}
                          className="flex items-center gap-1 text-[11px] text-[#6F7D9E] hover:text-[#00E5FF] cursor-pointer px-2 py-1 rounded-lg hover:bg-[#4F7BFF]/8 transition-colors">
                          <CheckCheck size={11} />All read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button onClick={() => setShowConfirm(true)}
                          className="p-1.5 rounded-lg text-[#6F7D9E] hover:text-[#FF4D6D] hover:bg-[#FF4D6D]/8 cursor-pointer transition-colors">
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                  <AnimatePresence>
                    {showConfirm && (
                      <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }}
                        exit={{ height:0,opacity:0 }} className="overflow-hidden px-4 py-3"
                        style={{ background:'rgba(255,77,109,0.06)', borderBottom:'1px solid rgba(255,77,109,0.15)' }}>
                        <p className="text-xs text-[#A8B2D1] mb-2">Clear all notifications?</p>
                        <div className="flex gap-2">
                          <button onClick={() => setShowConfirm(false)}
                            className="flex-1 py-1.5 rounded-lg text-xs text-[#6F7D9E] hover:text-white cursor-pointer transition-colors"
                            style={{ background:'rgba(79,123,255,0.06)', border:'1px solid rgba(79,123,255,0.12)' }}>
                            Cancel
                          </button>
                          <button onClick={async () => { await clearAll(); setShowConfirm(false) }}
                            className="flex-1 py-1.5 rounded-lg text-xs text-[#FF4D6D] hover:bg-[#FF4D6D]/20 cursor-pointer transition-colors"
                            style={{ border:'1px solid rgba(255,77,109,0.25)' }}>
                            Clear All
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="overflow-y-auto" style={{ maxHeight: '340px' }}>
                    {notifications.length === 0
                      ? <EmptyState title="No notifications" description="You're all caught up." className="py-8" />
                      : <div className="p-2 space-y-1">
                          {notifications.map(n => (
                            <NotificationCard key={n.id} notification={n}
                              onClick={() => !n.read && markRead(n.id)} />
                          ))}
                        </div>
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/trip-planner">
            <Button size="sm" className="hidden sm:flex">
              <Plus size={14} />New Trip
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

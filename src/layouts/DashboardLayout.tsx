import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar, MobileMenuButton } from '@/layouts/Sidebar'
import { Navbar } from '@/layouts/Navbar'
import AnimatedBackground from '@/components/ui/AnimatedBackground'

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen cyber-bg flex flex-col" style={{ isolation: 'isolate' }}>

      <AnimatedBackground />

      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main */}
      <div className="lg:pl-64 relative flex flex-col flex-1 min-h-screen" style={{ zIndex: 1 }}>
        <div className="flex items-center gap-3 px-4 pt-4 lg:hidden">
          <MobileMenuButton onClick={() => setMobileOpen(true)} />
        </div>
        <Navbar />
        <main className="flex-1 flex flex-col px-4 lg:px-8 py-8 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Palette,
  Bell,
  Globe,
  Shield,
  User,
  Moon,
  Sun,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { useAuthUser } from '@/hooks/useAuthUser'
import { insertNotification } from '@/lib/notifications'

const settingsSections = [
  {
    title: 'Appearance',
    icon: Palette,
    items: [
      { id: 'theme', label: 'Theme', type: 'theme' as const },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    items: [
      { id: 'push', label: 'Push Notifications', type: 'toggle' as const, default: true },
      { id: 'email', label: 'Email Notifications', type: 'toggle' as const, default: true },
      { id: 'expense', label: 'Expense Alerts', type: 'toggle' as const, default: true },
      { id: 'trip', label: 'Trip Reminders', type: 'toggle' as const, default: false },
    ],
  },
  {
    title: 'Preferences',
    icon: Globe,
    items: [
      { id: 'language', label: 'Language', type: 'select' as const, options: [
        { value: 'en', label: 'English' },
        { value: 'hi', label: 'Hindi' },
        { value: 'bn', label: 'Bengali' },
        { value: 'ta', label: 'Tamil' },
      ], default: 'en' },
      { id: 'currency', label: 'Currency', type: 'select' as const, options: [
        { value: 'INR', label: 'INR (₹)' },
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
      ], default: 'INR' },
    ],
  },
  {
    title: 'Privacy & Account',
    icon: Shield,
    items: [
      { id: 'profile', label: 'Profile Visibility', type: 'select' as const, options: [
        { value: 'public', label: 'Public' },
        { value: 'friends', label: 'Friends Only' },
        { value: 'private', label: 'Private' },
      ], default: 'friends' },
      { id: 'data', label: 'Data Sharing', type: 'toggle' as const, default: false },
    ],
  },
]

export default function SettingsPage() {
  const { user } = useAuthUser()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    push: true,
    email: true,
    expense: true,
    trip: false,
    data: false,
  })
  const [selects, setSelects] = useState<Record<string, string>>({
    language: 'en',
    currency: 'USD',
    profile: 'friends',
  })
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  })
  const [saving, setSaving] = useState(false)

  // Load settings from Supabase on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        if (data.theme) setTheme(data.theme)
        if (data.toggles) setToggles(data.toggles)
        if (data.selects) setSelects(data.selects)
      }
    }
    loadSettings()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    const { error } = await supabase.from('user_settings').upsert({
      user_id: user.id,
      theme,
      toggles,
      selects,
      updated_at: new Date().toISOString(),
    })

    setSaving(false)

    if (error) {
      setToast({ visible: true, message: 'Failed to save settings.', type: 'error' })
      return
    }

    setToast({ visible: true, message: 'Settings saved successfully!', type: 'success' })
    void insertNotification(user.id, '⚙️ Settings Saved', 'Your preferences have been updated.', 'info')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return
    await supabase.auth.signOut()
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-jakarta">
          Settings
        </h1>
        <p className="text-slate-400 mt-1">Manage your preferences and account</p>
      </div>

      {settingsSections.map((section, si) => {
        const Icon = section.icon
        return (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1 }}
          >
            <GlassCard>
              <div className="flex items-center gap-2 mb-6">
                <Icon size={18} className="text-royal" />
                <h2 className="text-sm font-semibold text-white font-jakarta">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-300">{item.label}</span>
                    {item.type === 'toggle' && (
                      <button
                        onClick={() => setToggles({ ...toggles, [item.id]: !toggles[item.id] })}
                        className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                          toggles[item.id] ? 'bg-royal' : 'bg-white/10'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            toggles[item.id] ? 'translate-x-5.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    )}
                    {item.type === 'select' && (
                      <select
                        value={selects[item.id]}
                        onChange={(e) => setSelects({ ...selects, [item.id]: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none cursor-pointer"
                      >
                        {item.options!.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[#0f172a]">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {item.type === 'theme' && (
                      <div className="flex gap-2">
                                    <button
                                      onClick={() => setTheme('dark')}
                                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                                        theme === 'dark' ? 'bg-royal/20 text-royal' : 'text-slate-400 hover:text-white'
                                      }`}
                                    >
                          <Moon size={18} />
                        </button>
                                    <button
                                      onClick={() => setTheme('light')}
                                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                                        theme === 'light' ? 'bg-royal/20 text-royal' : 'text-slate-400 hover:text-white'
                                      }`}
                                    >
                          <Sun size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )
      })}

      {/* Account actions */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-6">
          <User size={18} className="text-royal" />
          <h2 className="text-sm font-semibold text-white font-jakarta">
            Account
          </h2>
        </div>
        <div className="space-y-3">
          <Button variant="secondary" className="w-full">Change Password</Button>
          <Button variant="secondary" className="w-full">Export Data</Button>
          <Button variant="danger" className="w-full" onClick={handleDeleteAccount}>Delete Account</Button>
        </div>
      </GlassCard>

      <Button className="w-full" onClick={handleSave} loading={saving}>
        Save Settings
      </Button>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  )
}

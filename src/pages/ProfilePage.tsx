import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Settings, Award, Heart, Pencil, Save, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { TripCard } from '@/components/TripCard'
import { Toast } from '@/components/ui/Toast'
import { useAuthUser } from '@/hooks/useAuthUser'
import { useTrips } from '@/hooks/useTrips'
import { useCountry } from '@/context/CountryContext'
import { supabase } from '@/lib/supabase'
import { insertNotification } from '@/lib/notifications'

export default function ProfilePage() {
  const { user, loading: userLoading } = useAuthUser()
  const { trips, loading: tripsLoading } = useTrips()
  const { formatAmount } = useCountry()

  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  })

  const completedTrips = trips.filter((t) => t.status === 'completed')
  const totalTrips = trips.length
  const totalSpent = trips.reduce((s, t) => s + t.spent, 0)

  const stats = [
    { label: 'Total Trips', value: totalTrips, icon: MapPin },
    { label: 'Completed', value: completedTrips.length, icon: Award },
    { label: 'Total Spent', value: formatAmount(totalSpent), icon: Calendar },
    { label: 'Saved Places', value: 0, icon: Heart },
  ]

  const startEdit = () => {
    setEditName(user?.name || '')
    setEditMode(true)
  }

  const cancelEdit = () => {
    setEditMode(false)
    setEditName('')
  }

  const saveProfile = async () => {
    if (!user || !editName.trim()) return
    setSaving(true)

    // Update auth user metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: editName.trim() },
    })

    // Also upsert in profiles table if it exists
    await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: editName.trim(), email: user.email })

    setSaving(false)

    if (authError) {
      setToast({ visible: true, message: 'Failed to update profile.', type: 'error' })
      return
    }

    setEditMode(false)
    setToast({ visible: true, message: 'Profile updated successfully!', type: 'success' })

    // Notify — fire and forget
    void insertNotification(user.id, '👤 Profile Updated', 'Your display name has been updated.', 'info')

    // Refresh page to show updated name
    window.location.reload()
  }

  if (userLoading || tripsLoading) {
    return <EmptyState title="Loading profile..." />
  }

  if (!user) {
    return (
      <EmptyState
        title="Sign in required"
        description="Log in to view your profile."
        action={
          <Link to="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <GlassCard glow="royal" className="text-center py-8">
        <Avatar src={user.avatar} name={user.name} size="xl" className="mx-auto" />

        {editMode ? (
          <div className="mt-4 max-w-xs mx-auto space-y-3">
            <Input
              label="Display Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Your name"
            />
            <div className="flex justify-center gap-2">
              <Button size="sm" variant="secondary" onClick={cancelEdit}>
                <X size={14} />
                Cancel
              </Button>
              <Button size="sm" onClick={saveProfile} loading={saving}>
                <Save size={14} />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mt-4 font-jakarta">
              {user.name}
            </h1>
            <p className="text-slate-400 mt-1">{user.email}</p>
            {user.role && <p className="text-sm text-[#5c7cfa] mt-1">{user.role}</p>}
            <div className="flex justify-center gap-3 mt-6">
              <Link to="/settings">
                <Button variant="secondary" size="sm">
                  <Settings size={14} />
                  Settings
                </Button>
              </Link>
              <Button size="sm" onClick={startEdit}>
                <Pencil size={14} />
                Edit Profile
              </Button>
            </div>
          </>
        )}
      </GlassCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard padding="sm" className="text-center">
                <Icon size={20} className="text-royal mx-auto mb-2" />
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4 font-jakarta">
          Completed Trips
        </h2>
        {completedTrips.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {completedTrips.map((trip) => (
              <Link key={trip.id} to={`/trips/${trip.id}`}>
                <TripCard trip={trip} />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No completed trips yet" description="Trips you finish will show up here." />
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4 font-jakarta">
          Saved Destinations
        </h2>
        <EmptyState
          title="No saved destinations"
          description="Destinations you save will appear here."
        />
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  )
}

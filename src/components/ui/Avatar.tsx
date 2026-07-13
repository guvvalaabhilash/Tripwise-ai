import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const displayName = name || 'User'
  return (
    <div
      className={cn(
        'rounded-full overflow-hidden flex items-center justify-center font-semibold text-white shrink-0',
        sizeMap[size],
        className,
      )}
      style={{
        background: 'linear-gradient(135deg, #4F7CFF, #00C2FF)',
        boxShadow: '0 0 10px rgba(79,124,255,0.3)',
      }}
    >
      {src ? (
        <img src={src} alt={displayName} className="w-full h-full object-cover" />
      ) : (
        getInitials(displayName)
      )}
    </div>
  )
}

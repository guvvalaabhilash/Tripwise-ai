import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  className?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, className, action }: EmptyStateProps) {
  return (
    <div
      className={cn('text-center py-10 px-6 rounded-2xl', className)}
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
    >
      <div className="w-9 h-9 rounded-xl mx-auto mb-3 flex items-center justify-center"
        style={{ background: 'rgba(79,124,255,0.1)' }}>
        <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg,#4F7CFF,#00C2FF)' }} />
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      {description && (
        <p className="text-xs text-[#AEB7C6]/70 mt-1.5 max-w-xs mx-auto leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

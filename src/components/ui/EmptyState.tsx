import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string; description?: string; className?: string; action?: React.ReactNode
}

export function EmptyState({ title, description, className, action }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 px-6 rounded-2xl', className)}
      style={{ background:'rgba(79,123,255,0.025)', border:'1px dashed rgba(79,123,255,0.15)' }}>
      <div className="w-10 h-10 rounded-xl mx-auto mb-4 flex items-center justify-center"
        style={{ background:'rgba(79,123,255,0.1)', boxShadow:'0 0 16px rgba(79,123,255,0.2)' }}>
        <div className="w-2.5 h-2.5 rounded-full pulse-glow"
          style={{ background:'linear-gradient(135deg,#4F7BFF,#00E5FF)' }} />
      </div>
      <p className="text-sm font-semibold text-[#C0C8E8]">{title}</p>
      {description && <p className="text-xs text-[#6F7D9E] mt-2 max-w-xs mx-auto leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

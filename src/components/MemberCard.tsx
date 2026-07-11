import { GlassCard } from '@/components/ui/GlassCard'
import { Avatar } from '@/components/ui/Avatar'
import { useCountry } from '@/context/CountryContext'
import type { MemberContribution } from '@/types'

interface MemberCardProps {
  member: MemberContribution
}

export function MemberCard({ member }: MemberCardProps) {
  const { formatAmount } = useCountry()
  const isPositive = member.balance >= 0

  return (
    <GlassCard padding="sm" className="flex items-center gap-4">
      <Avatar src={member.avatar} name={member.name} size="lg" />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white">{member.name}</h4>
        <div className="flex gap-4 text-xs text-slate-400 mt-1">
          <span>Paid: {formatAmount(member.paid)}</span>
          <span>Owed: {formatAmount(member.owed)}</span>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
        >
          {isPositive ? '+' : ''}{formatAmount(member.balance)}
        </p>
        <p className="text-[10px] text-slate-500">
          {isPositive ? 'gets back' : 'owes'}
        </p>
      </div>
    </GlassCard>
  )
}

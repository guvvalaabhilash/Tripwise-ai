import { motion } from 'framer-motion'
import { Utensils, Car, Home, Camera, ShoppingBag, MoreHorizontal } from 'lucide-react'
import { formatShortDate } from '@/lib/utils'
import { useCountry } from '@/context/CountryContext'
import type { Expense, ExpenseCategory } from '@/types'
import GlassCard from '@/components/ui/GlassCard'

const categoryConfig: Record<ExpenseCategory, { icon: React.ReactNode; color: string; bg: string }> = {
  food:          { icon: <Utensils size={15} />,     color: '#FFB547', bg: 'rgba(255,181,71,0.12)'  },
  transport:     { icon: <Car size={15} />,           color: '#4F7BFF', bg: 'rgba(79,123,255,0.12)'  },
  accommodation: { icon: <Home size={15} />,          color: '#7B61FF', bg: 'rgba(123,97,255,0.12)'  },
  activities:    { icon: <Camera size={15} />,        color: '#00E5FF', bg: 'rgba(0,229,255,0.12)'   },
  shopping:      { icon: <ShoppingBag size={15} />,   color: '#FF2E9F', bg: 'rgba(255,46,159,0.12)'  },
  other:         { icon: <MoreHorizontal size={15} />,color: '#6F7D9E', bg: 'rgba(111,125,158,0.1)'  },
}

interface ExpenseCardProps {
  expense: Expense
  onClick?: () => void
}

export function ExpenseCard({ expense, onClick }: ExpenseCardProps) {
  const { formatAmount } = useCountry()
  const cat = categoryConfig[expense.category]
  return (
    <GlassCard className="p-3 flex items-center gap-4" onClick={onClick}>
      <motion.div whileHover={{ y: -2 }} className="p-2.5 rounded-xl shrink-0 flex items-center justify-center transition-all duration-200"
        style={{ background: cat.bg, color: cat.color, boxShadow: `0 0 10px ${cat.color}30` }}>
        {cat.icon}
      </motion.div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-[#F8FAFC] truncate">{expense.title}</h4>
        <p className="text-xs text-[#6F7D9E] mt-0.5">{formatShortDate(expense.date)} · {expense.paidByName}</p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-semibold" style={{ color: cat.color, textShadow: `0 0 8px ${cat.color}50` }}>{formatAmount(expense.amount)}</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block"
          style={expense.status === 'paid'
            ? { color: '#19F28C', background: 'rgba(25,242,140,0.1)', border: '1px solid rgba(25,242,140,0.2)' }
            : { color: '#FFB547', background: 'rgba(255,181,71,0.1)',  border: '1px solid rgba(255,181,71,0.2)'  }
          }>
          {expense.status}
        </span>
      </div>
    </GlassCard>
  )
}

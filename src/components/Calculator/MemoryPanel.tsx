import { CalcButton } from './CalculatorButton'
import { memoryGet, memoryClear, memoryAdd, memorySub, memorySet } from '@/utils/calculatorMemory'

interface MemoryPanelProps {
  memory: number
  currentValue: number
  onMemoryChange: (v: number) => void
  onRecall: (v: number) => void
}

export function MemoryPanel({ memory, currentValue, onMemoryChange, onRecall }: MemoryPanelProps) {
  const actions = [
    { label: 'MC', title: 'Memory Clear',  fn: () => { memoryClear(); onMemoryChange(0) } },
    { label: 'MR', title: 'Memory Recall', fn: () => onRecall(memoryGet()) },
    { label: 'MS', title: 'Memory Store',  fn: () => { memorySet(currentValue); onMemoryChange(currentValue) } },
    { label: 'M+', title: 'Memory Add',    fn: () => { memoryAdd(currentValue); onMemoryChange(memoryGet()) } },
    { label: 'M−', title: 'Memory Sub',    fn: () => { memorySub(currentValue); onMemoryChange(memoryGet()) } },
  ]

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Memory</span>
        {memory !== 0 && (
          <span className="text-xs text-[#5c7cfa] font-medium">{memory}</span>
        )}
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {actions.map(a => (
          <CalcButton
            key={a.label}
            label={a.label}
            variant="memory"
            onClick={a.fn}
            aria-label={a.title}
          />
        ))}
      </div>
    </div>
  )
}

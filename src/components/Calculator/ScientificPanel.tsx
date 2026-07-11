import { CalcButton } from './CalculatorButton'

interface ScientificPanelProps {
  onFunction: (fn: string) => void
  onConstant: (val: number, label: string) => void
}

export function ScientificPanel({ onFunction, onConstant }: ScientificPanelProps) {
  const fns = [
    { label: 'sin',  fn: () => onFunction('sin') },
    { label: 'cos',  fn: () => onFunction('cos') },
    { label: 'tan',  fn: () => onFunction('tan') },
    { label: 'log',  fn: () => onFunction('log') },
    { label: 'ln',   fn: () => onFunction('ln') },
    { label: 'n!',   fn: () => onFunction('n!') },
    { label: 'xʸ',  fn: () => onFunction('xy') },
    { label: '1/x', fn: () => onFunction('1/x') },
    { label: '|x|', fn: () => onFunction('|x|') },
    { label: 'π',   fn: () => onConstant(Math.PI, 'π') },
    { label: 'e',   fn: () => onConstant(Math.E,  'e') },
    { label: 'Rad', fn: () => {/* toggle — placeholder */} },
  ]

  return (
    <div
      className="rounded-2xl p-3"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
        Scientific
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {fns.map(f => (
          <CalcButton
            key={f.label}
            label={f.label}
            variant="scientific"
            onClick={f.fn}
          />
        ))}
      </div>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { Display } from './Display'
import { CalcButton } from './CalculatorButton'
import { MemoryPanel } from './MemoryPanel'
import { ScientificPanel } from './ScientificPanel'
import { formatNumber, applyOperator, applyUnary, type CalcOperator } from '@/utils/calculatorEngine'
import { memoryGet } from '@/utils/calculatorMemory'
import { historyAdd, type HistoryEntry } from '@/utils/calculatorHistory'

interface CalculatorProps {
  onHistoryUpdate: (entries: HistoryEntry[]) => void
  showScientific: boolean
}

export function Calculator({ onHistoryUpdate, showScientific }: CalculatorProps) {
  const [display, setDisplay]             = useState('0')
  const [expression, setExpression]       = useState('')
  const [operand, setOperand]             = useState<number | null>(null)
  const [operator, setOperator]           = useState<CalcOperator | null>(null)
  const [waitNext, setWaitNext]           = useState(false)
  const [memory, setMemory]               = useState(() => memoryGet())
  const [copied, setCopied]               = useState(false)

  // ── Core helpers ────────────────────────────────────────────────────────────
  const current = () => parseFloat(display) || 0

  const pushHistory = useCallback((expr: string, result: string) => {
    const entries = historyAdd(expr, result)
    onHistoryUpdate(entries)
  }, [onHistoryUpdate])

  const setDisplayVal = (val: number) => setDisplay(formatNumber(val))

  // ── Input digit / decimal ────────────────────────────────────────────────────
  const inputDigit = useCallback((digit: string) => {
    if (waitNext) {
      setDisplay(digit === '.' ? '0.' : digit)
      setWaitNext(false)
      return
    }
    if (digit === '.') {
      if (!display.includes('.')) setDisplay(display + '.')
      return
    }
    setDisplay(display === '0' ? digit : display.length < 16 ? display + digit : display)
  }, [display, waitNext])

  // ── Operator ─────────────────────────────────────────────────────────────────
  const handleOperator = useCallback((op: CalcOperator) => {
    const cur = current()
    if (operator && !waitNext) {
      const result = applyOperator(operator, operand!, cur)
      const expr = `${formatNumber(operand!)} ${operator} ${formatNumber(cur)}`
      setDisplayVal(result)
      setExpression(`${formatNumber(result)} ${op}`)
      setOperand(result)
    } else {
      setExpression(`${formatNumber(cur)} ${op}`)
      setOperand(cur)
    }
    setOperator(op)
    setWaitNext(true)
  }, [display, operator, operand, waitNext])

  // ── Equals ───────────────────────────────────────────────────────────────────
  const handleEquals = useCallback(() => {
    if (!operator || operand === null) return
    const cur = current()
    const result = applyOperator(operator, operand, cur)
    const expr = `${formatNumber(operand)} ${operator} ${formatNumber(cur)}`
    const resultStr = formatNumber(result)
    setDisplay(resultStr)
    setExpression(`${expr} =`)
    setOperand(null)
    setOperator(null)
    setWaitNext(true)
    if (isFinite(result)) pushHistory(expr, resultStr)
  }, [operator, operand, display, pushHistory])

  // ── Clear / backspace ────────────────────────────────────────────────────────
  const handleClear  = () => { setDisplay('0'); setExpression(''); setOperand(null); setOperator(null); setWaitNext(false) }
  const handleAllClear = () => { handleClear() }
  const handleBackspace = useCallback(() => {
    if (waitNext) return
    const next = display.slice(0, -1)
    setDisplay(next === '' || next === '-' ? '0' : next)
  }, [display, waitNext])

  // ── Unary / scientific ───────────────────────────────────────────────────────
  const handleUnary = useCallback((fn: string) => {
    if (fn === '+/-') { setDisplay(formatNumber(-current())); return }
    if (fn === 'xy')  { handleOperator('xy'); return }
    const result = applyUnary(fn, current())
    const expr = `${fn}(${display})`
    const resultStr = formatNumber(result)
    setDisplay(resultStr)
    setExpression(expr)
    setWaitNext(true)
    if (isFinite(result)) pushHistory(expr, resultStr)
  }, [display, handleOperator, pushHistory])

  const handleConstant = (val: number, label: string) => {
    setDisplay(formatNumber(val))
    setExpression(label)
    setWaitNext(false)
  }

  // ── Percent ──────────────────────────────────────────────────────────────────
  const handlePercent = useCallback(() => {
    const val = operand !== null ? (operand * current()) / 100 : current() / 100
    setDisplayVal(val)
    setWaitNext(true)
  }, [display, operand])

  // ── Copy ─────────────────────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard?.writeText(display).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // ── Keyboard support ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't fire when user types in an input field
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if ('0123456789.'.includes(e.key)) { inputDigit(e.key); return }
      if (e.key === '+') { handleOperator('+'); return }
      if (e.key === '-') { handleOperator('-'); return }
      if (e.key === '*') { handleOperator('×'); return }
      if (e.key === '/') { e.preventDefault(); handleOperator('÷'); return }
      if (e.key === '%') { handlePercent(); return }
      if (e.key === 'Enter' || e.key === '=') { handleEquals(); return }
      if (e.key === 'Backspace') { handleBackspace(); return }
      if (e.key === 'Escape') { handleClear(); return }
      if (e.key === 'Delete') { handleAllClear(); return }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inputDigit, handleOperator, handleEquals, handleBackspace, handlePercent])

  // ── Button grid ──────────────────────────────────────────────────────────────
  const btns = [
    // Row 1
    { l: 'AC',  v: 'action',   fn: handleAllClear },
    { l: '+/−', v: 'action',   fn: () => handleUnary('+/-') },
    { l: '%',   v: 'action',   fn: handlePercent },
    { l: '÷',   v: 'operator', fn: () => handleOperator('÷') },
    // Row 2
    { l: '7', v: 'number', fn: () => inputDigit('7') },
    { l: '8', v: 'number', fn: () => inputDigit('8') },
    { l: '9', v: 'number', fn: () => inputDigit('9') },
    { l: '×', v: 'operator', fn: () => handleOperator('×') },
    // Row 3
    { l: '4', v: 'number', fn: () => inputDigit('4') },
    { l: '5', v: 'number', fn: () => inputDigit('5') },
    { l: '6', v: 'number', fn: () => inputDigit('6') },
    { l: '−', v: 'operator', fn: () => handleOperator('-') },
    // Row 4
    { l: '1', v: 'number', fn: () => inputDigit('1') },
    { l: '2', v: 'number', fn: () => inputDigit('2') },
    { l: '3', v: 'number', fn: () => inputDigit('3') },
    { l: '+', v: 'operator', fn: () => handleOperator('+') },
    // Row 5
    { l: '⌫',   v: 'action',   fn: handleBackspace },
    { l: '0',   v: 'number',   fn: () => inputDigit('0') },
    { l: '.',   v: 'number',   fn: () => inputDigit('.') },
    { l: '=',   v: 'equals',   fn: handleEquals },
  ] as const

  return (
    <div className="space-y-3">
      {/* Display */}
      <div className="relative">
        <Display display={display} expression={expression} memory={memory} />
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-all cursor-pointer"
          aria-label="Copy result"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>

      {/* Memory */}
      <MemoryPanel
        memory={memory}
        currentValue={current()}
        onMemoryChange={setMemory}
        onRecall={v => { setDisplay(formatNumber(v)); setWaitNext(false) }}
      />

      {/* Scientific panel */}
      {showScientific && (
        <ScientificPanel
          onFunction={handleUnary}
          onConstant={handleConstant}
        />
      )}

      {/* Standard button grid */}
      <div
        className="rounded-2xl p-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="grid grid-cols-4 gap-2">
          {btns.map(b => (
            <CalcButton
              key={b.l}
              label={b.l}
              variant={b.v as any}
              onClick={b.fn}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

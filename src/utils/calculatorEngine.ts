// Pure calculator logic — no side effects, no API calls

export type CalcOperator = '+' | '-' | '×' | '÷' | '%' | 'xy'

export interface CalcState {
  display: string
  expression: string
  memory: number
  hasResult: boolean
  waitingForOperand: boolean
  operator: CalcOperator | null
  operand: number | null
}

export const initialCalcState: CalcState = {
  display: '0',
  expression: '',
  memory: 0,
  hasResult: false,
  waitingForOperand: false,
  operator: null,
  operand: null,
}

export function formatNumber(n: number): string {
  if (!isFinite(n)) return n > 0 ? 'Infinity' : n < 0 ? '-Infinity' : 'Error'
  if (isNaN(n)) return 'Error'
  // Avoid scientific notation for reasonable ranges
  if (Math.abs(n) < 1e12 && Math.abs(n) > 1e-7 || n === 0) {
    const str = parseFloat(n.toPrecision(12)).toString()
    return str
  }
  return n.toExponential(6)
}

export function applyOperator(op: CalcOperator, a: number, b: number): number {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '×': return a * b
    case '÷': return b === 0 ? NaN : a / b
    case '%': return a % b
    case 'xy': return Math.pow(a, b)
  }
}

export function applyUnary(fn: string, val: number): number {
  switch (fn) {
    case 'x²':  return val * val
    case '√':   return val < 0 ? NaN : Math.sqrt(val)
    case '1/x': return val === 0 ? NaN : 1 / val
    case '|x|': return Math.abs(val)
    case 'sin': return Math.sin((val * Math.PI) / 180)
    case 'cos': return Math.cos((val * Math.PI) / 180)
    case 'tan': return Math.tan((val * Math.PI) / 180)
    case 'log': return val <= 0 ? NaN : Math.log10(val)
    case 'ln':  return val <= 0 ? NaN : Math.log(val)
    case 'n!':  return factorial(Math.round(val))
    case '+/-': return -val
    default:    return val
  }
}

function factorial(n: number): number {
  if (n < 0 || !isFinite(n)) return NaN
  if (n === 0 || n === 1) return 1
  if (n > 170) return Infinity
  let result = 1
  for (let i = 2; i <= n; i++) result *= i
  return result
}

// Safe eval for expressions with parentheses
export function safeEval(expr: string): number {
  try {
    // Replace display operators with JS operators
    const sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, String(Math.PI))
      .replace(/e(?![0-9])/g, String(Math.E))
    // Only allow safe characters
    if (!/^[0-9+\-*/().e\s]+$/.test(sanitized)) return NaN
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + sanitized + ')')()
    return typeof result === 'number' ? result : NaN
  } catch {
    return NaN
  }
}

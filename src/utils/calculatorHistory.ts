// localStorage-backed calculation history — max 100 entries

const KEY      = 'calc_history'
const MAX_ENTRIES = 100

export interface HistoryEntry {
  id: string
  expression: string
  result: string
  timestamp: number
}

export function historyGet(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as HistoryEntry[]
  } catch { return [] }
}

export function historyAdd(expression: string, result: string) {
  const entries = historyGet()
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    expression,
    result,
    timestamp: Date.now(),
  }
  const next = [entry, ...entries].slice(0, MAX_ENTRIES)
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* quota */ }
  return next
}

export function historyClear() {
  try { localStorage.removeItem(KEY) } catch { /* noop */ }
}

export function historyRemove(id: string) {
  const next = historyGet().filter(e => e.id !== id)
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* noop */ }
  return next
}

// localStorage-backed memory slots — completely isolated

const KEY = 'calc_memory'

export function memoryGet(): number {
  try { return parseFloat(localStorage.getItem(KEY) || '0') || 0 } catch { return 0 }
}
export function memorySet(v: number) {
  try { localStorage.setItem(KEY, String(v)) } catch { /* quota */ }
}
export function memoryClear() {
  try { localStorage.removeItem(KEY) } catch { /* noop */ }
}
export function memoryAdd(v: number) { memorySet(memoryGet() + v) }
export function memorySub(v: number) { memorySet(memoryGet() - v) }

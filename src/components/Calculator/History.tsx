import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Copy, Clock } from 'lucide-react'
import type { HistoryEntry } from '@/utils/calculatorHistory'

interface HistoryProps {
  entries: HistoryEntry[]
  onUse: (result: string) => void
  onClear: () => void
  onRemove: (id: string) => void
}

export function History({ entries, onUse, onClear, onRemove }: HistoryProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {/* noop */})
  }

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        maxHeight: 340,
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">History</span>
          {entries.length > 0 && (
            <span className="text-[10px] bg-white/8 text-slate-400 px-1.5 py-0.5 rounded-full">
              {entries.length}
            </span>
          )}
        </div>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
            aria-label="Clear history"
          >
            <Trash2 size={12} />
            Clear
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 p-2 space-y-1">
        {entries.length === 0 ? (
          <div className="text-center text-slate-600 text-xs py-8">
            No calculations yet
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {entries.map(e => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => onUse(e.result)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-500 truncate">{e.expression}</div>
                  <div className="text-sm font-medium text-white truncate">= {e.result}</div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button
                    onClick={ev => { ev.stopPropagation(); copyToClipboard(e.result) }}
                    className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Copy result"
                  >
                    <Copy size={11} />
                  </button>
                  <button
                    onClick={ev => { ev.stopPropagation(); onRemove(e.id) }}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                    aria-label="Remove entry"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

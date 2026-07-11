import { motion, AnimatePresence } from 'framer-motion'

interface DisplayProps {
  expression: string
  display: string
  memory: number
}

export function Display({ expression, display, memory }: DisplayProps) {
  // Dynamically shrink font for long numbers
  const len = display.replace('-', '').length
  const fontSize =
    len <= 9  ? 'text-5xl' :
    len <= 13 ? 'text-4xl' :
    len <= 17 ? 'text-3xl' : 'text-2xl'

  return (
    <div
      className="relative rounded-2xl px-6 pt-5 pb-4 mb-2 overflow-hidden select-none"
      style={{
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.06)',
        minHeight: 130,
      }}
    >
      {/* Top highlight */}
      <div
        className="absolute top-0 left-8 right-8 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)' }}
      />

      {/* Memory indicator */}
      {memory !== 0 && (
        <span className="absolute top-3 left-4 text-[10px] font-bold text-royal bg-royal/20 px-1.5 py-0.5 rounded">
          M
        </span>
      )}

      {/* Expression */}
      <div className="text-right text-slate-500 text-sm mb-1 min-h-5 truncate">
        {expression || '\u00A0'}
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        <motion.div
          key={display}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.12 }}
          className={`text-right font-light text-white tracking-tight ${fontSize} leading-none`}
          style={{ fontFamily: 'var(--font-inter)' }}
          aria-live="polite"
          aria-label={`Result: ${display}`}
        >
          {display}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, Clock, Wrench, Plane } from 'lucide-react'
import { Calculator } from '@/components/Calculator/Calculator'
import { History } from '@/components/Calculator/History'
import { QuickTools } from '@/components/Calculator/QuickTools'
import { TravelTools } from '@/components/Calculator/TravelTools'
import { historyGet, historyClear, historyRemove, type HistoryEntry } from '@/utils/calculatorHistory'

type RightTab = 'history' | 'quick' | 'travel'

export default function CalculatorPage() {
  const [history, setHistory]             = useState<HistoryEntry[]>(() => historyGet())
  const [showScientific, setShowScientific] = useState(false)
  const [rightTab, setRightTab]           = useState<RightTab>('history')
  const [historyKey, setHistoryKey]       = useState(0)   // force re-use recall

  // recalled value is injected via the Calculator key reset trick
  const [recalledVal, setRecalledVal]     = useState<string | null>(null)

  const handleHistoryUpdate = (entries: HistoryEntry[]) => setHistory(entries)

  const handleClearHistory = () => { historyClear(); setHistory([]) }
  const handleRemoveEntry  = (id: string) => setHistory(historyRemove(id))
  const handleUseEntry     = (result: string) => {
    setRecalledVal(result)
    setHistoryKey(k => k + 1)
  }

  // Sync history on mount
  useEffect(() => { setHistory(historyGet()) }, [])

  const tabs: Array<{ id: RightTab; label: string; icon: React.ReactNode }> = [
    { id: 'history', label: 'History', icon: <Clock size={14} /> },
    { id: 'quick',   label: 'Tools',   icon: <Wrench size={14} /> },
    { id: 'travel',  label: 'Travel',  icon: <Plane size={14} /> },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white font-jakarta">Calculator</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Standard · Scientific · Travel tools · History
          </p>
        </div>

        {/* Scientific toggle */}
        <button
          onClick={() => setShowScientific(s => !s)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
            showScientific
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25'
              : 'bg-white/5 text-slate-400 border-white/8 hover:text-white hover:bg-white/10'
          }`}
          aria-pressed={showScientific}
          aria-label="Toggle scientific panel"
        >
          <FlaskConical size={15} />
          Scientific
        </button>
      </motion.div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left: Calculator (70%) ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="w-full lg:w-[62%]"
        >
          <div
            className="rounded-3xl p-5"
            style={{
              background: 'rgba(255,255,255,0.035)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Keyboard hint */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-slate-600 font-medium tracking-wide uppercase">
                Calculator
              </span>
              <span className="text-[10px] text-slate-700 hidden sm:block">
                Keyboard supported · Enter = · Esc clear
              </span>
            </div>

            <Calculator
              key={historyKey}
              onHistoryUpdate={handleHistoryUpdate}
              showScientific={showScientific}
            />
          </div>
        </motion.div>

        {/* ── Right: Panels (30%) ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="w-full lg:w-[38%] space-y-4"
        >
          {/* Tab switcher */}
          <div
            className="flex rounded-xl p-1 gap-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setRightTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  rightTab === t.id
                    ? 'bg-royal/20 text-royal border border-royal/25'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          {rightTab === 'history' && (
            <History
              entries={history}
              onUse={handleUseEntry}
              onClear={handleClearHistory}
              onRemove={handleRemoveEntry}
            />
          )}
          {rightTab === 'quick' && <QuickTools />}
          {rightTab === 'travel' && <TravelTools />}
        </motion.div>

      </div>
    </div>
  )
}

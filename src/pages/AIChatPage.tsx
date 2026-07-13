import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, User, AlertCircle, RotateCcw, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { AI_SUGGESTED_PROMPTS } from '@/constants'
import { sendGroqMessage, type GroqMessage } from '@/lib/groqService'
import { useAuthUser } from '@/hooks/useAuthUser'
import type { ChatMessage } from '@/types'

export default function AIChatPage() {
  const { user } = useAuthUser()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [history, setHistory]   = useState<GroqMessage[]>([])
  const [input, setInput]       = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)
  const firstName = user?.name?.split(' ')[0] || 'Traveler'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const resetConversation = () => {
    setMessages([]); setHistory([]); setError(null)
    inputRef.current?.focus()
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`, role: 'user', content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setInput(''); setIsTyping(true); setError(null)
    try {
      const reply = await sendGroqMessage(history, trimmed)
      setHistory(prev => [...prev, { role:'user', content:trimmed }, { role:'assistant', content:reply }])
      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`, role: 'assistant', content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
      setMessages(prev => prev.filter(m => m.id !== userMsg.id))
      setInput(trimmed)
    } finally { setIsTyping(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const isEmpty = messages.length === 0 && !isTyping

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4F7CFF, #6A5CFF)', boxShadow: '0 0 16px rgba(79,124,255,0.4)' }}>
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white font-[family-name:var(--font-jakarta)]">AI Travel Assistant</h1>
            <p className="text-xs text-[#AEB7C6]/70">Powered by Groq</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={resetConversation}
            className="flex items-center gap-1.5 text-xs text-[#AEB7C6] hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5 border border-white/8 cursor-pointer">
            <RotateCcw size={12} />New chat
          </button>
        )}
      </div>

      <GlassCard className="flex-1 flex flex-col min-h-0" padding="none">
        {/* Empty state with avatar */}
        {isEmpty && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #4F7CFF, #6A5CFF)', boxShadow: '0 0 40px rgba(79,124,255,0.4)' }}>
              <Sparkles size={36} className="text-white" />
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="text-xl font-bold text-white mb-2 font-[family-name:var(--font-jakarta)]">
              Hello {firstName}! 👋
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              className="text-sm text-[#AEB7C6] max-w-sm">
              I'm your AI travel assistant. How can I help you today?
            </motion.p>

            {/* Suggestion grid */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-8 w-full max-w-lg">
              {AI_SUGGESTED_PROMPTS.slice(0, 4).map((prompt, i) => (
                <motion.button key={prompt}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.06 }}
                  onClick={() => sendMessage(prompt)} disabled={isTyping}
                  className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-left text-sm text-[#AEB7C6] hover:text-white transition-all cursor-pointer group disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="truncate text-xs">{prompt}</span>
                  <ArrowRight size={12} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#4F7CFF]" />
                </motion.button>
              ))}
            </motion.div>
          </div>
        )}

        {/* Messages */}
        {!isEmpty && (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 p-4">
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'assistant' ? '' : 'bg-white/8'
                }`}
                  style={msg.role === 'assistant' ? {
                    background: 'linear-gradient(135deg, #4F7CFF, #6A5CFF)',
                    boxShadow: '0 0 12px rgba(79,124,255,0.35)',
                  } : {}}>
                  {msg.role === 'assistant'
                    ? <Sparkles size={14} className="text-white" />
                    : <User size={14} className="text-[#AEB7C6]" />}
                </div>
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm'
                    : 'rounded-tl-sm'
                }`}
                  style={msg.role === 'user'
                    ? { background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.25)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-sm text-white leading-relaxed whitespace-pre-line">
                    {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </p>
                  <span className="text-[10px] text-[#AEB7C6]/40 mt-1.5 block">{msg.timestamp}</span>
                </div>
              </motion.div>
            ))}

            <AnimatePresence>
              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #4F7CFF, #6A5CFF)' }}>
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {[0,1,2].map(i => (
                      <motion.div key={i}
                        animate={{ y: [0,-4,0] }}
                        transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15 }}
                        className="w-1.5 h-1.5 rounded-full mx-0.5"
                        style={{ background: '#4F7CFF' }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mx-3 mb-2 flex items-start gap-2 rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)' }}>
              <AlertCircle size={14} className="text-[#FF4D6D] shrink-0 mt-0.5" />
              <p className="text-xs text-[#FF4D6D]">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div className="flex items-center gap-3 p-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <input ref={inputRef} type="text" value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ask about destinations, itineraries, budgets…"
            disabled={isTyping}
            className="flex-1 bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#AEB7C6]/40 outline-none focus:border-[#4F7CFF]/40 transition-colors disabled:opacity-60" />
          <Button size="sm" onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping} loading={isTyping}>
            <Send size={14} />
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, User, AlertCircle, RotateCcw } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { AI_SUGGESTED_PROMPTS } from '@/constants'
import { sendGroqMessage, type GroqMessage } from '@/lib/groqService'
import type { ChatMessage } from '@/types'

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  // Groq is stateless — we maintain the full conversation history ourselves
  const [history, setHistory] = useState<GroqMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const resetConversation = () => {
    setMessages([])
    setHistory([])
    setError(null)
    inputRef.current?.focus()
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    setError(null)

    try {
      const reply = await sendGroqMessage(history, trimmed)

      // Append both turns to history so next request has full context
      setHistory((prev) => [
        ...prev,
        { role: 'user', content: trimmed },
        { role: 'assistant', content: reply },
      ])

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
      // Restore the input so the user can retry without retyping
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id))
      setInput(trimmed)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-jakarta flex items-center gap-2">
            <Sparkles size={22} className="text-royal-light" />
            AI Travel Assistant
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Powered by Groq — plan trips, get itineraries, split budgets
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={resetConversation}
            title="Start a new conversation"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 border border-white/8 cursor-pointer"
          >
            <RotateCcw size={13} />
            New chat
          </button>
        )}
      </div>

      <GlassCard className="flex-1 flex flex-col min-h-0" padding="sm">
        {/* Message list */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 p-2">
          {messages.length === 0 && !isTyping && (
            <EmptyState
              title="Start planning your trip"
              description="Ask about destinations, get day-by-day itineraries, budget breakdowns, packing lists and more."
              className="py-12 border-none"
            />
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'assistant'
                    ? 'bg-linear-to-br from-royal to-cyan'
                    : 'bg-white/10'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <Sparkles size={15} className="text-white" />
                ) : (
                  <User size={15} className="text-slate-300" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-royal/20 border border-royal/30'
                    : 'bg-white/5 border border-white/8'
                }`}
              >
                <p className="text-sm text-white leading-relaxed whitespace-pre-line">
                  {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                </p>
                <span className="text-[10px] text-slate-500 mt-1.5 block">{msg.timestamp}</span>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-royal to-cyan flex items-center justify-center">
                  <Sparkles size={15} className="text-white" />
                </div>
                <div className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3 flex items-center">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15 }}
                        className="w-2 h-2 rounded-full bg-royal-light"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-2 mb-2 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5"
            >
              <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggested prompts */}
        {messages.length === 0 && (
          <div className="px-2 pb-3">
            <p className="text-xs text-slate-500 mb-2">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {AI_SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={isTyping}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/8 text-slate-300 hover:text-white hover:border-royal/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="flex items-center gap-3 p-2 border-t border-white/8">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about destinations, itineraries, budgets..."
            disabled={isTyping}
            className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-royal/50 transition-colors disabled:opacity-60"
          />
          <Button
            size="sm"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            loading={isTyping}
          >
            <Send size={15} />
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}

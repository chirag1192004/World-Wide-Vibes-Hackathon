'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

const SUGGESTIONS = [
    'What is the safest neighborhood for a pharmacy?',
    'Which area has the highest business survival rate?',
    'Compare Capitol Heights vs Garden District',
    'Best locations for a restaurant in Montgomery?',
]

export default function AiChat() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content:
                "Hi! I'm your CivicPulse AI assistant. Ask me anything about Montgomery's civic data — neighborhoods, business viability, contracts, and more.",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, [messages])

    async function sendMessage(text?: string) {
        const content = text || input.trim()
        if (!content || loading) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const res = await fetch(`${API_BASE}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'chat',
                    data: {
                        question: content,
                        context: 'Montgomery AL civic data, business permits, neighborhood equity, city contracts',
                    },
                }),
            })
            const json = await res.json()
            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: json.output || 'Sorry, I could not process that request.',
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, assistantMsg])
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: 'Sorry, the AI service is currently unavailable. Please try again later.',
                    timestamp: new Date(),
                },
            ])
        }
        setLoading(false)
    }

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!open && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setOpen(true)}
                        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/30 transition-shadow hover:shadow-xl hover:shadow-teal-500/40"
                    >
                        <MessageCircle className="h-6 w-6" />
                        {/* Ping */}
                        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-400" />
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/20"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20">
                                    <Bot className="h-4 w-4 text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">Atlas AI</h3>
                                    <p className="text-xs text-muted-foreground">Civic intelligence assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div
                                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${msg.role === 'user'
                                                ? 'bg-orange-500/20'
                                                : 'bg-teal-500/20'
                                            }`}
                                    >
                                        {msg.role === 'user' ? (
                                            <User className="h-3.5 w-3.5 text-orange-400" />
                                        ) : (
                                            <Bot className="h-3.5 w-3.5 text-teal-400" />
                                        )}
                                    </div>
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-orange-500/15 text-foreground'
                                                : 'bg-secondary/80 text-foreground'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading */}
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-2"
                                >
                                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/20">
                                        <Bot className="h-3.5 w-3.5 text-teal-400" />
                                    </div>
                                    <div className="flex items-center gap-1.5 rounded-2xl bg-secondary/80 px-4 py-3">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-400" />
                                        <span className="text-xs text-muted-foreground">Thinking...</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Suggestions (only show at start) */}
                            {messages.length === 1 && !loading && (
                                <div className="space-y-2 pt-2">
                                    <p className="text-xs font-medium text-muted-foreground">Try asking:</p>
                                    {SUGGESTIONS.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(s)}
                                            className="block w-full rounded-xl border border-border/50 bg-secondary/30 px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-teal-500/30 hover:bg-teal-500/5"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="border-t border-border/50 p-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Ask about Montgomery's data..."
                                    className="flex-1 rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                                    disabled={loading}
                                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={loading || !input.trim()}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white transition-all hover:bg-teal-600 disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

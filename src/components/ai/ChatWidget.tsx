"use client"
import { useEffect, useMemo, useRef, useState } from 'react'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = window.localStorage.getItem('ai_session_id') || undefined
    setSessionId(id || undefined)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  async function send() {
    if (!input.trim()) return
    const userMsg = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, sessionId })
      })
      const data = await res.json()
      if (data?.data?.sessionId && data.data.sessionId !== sessionId) {
        setSessionId(data.data.sessionId)
        window.localStorage.setItem('ai_session_id', data.data.sessionId)
      }
      const reply = data?.data?.message || 'Sorry, Currently Developing Phase By AJX Team '
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'There was an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-[100]">
      {open && (
        <div className="card w-80 h-96 mb-3 flex flex-col shadow-lg">
          <div className="px-3 py-2 border-b font-medium">AI Assistant</div>
          <div ref={scrollRef} className="flex-1 overflow-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-600">Ask me for dish recommendations or help with ordering!</p>
            ) : null}
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <span className={`inline-block rounded px-2 py-1 text-sm ${m.role === 'user' ? 'bg-[hsl(var(--primary))] text-white' : 'bg-gray-100'}`}>{m.content}</span>
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex items-center gap-2">
            <input
              className="input flex-1 h-9"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send() }}
            />
            <button disabled={loading} className="btn-primary h-9 px-3" onClick={send}>{loading ? '...' : 'Send'}</button>
          </div>
        </div>
      )}
      <button className="btn-primary h-10 px-4 shadow-lg" onClick={() => setOpen(!open)}>
        {open ? 'Close Chat' : 'Chat with us'}
      </button>
    </div>
  )
}

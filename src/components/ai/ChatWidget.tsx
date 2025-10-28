"use client"
import { useEffect, useRef, useState } from 'react'
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon, 
  XMarkIcon, 
  AdjustmentsHorizontalIcon,
  UserIcon,
  SparklesIcon,
  ShoppingCartIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/hooks/useCart'

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

type Recommendation = {
  menuItemId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category?: string;
  dietaryInfo?: string[];
}

type UserPreference = {
  dietaryRestrictions?: string[];
  favoriteCategories?: string[];
  spiceLevel?: 'mild' | 'medium' | 'hot';
  budget?: number;
}

type ApiResponse<T = any> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

// Quick prompts for users to get started
const QUICK_PROMPTS = [
  "What are today's specials?",
  "Recommend vegetarian options",
  "What's popular?",
  "Help me choose a main course"
];

export default function ChatWidget() {
  const session: any | null = null
  const router = useRouter()
  const { addItem } = useCart()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [messages, setMessages] = useState<Message[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [showPreferences, setShowPreferences] = useState(false)
  const [userPreferences, setUserPreferences] = useState<UserPreference>({
    dietaryRestrictions: [],
    favoriteCategories: [],
    spiceLevel: 'medium',
    budget: 0
  })
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load session and messages
  useEffect(() => {
    const id = window.localStorage.getItem('ai_session_id') || undefined
    setSessionId(id || undefined)
    
    const savedMessages = window.localStorage.getItem('ai_chat_messages')
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages)
        }
      } catch (e) {
        console.error('Failed to parse saved messages', e)
      }
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, recommendations])

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [open])

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      window.localStorage.setItem('ai_chat_messages', JSON.stringify(messages.slice(-20)))
    }
  }, [messages])

  // Fetch user preferences
  useEffect(() => {
    if (session?.user) {
      const savedPrefs = window.localStorage.getItem('user_ai_preferences')
      if (savedPrefs) {
        try {
          setUserPreferences(JSON.parse(savedPrefs))
        } catch (e) {
          console.error('Failed to parse saved preferences', e)
        }
      } else {
        fetchUserPreferences()
      }
    }
  }, [session])

  async function fetchUserPreferences() {
    if (!session?.user) return
    
    try {
      const res = await fetch('/api/user/preferences')
      const data = await res.json()
      
      if (data.success && data.data) {
        const prefs = data.data
        setUserPreferences({
          dietaryRestrictions: prefs.dietaryRestrictions || [],
          favoriteCategories: prefs.favoriteCategories || [],
          spiceLevel: prefs.spiceLevel || 'medium',
          budget: prefs.budget || 0
        })
        window.localStorage.setItem('user_ai_preferences', JSON.stringify(prefs))
      }
    } catch (e) {
      console.error('Failed to fetch user preferences', e)
    }
  }

  async function savePreferences() {
    window.localStorage.setItem('user_ai_preferences', JSON.stringify(userPreferences))
    
    if (session?.user) {
      try {
        await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userPreferences)
        })
      } catch (e) {
        console.error('Failed to save preferences to API', e)
      }
    }
    setShowPreferences(false)
  }

  async function send(message?: string) {
    const messageToSend = message || input.trim()
    if (!messageToSend) return

    const userMsg: Message = { 
      role: 'user', 
      content: messageToSend,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageToSend, 
          sessionId,
          context: {
            currentPage: window.location.pathname,
            userPreferences: userPreferences,
            userId: session?.user?.id
          }
        })
      })
      
      const raw = await res.json();
      const data = raw as ApiResponse<any>;
      const payload = (data.data ?? raw ?? {}) as any;

      if (payload?.sessionId && payload.sessionId !== sessionId) {
        setSessionId(payload.sessionId)
        window.localStorage.setItem('ai_session_id', payload.sessionId)
      }

      const reply = (typeof payload?.message === 'string' && payload.message) || 
                   (typeof data?.message === 'string' && data.message) || 
                   'Sorry, I am currently unavailable. Please try again later.';

      if (Array.isArray(payload?.recommendations)) {
        setRecommendations(payload.recommendations as Recommendation[])
      } else if (Array.isArray((raw as any)?.recommendations)) {
        setRecommendations((raw as any).recommendations as Recommendation[])
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: reply,
        timestamp: new Date().toISOString()
      }])
    } catch (e) {
      console.error('Chat API error:', e)
      setError('Connection failed. Please check your internet connection.')
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([])
    setRecommendations([])
    window.localStorage.removeItem('ai_chat_messages')
  }

  function askAboutItem(item: Recommendation) {
    setInput(`Tell me more about ${item.name}`)
    setTimeout(() => send(), 100)
  }

  function addRecommendationToCart(item: Recommendation) {
    const price = typeof item.price === 'number' ? item.price : 0
    const id = item.menuItemId || item.name
    addItem({ id, name: item.name, price, quantity: 1, imageUrl: item.imageUrl || undefined })
    router.push('/cart')
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 md:right-6 md:bottom-6">
      {/* Chat Window */}
      {open && (
        <div className="flex flex-col mb-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[calc(100vw-2rem)] md:w-96 h-[85vh] max-h-[600px] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/90 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-white">Restaurant Assistant</h3>
                <p className="text-xs text-white/80">Online • Ready to help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={clearChat}
                className="p-2 text-red-500 hover:text-red-700 transition-colors hover:bg-red-100 rounded-lg"
                title="Clear conversation"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setOpen(false)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors hover:bg-red-100 rounded-lg"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <SparklesIcon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  How can I help you today?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-xs">
                  Ask me about our menu, get personalized recommendations, or inquire about today's specials.
                </p>
                
                {/* Quick Prompts */}
                <div className="space-y-2 w-full max-w-xs">
                  {QUICK_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => send(prompt)}
                      className="w-full text-left p-3 rounded-xl bg-blue-500 border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all duration-200 text-sm text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    m.role === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  }`}>
                    {m.role === 'user' ? (
                      <UserIcon className="w-4 h-4" />
                    ) : (
                      <SparklesIcon className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`max-w-[80%] ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                    <div 
                      className={`rounded-2xl px-4 py-3 ${
                        m.role === 'user' 
                          ? 'bg-primary text-white rounded-br-none' 
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-1">
                      {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <SparklesIcon className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Recommendations */}
            {recommendations.length > 0 && !loading && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <SparklesIcon className="w-4 h-4 text-primary" />
                  Recommended for you
                </div>
                <div className="grid gap-2">
                  {recommendations.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {item.name}
                            </h4>
                            <span className="text-sm font-semibold text-primary whitespace-nowrap ml-2">
                              ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => askAboutItem(item)}
                              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                            >
                              <InformationCircleIcon className="w-3 h-3" />
                              Learn more
                            </button>
                            <button
                              onClick={() => addRecommendationToCart(item)}
                              className="text-xs bg-primary text-white rounded-lg px-3 py-1.5 hover:bg-primary/90 font-medium flex items-center gap-1 transition-colors"
                            >
                              <ShoppingCartIcon className="w-3 h-3" />
                              Add to cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                className="flex-1 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-primary/50 px-4 text-sm transition-all duration-200"
                placeholder="Ask about our menu, specials, or recommendations..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) send() }}
                disabled={loading}
              />
              <button 
                disabled={loading || !input.trim()} 
                className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  input.trim() && !loading 
                    ? 'bg-primary text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`} 
                onClick={() => send()}
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Preferences Panel */}
      {open && showPreferences && (
        <div className="card w-96 h-[500px] mb-3 flex flex-col shadow-lg bg-white dark:bg-gray-800 rounded-lg overflow-hidden absolute bottom-0 right-0">
          <div className="px-4 py-3 border-b flex items-center justify-between bg-primary/10">
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Your Preferences</h3>
            </div>
            <button 
              onClick={() => setShowPreferences(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-6">
            {/* Dietary Restrictions */}
            <div>
              <h4 className="font-medium mb-2 text-sm">Dietary Restrictions</h4>
              <div className="flex flex-wrap gap-2">
                {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher'].map(diet => (
                  <button
                    key={diet}
                    onClick={() => {
                      setUserPreferences(prev => {
                        const restrictions = prev.dietaryRestrictions || [];
                        return {
                          ...prev,
                          dietaryRestrictions: restrictions.includes(diet)
                            ? restrictions.filter(r => r !== diet)
                            : [...restrictions, diet]
                        };
                      });
                    }}
                    className={`text-xs rounded-full px-3 py-1 ${
                      userPreferences.dietaryRestrictions?.includes(diet)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Favorite Categories */}
            <div>
              <h4 className="font-medium mb-2 text-sm">Favorite Categories</h4>
              <div className="flex flex-wrap gap-2">
                {['appetizers', 'soups', 'salads', 'main-courses', 'desserts', 'drinks', 'specials'].map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setUserPreferences(prev => {
                        const favorites = prev.favoriteCategories || [];
                        return {
                          ...prev,
                          favoriteCategories: favorites.includes(category)
                            ? favorites.filter(c => c !== category)
                            : [...favorites, category]
                        };
                      });
                    }}
                    className={`text-xs rounded-full px-3 py-1 ${
                      userPreferences.favoriteCategories?.includes(category)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Spice Level */}
            <div>
              <h4 className="font-medium mb-2 text-sm">Spice Preference</h4>
              <div className="flex gap-2">
                {['mild', 'medium', 'hot'].map(level => (
                  <button
                    key={level}
                    onClick={() => {
                      setUserPreferences(prev => ({
                        ...prev,
                        spiceLevel: level as 'mild' | 'medium' | 'hot'
                      }));
                    }}
                    className={`text-xs rounded-full px-4 py-1.5 flex-1 ${
                      userPreferences.spiceLevel === level
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Budget */}
            <div>
              <h4 className="font-medium mb-2 text-sm">Budget (per person)</h4>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={userPreferences.budget || 0}
                  onChange={e => {
                    setUserPreferences(prev => ({
                      ...prev,
                      budget: parseInt(e.target.value)
                    }));
                  }}
                  className="flex-1"
                />
                <span className="text-sm font-medium">
                  ${userPreferences.budget || 0}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {userPreferences.budget === 0 ? 'No budget limit' : `Budget: $${userPreferences.budget} per person`}
              </p>
            </div>
          </div>
          
          <div className="p-3 border-t flex justify-end">
            <button
              onClick={savePreferences}
              className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
      
      <div className="flex gap-2">
        {open && (
          <button
            className="btn-secondary h-12 w-12 rounded-full shadow-lg flex items-center justify-center"
            onClick={() => setShowPreferences(!showPreferences)}
            title="Set your preferences"
          >
            <AdjustmentsHorizontalIcon className="w-6 h-6" />
          </button>
        )}
        <button 
          className="btn-primary h-12 w-12 rounded-full shadow-lg flex items-center justify-center"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  )
}

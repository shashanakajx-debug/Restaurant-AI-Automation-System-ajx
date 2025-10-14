"use client"
import { useEffect, useRef, useState } from 'react'
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

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

// Minimal API response typing used by many routes
type ApiResponse<T = any> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export default function ChatWidget() {
  // Mock session data to avoid requiring SessionProvider (typed loosely)
  const session: any | null = null
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)
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

  // Load session from localStorage
  useEffect(() => {
    const id = window.localStorage.getItem('ai_session_id') || undefined
    setSessionId(id || undefined)
    
    // Load saved messages if they exist
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      window.localStorage.setItem('ai_chat_messages', JSON.stringify(messages.slice(-20))) // Keep last 20 messages
    }
  }, [messages])

  // Load user preferences from session if available
  useEffect(() => {
    if (session?.user) {
      // Try to load preferences from localStorage first
      const savedPrefs = window.localStorage.getItem('user_ai_preferences')
      if (savedPrefs) {
        try {
          setUserPreferences(JSON.parse(savedPrefs))
        } catch (e) {
          console.error('Failed to parse saved preferences', e)
        }
      } else {
        // If not in localStorage, try to fetch from API
        fetchUserPreferences()
      }
    }
  }, [session])

  // Fetch user preferences from API
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
        
        // Save to localStorage for faster access next time
        window.localStorage.setItem('user_ai_preferences', JSON.stringify(prefs))
      }
    } catch (e) {
      console.error('Failed to fetch user preferences', e)
    }
  }

  // Save preferences to localStorage and API
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

  // Send message to API
  async function send() {
    if (!input.trim()) return
    const userMsg: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    
    try {
      console.log('Sending message to API:', userMsg.content);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg.content, 
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
  console.log('Received response from API:', data);

  // Normalize different possible API shapes
  const payload = (data.data ?? raw ?? {}) as any;

      if (payload?.sessionId && payload.sessionId !== sessionId) {
        setSessionId(payload.sessionId)
        window.localStorage.setItem('ai_session_id', payload.sessionId)
      }

  const reply = (typeof payload?.message === 'string' && payload.message) || (typeof data?.message === 'string' && data.message) || 'Sorry, I am currently unavailable. Please try again later.';

      // Save any recommendations (defensive)
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
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'There was an error connecting to the server. Please try again.',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  // Clear chat history
  function clearChat() {
    setMessages([])
    window.localStorage.removeItem('ai_chat_messages')
    // Keep the session ID
  }

  // Add a recommendation to the chat
  function askAboutItem(item: Recommendation) {
    setInput(`Tell me more about ${item.name}`)
    setTimeout(() => send(), 100)
  }

  return (
    <div className="fixed right-4 bottom-4 z-[100]">
      {open && (
        <div className="card w-96 h-[500px] mb-3 flex flex-col shadow-lg bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between bg-primary/10">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Restaurant Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearChat} 
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Clear chat history"
              >
                Clear
              </button>
              <button 
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-primary/30 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Welcome to our restaurant assistant!
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ask me about our menu, specials, or for recommendations.
                </p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      m.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 text-gray-800 dark:text-gray-200 rounded-tl-none max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {recommendations.length > 0 && !loading && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Recommended items:</p>
                <div className="flex flex-wrap gap-2">
                  {recommendations.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => askAboutItem(item)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full px-3 py-1 text-gray-800 dark:text-gray-200"
                    >
                      {item.name} (${item.price})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t flex items-center gap-2">
            <input
              ref={inputRef}
              className="input flex-1 h-10 rounded-full px-4 bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary/50"
              placeholder="Ask about our menu or specials..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send() }}
              disabled={loading}
            />
            <button 
              disabled={loading || !input.trim()} 
              className={`rounded-full h-10 w-10 flex items-center justify-center ${
                input.trim() && !loading 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`} 
              onClick={send}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
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

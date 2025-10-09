export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    menuItemIds?: string[];
    confidence?: number;
    intent?: string;
  };
}

export interface AISession {
  id: string;
  userId?: string;
  sessionId: string;
  messages: ChatMessage[];
  context: {
    restaurantId: string;
    currentOrder?: string[];
    preferences?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AIRecommendation {
  menuItemId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  confidence: number;
  reasons: string[];
}

export interface AIResponse {
  message: string;
  recommendations?: AIRecommendation[];
  intent?: string;
  confidence?: number;
  metadata?: any;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: {
    currentOrder?: string[];
    preferences?: string[];
  };
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: 'recommendation' | 'review' | 'general' | 'order';
  active: boolean;
}

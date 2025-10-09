// Application configuration constants
export const APP_CONFIG = {
  NAME: 'Restaurant AI Automation System',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-powered restaurant management and customer experience platform',
  AUTHOR: 'Your Company',
  URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

// Database configuration
export const DB_CONFIG = {
  CONNECTION_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;

// API configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
} as const;

// AI configuration
export const AI_CONFIG = {
  PROVIDER: 'openai',
  MODEL: 'gpt-4o',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
} as const;

// Payment configuration
export const PAYMENT_CONFIG = {
  PROVIDER: 'stripe',
  CURRENCY: 'USD',
  TIMEOUT: 30000,
  WEBHOOK_TOLERANCE: 300, // 5 minutes
} as const;

// File upload configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain'],
  UPLOAD_PATH: '/uploads',
} as const;

// Email configuration
export const EMAIL_CONFIG = {
  FROM_NAME: APP_CONFIG.NAME,
  FROM_EMAIL: 'noreply@restaurant-ai.com',
  TEMPLATES: {
    ORDER_CONFIRMATION: 'order_confirmation',
    RESERVATION_CONFIRMATION: 'reservation_confirmation',
    PASSWORD_RESET: 'password_reset',
    WELCOME: 'welcome',
  },
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  TTL: {
    MENU: 5 * 60, // 5 minutes
    USER_SESSION: 24 * 60 * 60, // 24 hours
    ANALYTICS: 60 * 60, // 1 hour
    AI_RESPONSES: 10 * 60, // 10 minutes
  },
} as const;

// Pagination configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// Validation configuration
export const VALIDATION_CONFIG = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 254,
  PHONE_MAX_LENGTH: 20,
  ADDRESS_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000,
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  AI_CHAT_ENABLED: process.env.NEXT_PUBLIC_AI_CHAT_ENABLED === 'true',
  RESERVATIONS_ENABLED: process.env.NEXT_PUBLIC_RESERVATIONS_ENABLED === 'true',
  REVIEWS_ENABLED: process.env.NEXT_PUBLIC_REVIEWS_ENABLED === 'true',
  ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  PAYMENTS_ENABLED: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true',
} as const;

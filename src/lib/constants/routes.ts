// Public routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  MENU: '/menu',
  CART: '/cart',
  CHECKOUT: '/checkout',
  RESERVATIONS: '/reservations',
  ABOUT: '/about',
  CONTACT: '/contact',
} as const;

// Auth routes
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

// Admin routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  MENU: '/admin/menu',
  ORDERS: '/admin/orders',
  ANALYTICS: '/admin/analytics',
  SETTINGS: '/admin/settings',
  USERS: '/admin/users',
  REVIEWS: '/admin/reviews',
} as const;

// API routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/signin',
    LOGOUT: '/api/auth/signout',
    SESSION: '/api/auth/session',
  },
  MENU: {
    LIST: '/api/menu',
    ITEM: '/api/menu/[id]',
    CATEGORIES: '/api/menu/categories',
  },
  ORDERS: {
    LIST: '/api/orders',
    CREATE: '/api/orders',
    ITEM: '/api/orders/[id]',
    STATUS: '/api/orders/[id]/status',
  },
  AI: {
    CHAT: '/api/ai/chat',
    RECOMMENDATIONS: '/api/ai/recommendations',
    REVIEWS: '/api/ai/reviews',
  },
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    ANALYTICS: '/api/admin/analytics',
    USERS: '/api/admin/users',
  },
  PAYMENTS: {
    STRIPE: '/api/payments/stripe',
    WEBHOOK: '/api/webhooks/stripe',
  },
} as const;

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  ...Object.values(ADMIN_ROUTES),
  '/profile',
  '/orders',
  '/favorites',
] as const;

// Routes that require admin role
export const ADMIN_ONLY_ROUTES = [
  ...Object.values(ADMIN_ROUTES),
] as const;

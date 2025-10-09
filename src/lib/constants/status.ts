// Order statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Payment methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  CASH: 'cash',
  DIGITAL_WALLET: 'digital_wallet',
  BANK_TRANSFER: 'bank_transfer',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

// Reservation statuses
export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SEATED: 'seated',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

export type ReservationStatus = typeof RESERVATION_STATUS[keyof typeof RESERVATION_STATUS];

// AI response statuses
export const AI_STATUS = {
  IDLE: 'idle',
  THINKING: 'thinking',
  RESPONDING: 'responding',
  ERROR: 'error',
} as const;

export type AIStatus = typeof AI_STATUS[keyof typeof AI_STATUS];

// Notification types
export const NOTIFICATION_TYPES = {
  ORDER_UPDATE: 'order_update',
  RESERVATION_CONFIRMATION: 'reservation_confirmation',
  PROMOTION: 'promotion',
  REVIEW_REQUEST: 'review_request',
  SYSTEM: 'system',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// Status colors for UI
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: 'yellow',
  [ORDER_STATUS.CONFIRMED]: 'blue',
  [ORDER_STATUS.PREPARING]: 'orange',
  [ORDER_STATUS.READY]: 'green',
  [ORDER_STATUS.DELIVERED]: 'emerald',
  [ORDER_STATUS.CANCELLED]: 'red',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING]: 'yellow',
  [PAYMENT_STATUS.PROCESSING]: 'blue',
  [PAYMENT_STATUS.COMPLETED]: 'green',
  [PAYMENT_STATUS.FAILED]: 'red',
  [PAYMENT_STATUS.REFUNDED]: 'gray',
};

export const RESERVATION_STATUS_COLORS: Record<ReservationStatus, string> = {
  [RESERVATION_STATUS.PENDING]: 'yellow',
  [RESERVATION_STATUS.CONFIRMED]: 'green',
  [RESERVATION_STATUS.SEATED]: 'blue',
  [RESERVATION_STATUS.COMPLETED]: 'emerald',
  [RESERVATION_STATUS.CANCELLED]: 'red',
  [RESERVATION_STATUS.NO_SHOW]: 'red',
};

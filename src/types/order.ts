export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export type PaymentMethod = 
  | 'card'
  | 'cash'
  | 'digital_wallet'
  | 'bank_transfer';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  userId?: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip?: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentIntentId?: string;
  specialInstructions?: string;
  estimatedTime?: number; // in minutes
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  popularItems: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
  }>;
}

export interface CreateOrderRequest {
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  specialInstructions?: string;
  paymentMethod: PaymentMethod;
}

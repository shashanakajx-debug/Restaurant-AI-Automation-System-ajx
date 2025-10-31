export interface CheckoutItem {
  id?: string;
  name: string;
  description?: string;
  price: number; // in dollars
  imageUrl?: string;
  quantity: number;
}

export interface CheckoutRequest {
  items: CheckoutItem[];
  metadata?: Record<string, unknown>;
  paymentMethod?: string; // ✅ added: allows 'card', 'cash', 'cod', 'counter'
}

export interface CheckoutResponse {
  sessionId: string | null;
  url: string | null;
}

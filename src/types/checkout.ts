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
}

export interface CheckoutResponse {
  sessionId: string;
  url?: string | null;
}

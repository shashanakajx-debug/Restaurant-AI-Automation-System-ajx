export interface Review {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  rating: number; // 1-5 stars
  title?: string;
  comment: string;
  foodRating?: number;
  serviceRating?: number;
  ambianceRating?: number;
  images?: string[];
  helpful: number;
  verified: boolean;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentReviews: Review[];
  topKeywords: string[];
}

export interface CreateReviewRequest {
  customerName: string;
  customerEmail: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  foodRating?: number;
  serviceRating?: number;
  ambianceRating?: number;
  images?: string[];
}

export interface AIReviewResponse {
  response: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  suggestedActions?: string[];
  priority: 'low' | 'medium' | 'high';
}

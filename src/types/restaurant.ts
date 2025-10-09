export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  cuisine: string[];
  priceRange: PriceRange;
  operatingHours: OperatingHours;
  settings: RestaurantSettings;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string; // HH:MM format
  close: string; // HH:MM format
  closed: boolean;
}

export interface RestaurantSettings {
  allowReservations: boolean;
  allowDelivery: boolean;
  allowPickup: boolean;
  maxPartySize: number;
  advanceBookingDays: number;
  cancellationPolicy: string;
  paymentMethods: string[];
  taxRate: number;
  serviceCharge?: number;
  tipEnabled: boolean;
  aiChatEnabled: boolean;
  reviewEnabled: boolean;
}

export interface RestaurantStats {
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  popularItems: string[];
  peakHours: string[];
  customerRetention: number;
}

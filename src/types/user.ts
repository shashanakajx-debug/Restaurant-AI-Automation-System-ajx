export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  phone?: string;
  address?: Address;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'staff' | 'customer';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserPreferences {
  dietaryRestrictions?: string[];
  favoriteCategories?: string[];
  notificationSettings?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: string;
  currency: string;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  favoriteItems: string[];
  lastOrderDate?: Date;
  averageOrderValue: number;
}

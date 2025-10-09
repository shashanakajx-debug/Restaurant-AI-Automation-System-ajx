export type ReservationStatus = 
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Reservation {
  id: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  partySize: number;
  date: Date;
  time: string; // HH:MM format
  status: ReservationStatus;
  specialRequests?: string;
  tableNumber?: string;
  restaurantId: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReservationRequest {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  partySize: number;
  date: string; // ISO date string
  time: string; // HH:MM format
  specialRequests?: string;
}

export interface ReservationSlot {
  time: string;
  available: boolean;
  maxPartySize?: number;
}

export interface AvailableSlots {
  date: string;
  slots: ReservationSlot[];
}

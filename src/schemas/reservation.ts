import { z } from 'zod';

// Create reservation schema
export const createReservationSchema = z.object({
  customerInfo: z.object({
    name: z
      .string()
      .min(1, 'Customer name is required')
      .max(100, 'Customer name cannot exceed 100 characters'),
    email: z
      .string()
      .email('Please enter a valid email address')
      .min(1, 'Email is required'),
    phone: z
      .string()
      .regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number'),
  }),
  partySize: z
    .number()
    .min(1, 'Party size must be at least 1')
    .max(20, 'Party size cannot exceed 20'),
  date: z
    .string()
    .datetime('Please provide a valid date'),
  time: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format'),
  specialRequests: z
    .string()
    .max(500, 'Special requests cannot exceed 500 characters')
    .optional(),
  restaurantId: z
    .string()
    .min(1, 'Restaurant ID is required'),
});

// Update reservation schema
export const updateReservationSchema = z.object({
  id: z.string().min(1, 'Reservation ID is required'),
  customerInfo: z.object({
    name: z
      .string()
      .min(1, 'Customer name is required')
      .max(100, 'Customer name cannot exceed 100 characters')
      .optional(),
    email: z
      .string()
      .email('Please enter a valid email address')
      .optional(),
    phone: z
      .string()
      .regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number')
      .optional(),
  }).optional(),
  partySize: z
    .number()
    .min(1, 'Party size must be at least 1')
    .max(20, 'Party size cannot exceed 20')
    .optional(),
  date: z
    .string()
    .datetime('Please provide a valid date')
    .optional(),
  time: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format')
    .optional(),
  specialRequests: z
    .string()
    .max(500, 'Special requests cannot exceed 500 characters')
    .optional(),
  status: z
    .enum(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'])
    .optional(),
  tableNumber: z
    .string()
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
});

// Reservation filter schema
export const reservationFilterSchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'])
    .optional(),
  dateFrom: z
    .string()
    .datetime()
    .optional(),
  dateTo: z
    .string()
    .datetime()
    .optional(),
  partySize: z
    .number()
    .min(1)
    .optional(),
  customerEmail: z
    .string()
    .email()
    .optional(),
  restaurantId: z
    .string()
    .optional(),
  sortBy: z
    .enum(['date', 'time', 'partySize', 'status'])
    .default('date'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('asc'),
  page: z
    .number()
    .min(1)
    .default(1),
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(20),
});

// Check availability schema
export const checkAvailabilitySchema = z.object({
  restaurantId: z
    .string()
    .min(1, 'Restaurant ID is required'),
  date: z
    .string()
    .datetime('Please provide a valid date'),
  partySize: z
    .number()
    .min(1, 'Party size must be at least 1')
    .max(20, 'Party size cannot exceed 20'),
});

// Confirm reservation schema
export const confirmReservationSchema = z.object({
  id: z.string().min(1, 'Reservation ID is required'),
  tableNumber: z
    .string()
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
});

// Cancel reservation schema
export const cancelReservationSchema = z.object({
  id: z.string().min(1, 'Reservation ID is required'),
  reason: z
    .string()
    .min(1, 'Cancellation reason is required')
    .max(500, 'Reason cannot exceed 500 characters'),
});

// Types
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type ReservationFilterInput = z.infer<typeof reservationFilterSchema>;
export type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>;
export type ConfirmReservationInput = z.infer<typeof confirmReservationSchema>;
export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;

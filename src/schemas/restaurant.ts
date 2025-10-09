import { z } from 'zod';

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
});

// Operating hours schema
export const operatingHoursSchema = z.object({
  monday: z.object({
    open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    closed: z.boolean().default(false),
  }),
  tuesday: z.object({
    open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    closed: z.boolean().default(false),
  }),
  wednesday: z.object({
    open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    closed: z.boolean().default(false),
  }),
  thursday: z.object({
    open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    closed: z.boolean().default(false),
  }),
  friday: z.object({
    open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    closed: z.boolean().default(false),
  }),
  saturday: z.object({
    open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    closed: z.boolean().default(false),
  }),
  sunday: z.object({
    open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    closed: z.boolean().default(false),
  }),
});

// Restaurant settings schema
export const restaurantSettingsSchema = z.object({
  allowReservations: z.boolean().default(true),
  allowDelivery: z.boolean().default(true),
  allowPickup: z.boolean().default(true),
  maxPartySize: z.number().min(1).max(20).default(8),
  advanceBookingDays: z.number().min(1).max(365).default(30),
  cancellationPolicy: z.string().default('24 hours notice required'),
  paymentMethods: z.array(z.enum(['card', 'cash', 'digital_wallet', 'bank_transfer'])).default(['card']),
  taxRate: z.number().min(0).max(0.5).default(0.08),
  serviceCharge: z.number().min(0).max(0.5).optional(),
  tipEnabled: z.boolean().default(true),
  aiChatEnabled: z.boolean().default(true),
  reviewEnabled: z.boolean().default(true),
});

// Create restaurant schema
export const createRestaurantSchema = z.object({
  name: z
    .string()
    .min(1, 'Restaurant name is required')
    .max(100, 'Restaurant name cannot exceed 100 characters'),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  address: addressSchema,
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  website: z
    .string()
    .url('Please provide a valid website URL')
    .optional(),
  cuisine: z
    .array(z.string().trim().toLowerCase())
    .min(1, 'At least one cuisine type is required'),
  priceRange: z
    .enum(['$', '$$', '$$$', '$$$$']),
  operatingHours: operatingHoursSchema,
  settings: restaurantSettingsSchema.optional(),
  ownerId: z
    .string()
    .min(1, 'Owner ID is required'),
});

// Update restaurant schema
export const updateRestaurantSchema = createRestaurantSchema.partial().extend({
  id: z.string().min(1, 'Restaurant ID is required'),
});

// Restaurant filter schema
export const restaurantFilterSchema = z.object({
  cuisine: z.array(z.string()).optional(),
  priceRange: z.array(z.enum(['$', '$$', '$$$', '$$$$'])).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  hasDelivery: z.boolean().optional(),
  hasReservations: z.boolean().optional(),
  isOpen: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'rating', 'distance', 'newest']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Types
export type AddressInput = z.infer<typeof addressSchema>;
export type OperatingHoursInput = z.infer<typeof operatingHoursSchema>;
export type RestaurantSettingsInput = z.infer<typeof restaurantSettingsSchema>;
export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
export type RestaurantFilterInput = z.infer<typeof restaurantFilterSchema>;

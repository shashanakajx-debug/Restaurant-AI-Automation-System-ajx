import { z } from 'zod';

// Order item schema
export const orderItemSchema = z.object({
  menuItemId: z
    .string()
    .min(1, 'Menu item ID is required'),
  quantity: z
    .number()
    .min(1, 'Quantity must be at least 1')
    .max(50, 'Quantity cannot exceed 50'),
  specialInstructions: z
    .string()
    .max(500, 'Special instructions cannot exceed 500 characters')
    .optional(),
});

// Customer info schema
export const customerInfoSchema = z.object({
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
    .regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number')
    .optional(),
});

// Delivery address schema
export const deliveryAddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});

// Create order schema
export const createOrderSchema = z.object({
  customerInfo: customerInfoSchema,
  items: z
    .array(orderItemSchema)
    .min(1, 'At least one item is required'),
  specialInstructions: z
    .string()
    .max(1000, 'Special instructions cannot exceed 1000 characters')
    .optional(),
  paymentMethod: z
    .enum(['card', 'cash', 'digital_wallet', 'bank_transfer']),
  deliveryAddress: deliveryAddressSchema.optional(),
  tip: z
    .number()
    .min(0, 'Tip cannot be negative')
    .optional(),
});

// Update order status schema
export const updateOrderStatusSchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
  estimatedTime: z
    .number()
    .min(1, 'Estimated time must be at least 1 minute')
    .max(480, 'Estimated time cannot exceed 8 hours')
    .optional(),
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
});

// Order filter schema
export const orderFilterSchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
    .optional(),
  paymentStatus: z
    .enum(['pending', 'processing', 'completed', 'failed', 'refunded'])
    .optional(),
  dateFrom: z
    .string()
    .datetime()
    .optional(),
  dateTo: z
    .string()
    .datetime()
    .optional(),
  customerEmail: z
    .string()
    .email()
    .optional(),
  sortBy: z
    .enum(['createdAt', 'total', 'status'])
    .default('createdAt'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc'),
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

// Add tip schema
export const addTipSchema = z.object({
  tip: z
    .number()
    .min(0, 'Tip cannot be negative'),
});

// Refund order schema
export const refundOrderSchema = z.object({
  reason: z
    .string()
    .min(1, 'Refund reason is required')
    .max(500, 'Refund reason cannot exceed 500 characters'),
  amount: z
    .number()
    .min(0, 'Refund amount cannot be negative')
    .optional(), // If not provided, full refund
});

// Types
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CustomerInfoInput = z.infer<typeof customerInfoSchema>;
export type DeliveryAddressInput = z.infer<typeof deliveryAddressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
export type AddTipInput = z.infer<typeof addTipSchema>;
export type RefundOrderInput = z.infer<typeof refundOrderSchema>;

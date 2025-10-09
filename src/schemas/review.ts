import { z } from 'zod';

// Create review schema
export const createReviewSchema = z.object({
  customerName: z
    .string()
    .min(1, 'Customer name is required')
    .max(100, 'Customer name cannot exceed 100 characters'),
  customerEmail: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  orderId: z
    .string()
    .optional(),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  title: z
    .string()
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  comment: z
    .string()
    .min(1, 'Comment is required')
    .max(2000, 'Comment cannot exceed 2000 characters'),
  foodRating: z
    .number()
    .min(1, 'Food rating must be at least 1')
    .max(5, 'Food rating cannot exceed 5')
    .optional(),
  serviceRating: z
    .number()
    .min(1, 'Service rating must be at least 1')
    .max(5, 'Service rating cannot exceed 5')
    .optional(),
  ambianceRating: z
    .number()
    .min(1, 'Ambiance rating must be at least 1')
    .max(5, 'Ambiance rating cannot exceed 5')
    .optional(),
  images: z
    .array(z.string().url('Please provide valid image URLs'))
    .max(5, 'Maximum 5 images allowed')
    .optional(),
  restaurantId: z
    .string()
    .min(1, 'Restaurant ID is required'),
});

// Update review schema
export const updateReviewSchema = z.object({
  id: z.string().min(1, 'Review ID is required'),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .optional(),
  title: z
    .string()
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  comment: z
    .string()
    .min(1, 'Comment is required')
    .max(2000, 'Comment cannot exceed 2000 characters')
    .optional(),
  foodRating: z
    .number()
    .min(1, 'Food rating must be at least 1')
    .max(5, 'Food rating cannot exceed 5')
    .optional(),
  serviceRating: z
    .number()
    .min(1, 'Service rating must be at least 1')
    .max(5, 'Service rating cannot exceed 5')
    .optional(),
  ambianceRating: z
    .number()
    .min(1, 'Ambiance rating must be at least 1')
    .max(5, 'Ambiance rating cannot exceed 5')
    .optional(),
  images: z
    .array(z.string().url('Please provide valid image URLs'))
    .max(5, 'Maximum 5 images allowed')
    .optional(),
});

// Review filter schema
export const reviewFilterSchema = z.object({
  restaurantId: z
    .string()
    .optional(),
  rating: z
    .number()
    .min(1)
    .max(5)
    .optional(),
  verified: z
    .boolean()
    .optional(),
  dateFrom: z
    .string()
    .datetime()
    .optional(),
  dateTo: z
    .string()
    .datetime()
    .optional(),
  hasResponse: z
    .boolean()
    .optional(),
  search: z
    .string()
    .optional(),
  sortBy: z
    .enum(['rating', 'helpful', 'newest', 'oldest'])
    .default('newest'),
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

// Add review response schema
export const addReviewResponseSchema = z.object({
  id: z.string().min(1, 'Review ID is required'),
  text: z
    .string()
    .min(1, 'Response text is required')
    .max(1000, 'Response cannot exceed 1000 characters'),
  author: z
    .string()
    .min(1, 'Author name is required')
    .max(100, 'Author name cannot exceed 100 characters'),
});

// Mark review as helpful schema
export const markReviewHelpfulSchema = z.object({
  id: z.string().min(1, 'Review ID is required'),
});

// Verify review schema
export const verifyReviewSchema = z.object({
  id: z.string().min(1, 'Review ID is required'),
});

// Types
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewFilterInput = z.infer<typeof reviewFilterSchema>;
export type AddReviewResponseInput = z.infer<typeof addReviewResponseSchema>;
export type MarkReviewHelpfulInput = z.infer<typeof markReviewHelpfulSchema>;
export type VerifyReviewInput = z.infer<typeof verifyReviewSchema>;

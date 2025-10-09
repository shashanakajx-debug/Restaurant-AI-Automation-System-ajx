import { z } from 'zod';

// Chat request schema
export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(1000, 'Message cannot exceed 1000 characters'),
  sessionId: z
    .string()
    .optional(),
  context: z.object({
    currentOrder: z.array(z.string()).optional(),
    preferences: z.array(z.string()).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    budget: z.number().min(0).optional(),
    partySize: z.number().min(1).max(20).optional(),
  }).optional(),
});

// AI recommendation request schema
export const recommendationRequestSchema = z.object({
  preferences: z
    .array(z.string())
    .default([]),
  dietaryRestrictions: z
    .array(z.string())
    .default([]),
  budget: z
    .number()
    .min(0)
    .optional(),
  partySize: z
    .number()
    .min(1)
    .max(20)
    .default(1),
  restaurantId: z
    .string()
    .min(1, 'Restaurant ID is required'),
  excludeItems: z
    .array(z.string())
    .default([]),
  maxRecommendations: z
    .number()
    .min(1)
    .max(10)
    .default(5),
});

// Review analysis request schema
export const reviewAnalysisRequestSchema = z.object({
  review: z.object({
    rating: z
      .number()
      .min(1)
      .max(5),
    comment: z
      .string()
      .min(1, 'Comment is required')
      .max(2000, 'Comment cannot exceed 2000 characters'),
    customerName: z
      .string()
      .min(1, 'Customer name is required')
      .max(100, 'Customer name cannot exceed 100 characters'),
  }),
  restaurantId: z
    .string()
    .min(1, 'Restaurant ID is required'),
  context: z.object({
    orderId: z.string().optional(),
    previousReviews: z.array(z.string()).optional(),
    restaurantInfo: z.string().optional(),
  }).optional(),
});

// AI session update schema
export const updateAISessionSchema = z.object({
  sessionId: z
    .string()
    .min(1, 'Session ID is required'),
  context: z.object({
    currentOrder: z.array(z.string()).optional(),
    preferences: z.array(z.string()).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    budget: z.number().min(0).optional(),
    partySize: z.number().min(1).max(20).optional(),
  }).optional(),
  metadata: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    location: z.string().optional(),
    deviceType: z.enum(['desktop', 'mobile', 'tablet', 'unknown']).optional(),
  }).optional(),
});

// Prompt template schema
export const promptTemplateSchema = z.object({
  name: z
    .string()
    .min(1, 'Template name is required')
    .max(100, 'Template name cannot exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  template: z
    .string()
    .min(1, 'Template content is required')
    .max(5000, 'Template cannot exceed 5000 characters'),
  variables: z
    .array(z.string())
    .default([]),
  category: z
    .enum(['recommendation', 'review', 'general', 'order'])
    .default('general'),
  active: z
    .boolean()
    .default(true),
});

// AI configuration schema
export const aiConfigSchema = z.object({
  provider: z
    .enum(['openai', 'anthropic', 'google'])
    .default('openai'),
  model: z
    .string()
    .min(1, 'Model name is required'),
  maxTokens: z
    .number()
    .min(1)
    .max(4000)
    .default(1000),
  temperature: z
    .number()
    .min(0)
    .max(2)
    .default(0.7),
  topP: z
    .number()
    .min(0)
    .max(1)
    .default(1),
  frequencyPenalty: z
    .number()
    .min(-2)
    .max(2)
    .default(0),
  presencePenalty: z
    .number()
    .min(-2)
    .max(2)
    .default(0),
});

// Types
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type RecommendationRequestInput = z.infer<typeof recommendationRequestSchema>;
export type ReviewAnalysisRequestInput = z.infer<typeof reviewAnalysisRequestSchema>;
export type UpdateAISessionInput = z.infer<typeof updateAISessionSchema>;
export type PromptTemplateInput = z.infer<typeof promptTemplateSchema>;
export type AIConfigInput = z.infer<typeof aiConfigSchema>;

import { z } from 'zod';

// Menu item schema
export const menuItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(100, 'Item name cannot exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(1000, 'Price cannot exceed $1000'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category cannot exceed 50 characters'),
  tags: z
    .array(z.string().trim().toLowerCase())
    .default([]),
  imageUrl: z
    .string()
    .url('Please provide a valid image URL')
    .optional(),
  active: z
    .boolean()
    .default(true),
  restaurantId: z
    .string()
    .min(1, 'Restaurant ID is required'),
  ingredients: z
    .array(z.string().trim())
    .default([])
    .optional(),
  allergens: z
    .array(z.enum(['gluten', 'dairy', 'eggs', 'fish', 'shellfish', 'tree-nuts', 'peanuts', 'soy']))
    .default([])
    .optional(),
  nutritionalInfo: z.object({
    calories: z.number().min(0).optional(),
    protein: z.number().min(0).optional(), // in grams
    carbs: z.number().min(0).optional(), // in grams
    fat: z.number().min(0).optional(), // in grams
    fiber: z.number().min(0).optional(), // in grams
    sodium: z.number().min(0).optional(), // in milligrams
  }).optional(),
  preparationTime: z
    .number()
    .min(1, 'Preparation time must be at least 1 minute')
    .max(120, 'Preparation time cannot exceed 120 minutes')
    .optional(),
  spiceLevel: z
    .number()
    .min(0)
    .max(5)
    .default(0),
  isVegetarian: z
    .boolean()
    .default(false),
  isVegan: z
    .boolean()
    .default(false),
  isGlutenFree: z
    .boolean()
    .default(false),
  isPopular: z
    .boolean()
    .default(false),
  sortOrder: z
    .number()
    .default(0),
});

// Update menu item schema (all fields optional except ID)
export const updateMenuItemSchema = menuItemSchema.partial().extend({
  id: z.string().min(1, 'Menu item ID is required'),
});

// Menu filter schema
export const menuFilterSchema = z.object({
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).optional(),
  search: z.string().optional(),
  active: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  spiceLevel: z.number().min(0).max(5).optional(),
  sortBy: z.enum(['name', 'price', 'popularity', 'newest']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Menu category schema
export const menuCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Category name cannot exceed 50 characters'),
  description: z
    .string()
    .max(200, 'Description cannot exceed 200 characters')
    .optional(),
  order: z
    .number()
    .min(0, 'Order must be non-negative')
    .default(0),
  active: z
    .boolean()
    .default(true),
  restaurantId: z
    .string()
    .min(1, 'Restaurant ID is required'),
});

// Bulk update menu items schema
export const bulkUpdateMenuItemsSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1, 'Item ID is required'),
    updates: menuItemSchema.partial(),
  })),
});

// Types
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type MenuFilterInput = z.infer<typeof menuFilterSchema>;
export type MenuCategoryInput = z.infer<typeof menuCategorySchema>;
export type BulkUpdateMenuItemsInput = z.infer<typeof bulkUpdateMenuItemsSchema>;

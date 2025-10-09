import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description?: string;
  price: number;
  category: string;
  tags: string[];
  imageUrl?: string;
  active: boolean;
  restaurantId: string;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sodium?: number;
  };
  preparationTime?: number; // in minutes
  spiceLevel?: 0 | 1 | 2 | 3 | 4 | 5; // 0 = no spice, 5 = very spicy
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isPopular: boolean;
  sortOrder: number;
  toJSON(): any;
}

const MenuItemSchema = new Schema<IMenuItem>({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [100, 'Item name cannot be more than 100 characters']
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: { 
    type: Number, 
    required: true,
    min: [0, 'Price cannot be negative'],
    max: [1000, 'Price cannot exceed $1000']
  },
  category: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  tags: [{ 
    type: String,
    trim: true,
    lowercase: true
  }],
  imageUrl: { 
    type: String,
    match: [/^https?:\/\/.+/, 'Please provide a valid image URL']
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  restaurantId: {
    type: String,
    required: true,
    index: true
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  allergens: [{
    type: String,
    trim: true,
    enum: ['gluten', 'dairy', 'eggs', 'fish', 'shellfish', 'tree-nuts', 'peanuts', 'soy']
  }],
  nutritionalInfo: {
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 }, // in grams
    carbs: { type: Number, min: 0 }, // in grams
    fat: { type: Number, min: 0 }, // in grams
    fiber: { type: Number, min: 0 }, // in grams
    sodium: { type: Number, min: 0 } // in milligrams
  },
  preparationTime: {
    type: Number,
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [120, 'Preparation time cannot exceed 120 minutes']
  },
  spiceLevel: {
    type: Number,
    enum: [0, 1, 2, 3, 4, 5],
    default: 0
  },
  isVegetarian: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  isGlutenFree: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 }
}, { 
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      if ('__v' in ret) delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes for better performance
MenuItemSchema.index({ restaurantId: 1, active: 1 });
MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ tags: 1 });
MenuItemSchema.index({ isPopular: 1 });
MenuItemSchema.index({ price: 1 });
MenuItemSchema.index({ createdAt: -1 });

// Text index for search functionality
MenuItemSchema.index({ 
  name: 'text', 
  description: 'text', 
  ingredients: 'text' 
});

// Static method to find active items
MenuItemSchema.statics.findActiveItems = function(restaurantId?: string) {
  const query: any = { active: true };
  if (restaurantId) query.restaurantId = restaurantId;
  return this.find(query).sort({ sortOrder: 1, name: 1 });
};

// Static method to find items by category
MenuItemSchema.statics.findByCategory = function(category: string, restaurantId?: string) {
  const query: any = { category, active: true };
  if (restaurantId) query.restaurantId = restaurantId;
  return this.find(query).sort({ sortOrder: 1, name: 1 });
};

// Static method to find popular items
MenuItemSchema.statics.findPopularItems = function(restaurantId?: string) {
  const query: any = { isPopular: true, active: true };
  if (restaurantId) query.restaurantId = restaurantId;
  return this.find(query).sort({ sortOrder: 1, name: 1 });
};

// Static method to search items
MenuItemSchema.statics.searchItems = function(searchTerm: string, restaurantId?: string) {
  const query: any = { 
    $text: { $search: searchTerm },
    active: true 
  };
  if (restaurantId) query.restaurantId = restaurantId;
  return this.find(query).sort({ score: { $meta: 'textScore' } });
};

const MenuItem: Model<IMenuItem> = mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
export default MenuItem;

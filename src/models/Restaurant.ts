import mongoose, { Schema, Document, Model } from 'mongoose';
import { PriceRange, OperatingHours } from '@/types/restaurant';

export interface IRestaurant extends Document {
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  phone: string;
  email: string;
  website?: string;
  cuisine: string[];
  priceRange: PriceRange;
  operatingHours: OperatingHours;
  settings: {
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
  };
  active: boolean;
  ownerId: string;
  toJSON(): any;
}

const RestaurantSchema = new Schema<IRestaurant>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Restaurant name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'US' },
    coordinates: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 }
    }
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
  },
  cuisine: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    required: true
  },
  operatingHours: {
    monday: {
      open: { type: String, required: true },
      close: { type: String, required: true },
      closed: { type: Boolean, default: false }
    },
    tuesday: {
      open: { type: String, required: true },
      close: { type: String, required: true },
      closed: { type: Boolean, default: false }
    },
    wednesday: {
      open: { type: String, required: true },
      close: { type: String, required: true },
      closed: { type: Boolean, default: false }
    },
    thursday: {
      open: { type: String, required: true },
      close: { type: String, required: true },
      closed: { type: Boolean, default: false }
    },
    friday: {
      open: { type: String, required: true },
      close: { type: String, required: true },
      closed: { type: Boolean, default: false }
    },
    saturday: {
      open: { type: String, required: true },
      close: { type: String, required: true },
      closed: { type: Boolean, default: false }
    },
    sunday: {
      open: { type: String, required: true },
      close: { type: String, required: true },
      closed: { type: Boolean, default: false }
    }
  },
  settings: {
    allowReservations: { type: Boolean, default: true },
    allowDelivery: { type: Boolean, default: true },
    allowPickup: { type: Boolean, default: true },
    maxPartySize: { type: Number, default: 8, min: 1, max: 20 },
    advanceBookingDays: { type: Number, default: 30, min: 1, max: 365 },
    cancellationPolicy: { type: String, default: '24 hours notice required' },
    paymentMethods: [{ type: String, enum: ['card', 'cash', 'digital_wallet', 'bank_transfer'] }],
    taxRate: { type: Number, default: 0.08, min: 0, max: 0.5 },
    serviceCharge: { type: Number, min: 0, max: 0.5 },
    tipEnabled: { type: Boolean, default: true },
    aiChatEnabled: { type: Boolean, default: true },
    reviewEnabled: { type: Boolean, default: true }
  },
  active: { type: Boolean, default: true },
  ownerId: { type: String, required: true, index: true }
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
RestaurantSchema.index({ ownerId: 1 });
RestaurantSchema.index({ active: 1 });
RestaurantSchema.index({ 'address.city': 1 });
RestaurantSchema.index({ cuisine: 1 });
RestaurantSchema.index({ priceRange: 1 });
RestaurantSchema.index({ createdAt: -1 });

// Text index for search functionality
RestaurantSchema.index({
  name: 'text',
  description: 'text',
  cuisine: 'text'
});

// Static method to find active restaurants
RestaurantSchema.statics.findActiveRestaurants = function() {
  return this.find({ active: true });
};

// Static method to find restaurants by cuisine
RestaurantSchema.statics.findByCuisine = function(cuisine: string) {
  return this.find({ cuisine: { $in: [cuisine] }, active: true });
};

// Static method to find restaurants by location
RestaurantSchema.statics.findByLocation = function(city: string, state?: string) {
  const query: any = { 'address.city': new RegExp(city, 'i'), active: true };
  if (state) query['address.state'] = new RegExp(state, 'i');
  return this.find(query);
};

const Restaurant: Model<IRestaurant> = mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
export default Restaurant;

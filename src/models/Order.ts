import mongoose, { Schema, Document, Model } from 'mongoose';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@/types/order';

export interface IOrder extends Document {
  userId?: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
  }>;
  subtotal: number;
  tax: number;
  tip?: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentIntentId?: string;
  specialInstructions?: string;
  estimatedTime?: number; // in minutes
  restaurantId: string;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliveryFee?: number;
  toJSON(): any;
}

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    index: true
  },
  customerInfo: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Customer name cannot be more than 100 characters']
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number']
    }
  },
  items: [{
    menuItemId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Item price cannot be negative']
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [50, 'Quantity cannot exceed 50']
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [500, 'Special instructions cannot be more than 500 characters']
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative']
  },
  tip: {
    type: Number,
    min: [0, 'Tip cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'digital_wallet', 'bank_transfer']
  },
  paymentIntentId: {
    type: String,
    index: true
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Special instructions cannot be more than 1000 characters']
  },
  estimatedTime: {
    type: Number,
    min: [1, 'Estimated time must be at least 1 minute'],
    max: [480, 'Estimated time cannot exceed 8 hours']
  },
  restaurantId: {
    type: String,
    required: true,
    index: true
  },
  deliveryAddress: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'US' }
  },
  deliveryFee: {
    type: Number,
    min: [0, 'Delivery fee cannot be negative']
  }
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
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ restaurantId: 1, status: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ paymentIntentId: 1 });
OrderSchema.index({ 'customerInfo.email': 1 });
OrderSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate totals
OrderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('tax') || this.isModified('tip')) {
    // Calculate subtotal from items
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate total
    this.total = this.subtotal + this.tax + (this.tip || 0) + (this.deliveryFee || 0);
  }
  next();
});

// Static method to find orders by user
OrderSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find orders by restaurant
OrderSchema.statics.findByRestaurant = function(restaurantId: string, status?: OrderStatus) {
  const query: any = { restaurantId };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find orders by status
OrderSchema.statics.findByStatus = function(status: OrderStatus) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to find recent orders
OrderSchema.statics.findRecentOrders = function(days: number = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.find({ createdAt: { $gte: date } }).sort({ createdAt: -1 });
};

// Instance method to update status
OrderSchema.methods.updateStatus = function(newStatus: OrderStatus) {
  this.status = newStatus;
  return this.save();
};

// Instance method to add tip
OrderSchema.methods.addTip = function(tipAmount: number) {
  this.tip = tipAmount;
  return this.save();
};

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export default Order;

import mongoose, { Schema, Document, Model } from 'mongoose';
import { ReservationStatus } from '@/types/reservation';

export interface IReservation extends Document {
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
  notes?: string;
  toJSON(): any;
}

const ReservationSchema = new Schema<IReservation>({
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
      required: true,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number']
    }
  },
  partySize: {
    type: Number,
    required: true,
    min: [1, 'Party size must be at least 1'],
    max: [20, 'Party size cannot exceed 20']
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  time: {
    type: String,
    required: true,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'],
    default: 'pending',
    index: true
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requests cannot be more than 500 characters']
  },
  tableNumber: {
    type: String,
    trim: true
  },
  restaurantId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
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
ReservationSchema.index({ restaurantId: 1, date: 1 });
ReservationSchema.index({ userId: 1, date: -1 });
ReservationSchema.index({ status: 1, date: 1 });
ReservationSchema.index({ date: 1, time: 1 });
ReservationSchema.index({ 'customerInfo.email': 1 });
ReservationSchema.index({ createdAt: -1 });

// Compound index for finding reservations by date and time
ReservationSchema.index({ restaurantId: 1, date: 1, time: 1 });

// Pre-save middleware to validate date
ReservationSchema.pre('save', function(next) {
  // Ensure date is not in the past
  if (this.date < new Date()) {
    return next(new Error('Reservation date cannot be in the past'));
  }
  next();
});

// Static method to find reservations by restaurant
ReservationSchema.statics.findByRestaurant = function(restaurantId: string, date?: Date) {
  const query: any = { restaurantId };
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    query.date = { $gte: startOfDay, $lte: endOfDay };
  }
  return this.find(query).sort({ date: 1, time: 1 });
};

// Static method to find reservations by user
ReservationSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ date: -1 });
};

// Static method to find reservations by status
ReservationSchema.statics.findByStatus = function(status: ReservationStatus) {
  return this.find({ status }).sort({ date: 1, time: 1 });
};

// Static method to find upcoming reservations
ReservationSchema.statics.findUpcoming = function(restaurantId?: string) {
  const query: any = { 
    date: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] }
  };
  if (restaurantId) query.restaurantId = restaurantId;
  return this.find(query).sort({ date: 1, time: 1 });
};

// Static method to check availability
ReservationSchema.statics.checkAvailability = function(restaurantId: string, date: Date, time: string) {
  return this.findOne({
    restaurantId,
    date,
    time,
    status: { $in: ['pending', 'confirmed', 'seated'] }
  });
};

// Instance method to confirm reservation
ReservationSchema.methods.confirm = function() {
  this.status = 'confirmed';
  return this.save();
};

// Instance method to cancel reservation
ReservationSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Instance method to mark as seated
ReservationSchema.methods.markSeated = function(tableNumber?: string) {
  this.status = 'seated';
  if (tableNumber) this.tableNumber = tableNumber;
  return this.save();
};

const Reservation: Model<IReservation> = mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema);
export default Reservation;

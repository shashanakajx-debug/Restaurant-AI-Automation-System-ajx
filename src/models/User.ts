import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/types/user';

export interface IUser extends Document {
  email: string;
  name?: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: {
    dietaryRestrictions?: string[];
    favoriteCategories?: string[];
    notificationSettings?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    language: string;
    currency: string;
  };
  isActive: boolean;
  lastLogin?: Date;
  emailVerified: boolean;
  comparePassword(candidate: string): Promise<boolean>;
  toJSON(): any;
}

const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: { 
    type: String, 
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  password: { 
    type: String, 
    required: true,
    minlength: [8, 'Password must be at least 8 characters long']
  },
  role: { 
    type: String, 
    enum: ['admin', 'staff', 'customer'], 
    default: 'customer' 
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number']
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'US' }
  },
  preferences: {
    dietaryRestrictions: [{ type: String }],
    favoriteCategories: [{ type: String }],
    notificationSettings: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'USD' }
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  emailVerified: { type: Boolean, default: false }
}, { 
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      // Remove sensitive/internal fields safely
      // Use object rest to avoid TypeScript errors about delete on non-optional properties
      // Convert to any to allow returning a cleaned object
      const { password, __v, ...clean } = ret as any;
      return clean;
    }
  }
});

// Indexes for better performance
// Note: `email` is defined as `unique: true` in the schema above which creates
// an index automatically. Avoid duplicating the same index definition.
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidate, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Static method to find active users
UserSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Static method to find users by role
UserSchema.statics.findByRole = function(role: UserRole) {
  return this.find({ role, isActive: true });
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;

import mongoose, { Schema, Document, Model } from 'mongoose';
import { ChatMessage } from '@/types/ai';

export interface IAISession extends Document {
  userId?: string;
  sessionId: string;
  messages: ChatMessage[];
  context: {
    restaurantId: string;
    currentOrder?: string[];
    preferences?: string[];
    dietaryRestrictions?: string[];
    budget?: number;
    partySize?: number;
  };
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    location?: string;
    deviceType?: string;
  };
  isActive: boolean;
  toJSON(): any;
}

const AISessionSchema = new Schema<IAISession>({
  userId: {
    type: String,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  messages: [{
    id: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [4000, 'Message content cannot exceed 4000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      menuItemIds: [{ type: String }],
      confidence: { type: Number, min: 0, max: 1 },
      intent: { type: String }
    }
  }],
  context: {
    restaurantId: {
      type: String,
      required: true,
      index: true
    },
    currentOrder: [{ type: String }],
    preferences: [{ type: String }],
    dietaryRestrictions: [{ type: String }],
    budget: { type: Number, min: 0 },
    partySize: { type: Number, min: 1, max: 20 }
  },
  metadata: {
    userAgent: { type: String },
    ipAddress: { type: String },
    location: { type: String },
    deviceType: { 
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown']
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
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
AISessionSchema.index({ userId: 1, createdAt: -1 });
AISessionSchema.index({ restaurantId: 1, isActive: 1 });
AISessionSchema.index({ sessionId: 1 });
AISessionSchema.index({ isActive: 1, updatedAt: -1 });
AISessionSchema.index({ createdAt: -1 });

// TTL index to automatically delete old sessions (30 days)
AISessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Pre-save middleware to generate session ID if not provided
AISessionSchema.pre('save', function(next) {
  if (!this.sessionId) {
    this.sessionId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Static method to find active sessions
AISessionSchema.statics.findActiveSessions = function(userId?: string) {
  const query: any = { isActive: true };
  if (userId) query.userId = userId;
  return this.find(query).sort({ updatedAt: -1 });
};

// Static method to find sessions by restaurant
AISessionSchema.statics.findByRestaurant = function(restaurantId: string) {
  return this.find({ 'context.restaurantId': restaurantId, isActive: true }).sort({ updatedAt: -1 });
};

// Static method to find recent sessions
AISessionSchema.statics.findRecentSessions = function(hours: number = 24) {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return this.find({ createdAt: { $gte: date } }).sort({ createdAt: -1 });
};

// Instance method to add message
AISessionSchema.methods.addMessage = function(message: Omit<ChatMessage, 'timestamp'>) {
  this.messages.push({
    ...message,
    timestamp: new Date()
  });
  return this.save();
};

// Instance method to update context
AISessionSchema.methods.updateContext = function(updates: Partial<IAISession['context']>) {
  this.context = { ...this.context, ...updates };
  return this.save();
};

// Instance method to deactivate session
AISessionSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Instance method to get recent messages
AISessionSchema.methods.getRecentMessages = function(limit: number = 10) {
  return this.messages.slice(-limit);
};

const AISession: Model<IAISession> = mongoose.models.AISession || mongoose.model<IAISession>('AISession', AISessionSchema);
export default AISession;

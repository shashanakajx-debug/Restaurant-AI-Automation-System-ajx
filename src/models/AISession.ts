// models/AISession.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { ChatMessage } from '@/types/ai';
import { randomUUID } from 'crypto';

export interface IAISession extends Document {
  userId?: string | null;
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
    deviceType?: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  };
  isActive: boolean;

  // instance methods
  addMessage(message: Omit<ChatMessage, 'timestamp'>): Promise<IAISession>;
  updateContext(updates: Partial<IAISession['context']>): Promise<IAISession>;
  deactivate(): Promise<IAISession>;
  getRecentMessages(limit?: number): ChatMessage[];
}

export interface IAISessionModel extends Model<IAISession> {
  findActiveSessions(userId?: string): Promise<IAISession[]>;
  findByRestaurant(restaurantId: string): Promise<IAISession[]>;
  findRecentSessions(hours?: number): Promise<IAISession[]>;
}

/**
 * Message sub-schema (no _id)
 */
const MessageSchema = new Schema<ChatMessage>(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true, maxlength: [4000, 'Message content cannot exceed 4000 characters'] },
    timestamp: { type: Date, default: Date.now },
    metadata: {
      menuItemIds: [{ type: String }],
      confidence: { type: Number, min: 0, max: 1 },
      intent: { type: String },
    },
  },
  { _id: false }
);

/**
 * Session schema
 */
const AISessionSchema = new Schema<IAISession>(
  {
    userId: { type: String, index: true, default: null },
    sessionId: { type: String, required: true, unique: true, index: true },
    messages: { type: [MessageSchema], default: [] }, // <- default empty array
    context: {
        restaurantId: { type: String, required: true, index: true, default: process.env.DEFAULT_RESTAURANT_ID || 'default' },
      currentOrder: [{ type: String }],
      preferences: [{ type: String }],
      dietaryRestrictions: [{ type: String }],
      budget: { type: Number, min: 0 },
      partySize: { type: Number, min: 1, max: 20 },
    },
    metadata: {
      userAgent: { type: String },
      ipAddress: { type: String },
      location: { type: String },
      deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet', 'unknown'] },
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        // remove mongoose internals
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

/**
 * Indexes
 */
AISessionSchema.index({ userId: 1, createdAt: -1 });
AISessionSchema.index({ 'context.restaurantId': 1, isActive: 1 }); // fixed path
AISessionSchema.index({ sessionId: 1 });
AISessionSchema.index({ isActive: 1, updatedAt: -1 });
AISessionSchema.index({ createdAt: -1 });
// TTL: expire sessions after 30 days
AISessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

/**
 * Pre-save: generate sessionId if missing
 */
AISessionSchema.pre('save', function (next) {
  if (!this.sessionId) {
    try {
      this.sessionId = `ai_${Date.now()}_${randomUUID()}`;
    } catch {
      // fallback if randomUUID unavailable
      this.sessionId = `ai_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }
  }
  next();
});

/**
 * Instance helpers should be defensive: ensure messages is an array
 */
function ensureMessagesArray(doc: any) {
  if (!doc) return;
  if (!Array.isArray(doc.messages)) {
    if (doc.messages && typeof doc.messages === 'object') {
      // try convert map/object -> array
      try {
        doc.messages = Object.values(doc.messages);
      } catch {
        doc.messages = [];
      }
    } else {
      doc.messages = [];
    }
    if (typeof doc.markModified === 'function') doc.markModified('messages');
  }
}

/**
 * Instance methods
 */
AISessionSchema.methods.addMessage = async function (message: Omit<ChatMessage, 'timestamp'>) {
  ensureMessagesArray(this);
  this.messages.push({
    ...message,
    timestamp: new Date(),
  } as ChatMessage);
  if (typeof this.markModified === 'function') this.markModified('messages');
  return this.save();
};

AISessionSchema.methods.updateContext = async function (updates: Partial<IAISession['context']>) {
  this.context = { ...(this.context || {}), ...(updates || {}) };
  if (typeof this.markModified === 'function') this.markModified('context');
  return this.save();
};

AISessionSchema.methods.deactivate = async function () {
  this.isActive = false;
  return this.save();
};

AISessionSchema.methods.getRecentMessages = function (limit: number = 10) {
  ensureMessagesArray(this);
  return this.messages.slice(-limit);
};

/**
 * Static methods
 */
AISessionSchema.statics.findActiveSessions = function (userId?: string) {
  const q: any = { isActive: true };
  if (userId) q.userId = userId;
  return this.find(q).sort({ updatedAt: -1 });
};

AISessionSchema.statics.findByRestaurant = function (restaurantId: string) {
  return this.find({ 'context.restaurantId': restaurantId, isActive: true }).sort({ updatedAt: -1 });
};

AISessionSchema.statics.findRecentSessions = function (hours: number = 24) {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return this.find({ createdAt: { $gte: date } }).sort({ createdAt: -1 });
};

/**
 * Export model
 */
const AISession = (mongoose.models.AISession as IAISession & IAISessionModel) || mongoose.model<IAISession, IAISessionModel>('AISession', AISessionSchema);
export default AISession;
